import { haversine } from '../utils/geo'

/**
 * POI 통합 fetcher
 * - 카카오 로컬 검색 (서버 프록시: /api/local) — 화장실/쉼터/약국 등
 * - 정적 GeoJSON (/data/*.geojson) — 지하철 엘리베이터/장수의자/무더위쉼터
 * - 좌표 거리 필터 + 거리 정렬
 */

const STATIC_SOURCES = {
  elev: ['/data/subway_elevators.geojson'],
  rest: ['/data/jangsu_chairs.geojson', '/data/heat_shelters_seoul.geojson'],
}

const KAKAO_QUERIES = {
  toilet: ['공중화장실', '장애인화장실'],
  rest: ['무더위쉼터'],
  elev: [], // 카카오 키워드는 정확도 낮음 → 정적만
  cross: [],
  ramp: ['경사로'],
}

const cache = new Map() // url → Promise<Poi[]>

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

async function fetchKakaoLocal(query, type, center) {
  if (!center?.lat || !center?.lng) return []
  const url = `/api/local?query=${encodeURIComponent(query)}&x=${center.lng}&y=${center.lat}&radius=1000&type=${type}`
  try {
    const r = await fetch(url)
    if (!r.ok) return []
    const data = await r.json()
    return data.pois || []
  } catch {
    return []
  }
}

/**
 * @param {object} opts
 * @param {{lat:number,lng:number}} opts.center
 * @param {number} [opts.radius=1500] 미터
 * @param {string[]} [opts.types]
 * @returns {Promise<Poi[]>} 거리 정렬, 중복 제거
 */
export async function fetchPois({ center, radius = 1500, types = ['rest', 'toilet', 'elev', 'cross'] }) {
  if (!center) return []

  const tasks = []

  for (const t of types) {
    // 정적 데이터
    for (const url of STATIC_SOURCES[t] || []) {
      tasks.push(loadGeojson(url))
    }
    // 카카오 키워드
    for (const q of KAKAO_QUERIES[t] || []) {
      tasks.push(fetchKakaoLocal(q, t, center))
    }
  }

  const results = await Promise.all(tasks)
  let merged = results.flat()

  // 거리 계산 + 반경 내만
  merged = merged
    .map((p) => ({ ...p, distance: haversine(center, p) }))
    .filter((p) => p.distance <= radius)

  // 중복 제거 (같은 좌표 5m 이내 + 같은 타입)
  const dedup = []
  for (const p of merged) {
    const dup = dedup.find(
      (d) => d.type === p.type && haversine(d, p) < 5
    )
    if (!dup) dedup.push(p)
  }

  // 거리 오름차순
  dedup.sort((a, b) => a.distance - b.distance)
  return dedup
}
