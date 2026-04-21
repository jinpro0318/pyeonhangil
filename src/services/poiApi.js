import { haversine, withinBbox, bboxCenter } from '../utils/geo'

/**
 * POI 통합 fetcher (3계층)
 *  1) 정적 GeoJSON   — /public/data/*.geojson  (오프라인 가능, 즉시 응답)
 *  2) 카카오 로컬     — /api/local              (실시간, 키워드 기반)
 *  3) 정부 공공데이터 — /api/govdata            (data.go.kr 표준데이터, 캐시됨)
 *
 * 호출 모드
 *  - center+radius : 중심 + 반경(m) 으로 조회 → 거리 정렬
 *  - bbox          : 경계상자(경로 주변) 로 조회 → 거리 정렬 안 함
 */

const STATIC_SOURCES = {
  elev: ['/data/subway_elevators.geojson'],
  rest: ['/data/jangsu_chairs.geojson', '/data/heat_shelters_seoul.geojson'],
}

const KAKAO_QUERIES = {
  toilet: ['공중화장실', '장애인화장실'],
  rest: ['무더위쉼터', '경로당', '노인복지관'],
  elev: [],
  cross: ['휠체어', '베리어프리'],
  ramp: ['경사로'],
}

// 카카오 카테고리 코드 (카카오맵이 내부적으로 쓰는 분류)
//   HP8 병원, PM9 약국, SW8 지하철역, PO3 공공기관
const KAKAO_CATEGORIES = {
  hospital: ['HP8'],
  pharmacy: ['PM9'],
  subway: ['SW8'],
  public: ['PO3'],
}

// 정부 공공데이터 ↔ 우리 type 매핑
const GOV_TYPE_MAP = {
  rest: 'heat-shelter',
  toilet: 'public-toilet',
  cross: 'disabled-facility',
}

const cache = new Map()

async function loadGeojson(url) {
  if (cache.has(url)) return cache.get(url)
  const p = fetch(url)
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data?.features) return []
      return data.features
        .filter((f) => f?.geometry?.type === 'Point')
        .map((f) => {
          const [lng, lat] = f.geometry.coordinates
          return {
            id: f.properties.id,
            type: f.properties.type,
            name: f.properties.name,
            description: f.properties.description || '',
            source: f.properties.source || '공공데이터',
            lat,
            lng,
          }
        })
    })
    .catch(() => [])
  cache.set(url, p)
  return p
}

async function fetchKakaoLocal(query, type, center, radius = 1000) {
  if (!center?.lat || !center?.lng) return []
  const url = `/api/local?query=${encodeURIComponent(query)}&x=${center.lng}&y=${center.lat}&radius=${radius}&type=${type}`
  try {
    const r = await fetch(url)
    if (!r.ok) return []
    const data = await r.json()
    return data.pois || []
  } catch {
    return []
  }
}

async function fetchKakaoCategory(categoryCode, type, center, radius = 1000) {
  if (!center?.lat || !center?.lng) return []
  const url = `/api/local?categoryCode=${categoryCode}&x=${center.lng}&y=${center.lat}&radius=${radius}&type=${type}`
  try {
    const r = await fetch(url)
    if (!r.ok) return []
    const data = await r.json()
    return data.pois || []
  } catch {
    return []
  }
}

async function fetchGovData(typeKey, bbox) {
  const govType = GOV_TYPE_MAP[typeKey]
  if (!govType) return []
  const params = new URLSearchParams({ type: govType })
  if (bbox) {
    params.set('minLat', String(bbox.minLat))
    params.set('maxLat', String(bbox.maxLat))
    params.set('minLng', String(bbox.minLng))
    params.set('maxLng', String(bbox.maxLng))
  }
  params.set('limit', '60')
  try {
    const r = await fetch(`/api/govdata?${params}`)
    if (!r.ok) return []
    const data = await r.json()
    return data.pois || []
  } catch {
    return []
  }
}

function dedupAndSort(list, center) {
  // 좌표 5m 이내 + 같은 type 중복 제거
  const dedup = []
  for (const p of list) {
    const dup = dedup.find((d) => d.type === p.type && haversine(d, p) < 5)
    if (!dup) dedup.push(p)
  }
  if (center) {
    dedup.forEach((p) => (p.distance = haversine(center, p)))
    dedup.sort((a, b) => a.distance - b.distance)
  }
  return dedup
}

/**
 * 중심 + 반경 모드
 * @param {{lat,lng}} center
 * @param {number} radius (m)
 * @param {string[]} types
 */
export async function fetchPois({ center, radius = 1500, types = ['rest', 'toilet', 'elev', 'cross'] }) {
  if (!center) return []

  const tasks = []
  for (const t of types) {
    for (const url of STATIC_SOURCES[t] || []) tasks.push(loadGeojson(url))
    for (const q of KAKAO_QUERIES[t] || []) tasks.push(fetchKakaoLocal(q, t, center, radius))
    for (const c of KAKAO_CATEGORIES[t] || []) tasks.push(fetchKakaoCategory(c, t, center, radius))
    if (GOV_TYPE_MAP[t]) tasks.push(fetchGovData(t, null))
  }

  const results = await Promise.all(tasks)
  let merged = results.flat()
  merged = merged
    .map((p) => ({ ...p, distance: haversine(center, p) }))
    .filter((p) => p.distance <= radius)

  return dedupAndSort(merged, center)
}

/**
 * 경로 주변 모드 (bbox)
 * @param {object} bbox {minLat,maxLat,minLng,maxLng}
 * @param {string[]} types
 */
export async function fetchPoisInBbox({ bbox, types = ['rest', 'toilet', 'elev', 'cross'] }) {
  if (!bbox) return []
  const center = bboxCenter(bbox)
  // bbox 대각선 길이의 절반을 카카오 radius로 사용
  const diag = haversine(
    { lat: bbox.minLat, lng: bbox.minLng },
    { lat: bbox.maxLat, lng: bbox.maxLng }
  )
  const radius = Math.min(20000, Math.max(500, Math.ceil(diag / 2)))

  const tasks = []
  for (const t of types) {
    for (const url of STATIC_SOURCES[t] || []) tasks.push(loadGeojson(url))
    for (const q of KAKAO_QUERIES[t] || []) tasks.push(fetchKakaoLocal(q, t, center, radius))
    for (const c of KAKAO_CATEGORIES[t] || []) tasks.push(fetchKakaoCategory(c, t, center, radius))
    if (GOV_TYPE_MAP[t]) tasks.push(fetchGovData(t, bbox))
  }

  const results = await Promise.all(tasks)
  const merged = results.flat().filter((p) => withinBbox(p, bbox))
  return dedupAndSort(merged, center)
}
