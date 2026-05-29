/**
 * 커뮤니티 제보 저장소 (localStorage 기반)
 *
 * 카테고리 두 종:
 *   - hazard:   길 위험 제보 (공사·계단·통행불가 등) → 경로 위 경고
 *   - facility: 편의시설 알리기 (쉼터·화장실·엘리베이터 등) → 지도 POI로 추가
 *
 * 메타:
 *   - photoUrl: Firebase Storage 업로드된 사진 URL (선택)
 *   - 72시간 자동 만료
 */

const KEY = 'pyeonhangil_reports'
const TTL_HOURS = 72

// 길 위험 — 빨강 계열, 경로에서 피해야 할 대상
export const HAZARD_TYPES = {
  construction: { label: '공사중',         emoji: '🚧', color: '#F97316' },
  blocked:      { label: '통행불가',       emoji: '🚫', color: '#EF4444' },
  stairs:       { label: '계단/턱',        emoji: '🪜', color: '#A855F7' },
  slope:        { label: '가파른 경사',     emoji: '⛰️', color: '#F59E0B' },
  flood:        { label: '침수/물웅덩이',   emoji: '💧', color: '#0EA5E9' },
  other:        { label: '기타 위험',       emoji: '⚠️', color: '#6366F1' },
}

// 편의시설 — 초록 계열, 지도 POI 로 추가됨
// type 값은 src/data/pois.js 의 POI_TYPES 와 일치해야 마커가 자동 매칭됨
export const FACILITY_TYPES = {
  rest:   { label: '쉼터',         emoji: '🪑', color: '#22C55E' },
  toilet: { label: '화장실',        emoji: '🚻', color: '#3182F6' },
  elev:   { label: '엘리베이터',    emoji: '🛗', color: '#A855F7' },
  ramp:   { label: '경사로',        emoji: '📐', color: '#F59E0B' },
  cross:  { label: '무장애 시설',   emoji: '🚸', color: '#F04452' },
}

// 하위 호환 — 기존 코드는 REPORT_TYPES 로 hazard 만 참조
export const REPORT_TYPES = HAZARD_TYPES

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

export function getActiveHazards() {
  return getActiveReports().filter((r) => (r.category || 'hazard') === 'hazard')
}

export function getActiveFacilities() {
  return getActiveReports().filter((r) => r.category === 'facility')
}

export function addReport({ lat, lng, type, category = 'hazard', description, photoUrl }) {
  if (!lat || !lng || !type) throw new Error('lat/lng/type required')
  if (category !== 'hazard' && category !== 'facility') {
    throw new Error('category must be hazard or facility')
  }
  const all = load()
  const entry = {
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    lat: Number(lat),
    lng: Number(lng),
    type,
    category,
    description: (description || '').slice(0, 200),
    photoUrl: photoUrl || null,
    timestamp: Date.now(),
    agrees: 0,
  }
  all.unshift(entry)
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

/**
 * 제보 → 지도용 POI 변환
 *  - hazard: type='report' 로 빨강 위험 마커 (useKakaoMap 가 'report' 처리)
 *  - facility: 사용자가 선택한 POI 타입(rest/toilet/elev/ramp/cross) 그대로
 *              → 일반 POI 와 동일하게 색상·아이콘 적용됨
 */
export function reportToPoi(r) {
  const isFacility = r.category === 'facility'
  const meta = isFacility ? FACILITY_TYPES[r.type] : HAZARD_TYPES[r.type]
  return {
    id: r.id,
    type: isFacility ? r.type : 'report',
    reportType: r.type,
    reportCategory: r.category || 'hazard',
    name: meta?.label || (isFacility ? '편의시설' : '제보'),
    description: r.description,
    photoUrl: r.photoUrl || null,
    lat: r.lat,
    lng: r.lng,
    timestamp: r.timestamp,
    source: isFacility ? '사용자 등록 편의시설' : '커뮤니티 제보',
  }
}
