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
