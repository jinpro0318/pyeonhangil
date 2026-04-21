/**
 * 지리 유틸 — 거리 계산, 좌표 정규화
 */

const R_METERS = 6371e3

// 두 좌표(lat,lng) 간 거리 (미터)
export function haversine(a, b) {
  const φ1 = (a.lat * Math.PI) / 180
  const φ2 = (b.lat * Math.PI) / 180
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return 2 * R_METERS * Math.asin(Math.sqrt(x))
}

// 사람이 읽기 좋은 거리 표기
export function formatDistance(meters) {
  if (meters == null || isNaN(meters)) return ''
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

// 도보 분(걸음 상태별 m/min): slow ≈ 50, very-slow ≈ 36, needs-help ≈ 24, stroller ≈ 42
const WALK_SPEED_MPM = {
  slow: 50,
  'very-slow': 36,
  'needs-help': 24,
  stroller: 42,
}

export function estimateMinutes(meters, walkStateId = 'slow') {
  const mpm = WALK_SPEED_MPM[walkStateId] || 50
  return Math.max(1, Math.round(meters / mpm))
}

/**
 * 좌표 배열의 bbox + 패딩(미터)
 * @param {Array<{lat,lng}>} coords
 * @param {number} paddingMeters 좌우상하 여유 (기본 200m)
 */
export function bboxFromCoords(coords, paddingMeters = 200) {
  if (!coords?.length) return null
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
  for (const p of coords) {
    if (p.lat < minLat) minLat = p.lat
    if (p.lat > maxLat) maxLat = p.lat
    if (p.lng < minLng) minLng = p.lng
    if (p.lng > maxLng) maxLng = p.lng
  }
  // 위도 1도 ≈ 111,000m, 경도 1도 ≈ 111,000m × cos(lat)
  const latPad = paddingMeters / 111000
  const meanLat = (minLat + maxLat) / 2
  const lngPad = paddingMeters / (111000 * Math.cos((meanLat * Math.PI) / 180))
  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: minLng - lngPad,
    maxLng: maxLng + lngPad,
  }
}

// bbox 가운데 좌표
export function bboxCenter(b) {
  return { lat: (b.minLat + b.maxLat) / 2, lng: (b.minLng + b.maxLng) / 2 }
}

// 좌표가 bbox 안에 있는지
export function withinBbox(p, b) {
  return p.lat >= b.minLat && p.lat <= b.maxLat && p.lng >= b.minLng && p.lng <= b.maxLng
}
