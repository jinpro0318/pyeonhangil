/**
 * 도보 경로 프록시
 * POST /api/route  body: { origin: {lat,lng}, destination: {lat,lng} }
 *
 * 우선순위:
 *   1) Tmap 보행자 경로 (TMAP_APP_KEY)          — 실제 한국 보행자 도로
 *   2) OSRM foot 프로파일 (무키, OpenStreetMap)  — 실제 도보 경로
 *   3) 카카오 자동차 길찾기 (KAKAO_REST_API_KEY)  — 큰길 근사치 (최후)
 *   4) 직선 폴백
 *
 * 응답: { coords: [{lat,lng}, ...], distanceMeters, durationSeconds, source }
 */

const STRAIGHT_FALLBACK = (origin, destination) => {
  const mid = {
    lat: (origin.lat + destination.lat) / 2,
    lng: (origin.lng + destination.lng) / 2,
  }
  const distM = haversine(origin, destination)
  return {
    coords: [origin, mid, destination],
    distanceMeters: Math.round(distM),
    durationSeconds: Math.round(distM / 1.0), // 1m/s 가정
    source: 'straight',
  }
}

function haversine(a, b) {
  const R = 6371e3
  const φ1 = (a.lat * Math.PI) / 180
  const φ2 = (b.lat * Math.PI) / 180
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

async function tryTmap(origin, destination, key) {
  const url = 'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json'
  const body = {
    startX: String(origin.lng),
    startY: String(origin.lat),
    endX: String(destination.lng),
    endY: String(destination.lat),
    reqCoordType: 'WGS84GEO',
    resCoordType: 'WGS84GEO',
    startName: '출발',
    endName: '도착',
  }
  const r = await fetch(url, {
    method: 'POST',
    headers: { appKey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`tmap ${r.status}`)
  const data = await r.json()
  const coords = []
  let distanceMeters = 0
  let durationSeconds = 0
  for (const f of data.features || []) {
    if (f.properties?.totalDistance) distanceMeters = f.properties.totalDistance
    if (f.properties?.totalTime) durationSeconds = f.properties.totalTime
    if (f.geometry?.type === 'LineString') {
      for (const [lng, lat] of f.geometry.coordinates) coords.push({ lat, lng })
    } else if (f.geometry?.type === 'Point') {
      const [lng, lat] = f.geometry.coordinates
      coords.push({ lat, lng })
    }
  }
  return { coords, distanceMeters, durationSeconds, source: 'tmap' }
}

// OSRM 공개 데모 서버 — foot 프로파일 (도보)
// OpenStreetMap 데이터 기반으로 실제 인도/보행자 길을 따라 경로 계산
async function tryOSRMFoot(origin, destination) {
  const url =
    `https://router.project-osrm.org/route/v1/foot/` +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?overview=full&geometries=geojson&steps=false`
  const r = await fetch(url, { headers: { 'User-Agent': 'pyeonhangil/1.0' } })
  if (!r.ok) throw new Error(`osrm ${r.status}`)
  const data = await r.json()
  if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error(`osrm ${data.code || 'no route'}`)
  const route = data.routes[0]
  const coords = (route.geometry?.coordinates || []).map(([lng, lat]) => ({ lat, lng }))
  if (coords.length < 2) throw new Error('osrm empty')
  return {
    coords,
    distanceMeters: Math.round(route.distance || 0),
    durationSeconds: Math.round(route.duration || 0),
    source: 'osrm-foot',
  }
}

async function tryKakaoDriving(origin, destination, key) {
  const url = new URL('https://apis-navi.kakaomobility.com/v1/directions')
  url.searchParams.set('origin', `${origin.lng},${origin.lat}`)
  url.searchParams.set('destination', `${destination.lng},${destination.lat}`)
  url.searchParams.set('priority', 'RECOMMEND')
  const r = await fetch(url, {
    headers: { Authorization: `KakaoAK ${key}` },
  })
  if (!r.ok) throw new Error(`kakao ${r.status}`)
  const data = await r.json()
  const route = data.routes?.[0]
  if (!route || !route.sections) throw new Error('no route')

  const coords = []
  let distanceMeters = route.summary?.distance || 0
  let durationSeconds = route.summary?.duration || 0
  for (const sec of route.sections) {
    for (const road of sec.roads || []) {
      const v = road.vertexes || []
      for (let i = 0; i < v.length; i += 2) {
        coords.push({ lng: v[i], lat: v[i + 1] })
      }
    }
  }
  // 자동차 길찾기는 도보 시간이 다르므로 도보 속도(1m/s)로 재계산
  durationSeconds = Math.round(distanceMeters / 1.0)
  return { coords, distanceMeters, durationSeconds, source: 'kakao-driving' }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' })
    return
  }

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch {}
  }
  const { origin, destination, mode = 'walk' } = body || {}

  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
    res.status(400).json({ error: 'origin/destination {lat,lng} required' })
    return
  }

  const tmapKey = process.env.TMAP_APP_KEY
  const kakaoKey = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_REST_API_KEY

  const send = (out) => {
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300')
    res.status(200).json(out)
  }

  // 차량 모드: 카카오 자동차 우선
  if (mode === 'car') {
    if (kakaoKey) {
      try {
        const out = await tryKakaoDriving(origin, destination, kakaoKey)
        if (out.coords.length >= 2) { send(out); return }
      } catch (e) { console.warn('[route] car/kakao failed', e.message) }
    }
    res.status(200).json(STRAIGHT_FALLBACK(origin, destination))
    return
  }

  // 대중교통: 공개 JSON API 없음 → 직선 + 외부 링크 힌트
  if (mode === 'transit') {
    const out = STRAIGHT_FALLBACK(origin, destination)
    out.source = 'transit-external'
    out.externalUrl = `https://map.kakao.com/?sX=${origin.lng}&sY=${origin.lat}&eX=${destination.lng}&eY=${destination.lat}&target=traffic`
    res.status(200).json(out)
    return
  }

  // 도보 (기본): Tmap → OSRM → 카카오 차량 근사 → 직선
  if (tmapKey) {
    try {
      const out = await tryTmap(origin, destination, tmapKey)
      if (out.coords.length >= 2) { send(out); return }
    } catch (e) { console.warn('[route] tmap failed', e.message) }
  }
  try {
    const out = await tryOSRMFoot(origin, destination)
    if (out.coords.length >= 2) { send(out); return }
  } catch (e) { console.warn('[route] osrm failed', e.message) }
  if (kakaoKey) {
    try {
      const out = await tryKakaoDriving(origin, destination, kakaoKey)
      if (out.coords.length >= 2) { send(out); return }
    } catch (e) { console.warn('[route] kakao failed', e.message) }
  }
  res.status(200).json(STRAIGHT_FALLBACK(origin, destination))
}
