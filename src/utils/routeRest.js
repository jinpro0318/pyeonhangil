import { haversine } from './geo'

/**
 * 경로상에서 일정 거리마다 가장 가까운 휴식 지점(rest)을 자동 선정
 *
 * @param {Array<{lat,lng}>} coords 경로 좌표 배열
 * @param {Array<{type,lat,lng,_dToRoute,name}>} pois 경로 주변 POI
 * @param {object} options
 *   - intervalMeters: 휴식 지점 간격
 *   - walkState: 'older' | 'wheelchair' | 'visual' | 'stroller' | 'injured'
 * @returns {Array<POI & { distanceFromStart, recommendStop: boolean }>}
 */
export function pickRestStops(coords, pois, options = {}) {
  const { walkState = 'older' } = options

  const intervalByWalk = {
    older: 250,
    wheelchair: 400,
    visual: 300,
    stroller: 500,
    injured: 200,
  }
  const interval = options.intervalMeters ?? intervalByWalk[walkState] ?? 300

  if (!Array.isArray(coords) || coords.length < 2) return []
  if (!Array.isArray(pois) || pois.length === 0) return []

  const cumDist = [0]
  for (let i = 1; i < coords.length; i++) {
    cumDist[i] = cumDist[i - 1] + haversine(coords[i - 1], coords[i])
  }
  const totalDistance = cumDist[cumDist.length - 1]
  if (totalDistance < interval) return []

  const restPois = pois.filter((p) => p.type === 'rest' || p.type === 'toilet')
  if (restPois.length === 0) return []

  const enrichedPois = restPois.map((poi) => {
    let nearestIdx = 0
    let nearestDist = Infinity
    for (let i = 0; i < coords.length; i++) {
      const d = haversine(coords[i], poi)
      if (d < nearestDist) {
        nearestDist = d
        nearestIdx = i
      }
    }
    return {
      ...poi,
      distanceFromStart: cumDist[nearestIdx],
    }
  })

  enrichedPois.sort((a, b) => a.distanceFromStart - b.distanceFromStart)

  const stops = []
  let nextTarget = interval
  while (nextTarget < totalDistance) {
    let best = null
    let bestDelta = Infinity
    for (const poi of enrichedPois) {
      const delta = Math.abs(poi.distanceFromStart - nextTarget)
      if (delta < bestDelta && delta < 150) {
        if (stops.some((s) => Math.abs(s.distanceFromStart - poi.distanceFromStart) < 100)) {
          continue
        }
        bestDelta = delta
        best = poi
      }
    }
    if (best) {
      stops.push({ ...best, recommendStop: true })
    }
    nextTarget += interval
  }

  return stops
}

/**
 * 사용자 현재 위치 기준으로 가장 가까운 휴식 지점 찾기
 *
 * @param {{lat,lng}} userPos
 * @param {Array<POI>} pois
 * @param {number} maxRadius 검색 최대 반경 (m, 기본 100m)
 * @returns {POI | null}
 */
export function findNearestRest(userPos, pois, maxRadius = 100) {
  if (!userPos?.lat || !Array.isArray(pois)) return null
  const restPois = pois.filter((p) => p.type === 'rest')
  if (restPois.length === 0) return null

  let nearest = null
  let nearestDist = Infinity
  for (const poi of restPois) {
    const d = haversine(userPos, poi)
    if (d < nearestDist && d <= maxRadius) {
      nearestDist = d
      nearest = { ...poi, distance: d }
    }
  }
  return nearest
}
