/**
 * 커뮤니티 도로 제보 저장소 (localStorage 기반)
 * - 공사중/통행불가/계단/경사/기타
 * - 다른 기기와는 비동기, MVP 단계에서는 단일 기기 공유
 */

const KEY = 'pyeonhangil_reports'
const TTL_HOURS = 72 // 72시간 지나면 자동 숨김

export const REPORT_TYPES = {
  construction: { label: '공사중', emoji: '🚧', color: '#F97316' },
  blocked: { label: '통행불가', emoji: '🚫', color: '#EF4444' },
  stairs: { label: '계단/턱', emoji: '🪜', color: '#A855F7' },
  slope: { label: '가파른 경사', emoji: '⛰️', color: '#F59E0B' },
  flood: { label: '침수/물웅덩이', emoji: '💧', color: '#0EA5E9' },
  other: { label: '기타', emoji: '⚠️', color: '#6366F1' },
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {}
}

export function getActiveReports() {
  const cutoff = Date.now() - TTL_HOURS * 3600 * 1000
  return load()
    .filter((r) => r.timestamp >= cutoff)
    .sort((a, b) => b.timestamp - a.timestamp)
}

export function addReport({ lat, lng, type, description }) {
  if (!lat || !lng || !type) throw new Error('lat/lng/type required')
  const all = load()
  const entry = {
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    lat: Number(lat),
    lng: Number(lng),
    type,
    description: (description || '').slice(0, 200),
    timestamp: Date.now(),
    agrees: 0,
  }
  all.unshift(entry)
  // 최대 500건
  save(all.slice(0, 500))
  return entry
}

export function removeReport(id) {
  save(load().filter((r) => r.id !== id))
}

export function agreeReport(id) {
  const all = load()
  const r = all.find((x) => x.id === id)
  if (r) {
    r.agrees = (r.agrees || 0) + 1
    save(all)
  }
}

// 지도 POI 포맷으로 변환 (useKakaoMap 에 넣으면 자동 렌더)
export function reportToPoi(r) {
  return {
    id: r.id,
    type: 'report',
    reportType: r.type,
    name: REPORT_TYPES[r.type]?.label || '제보',
    description: r.description,
    lat: r.lat,
    lng: r.lng,
    timestamp: r.timestamp,
    source: '커뮤니티 제보',
  }
}
