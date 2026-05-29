import {
  PersonStanding, Accessibility, Glasses, Baby, Bandage,
  Armchair, Toilet, ArrowUpDown, TrendingUp, Hospital, Pill, TrainFront, Landmark,
  TrafficCone, Ban, Mountain, Droplets, TriangleAlert,
  House, ShoppingCart, Church, TreePine, UtensilsCrossed, Coffee, School, Star, MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 편한길 아이콘·색상 단일 카탈로그
 * - 앱 전역의 모든 "이모지 아이콘"을 일관된 Lucide 아이콘 + 시맨틱 tone 으로 대체
 * - tone 은 Tailwind 토큰(또는 빌트인 팔레트) 리터럴 클래스로 매핑 → 하드코딩 hex 제거
 * - <IconBadge Icon tone /> 하나로 앱 전체 배지/타일/마커 룩을 통일
 */

// tone → Tailwind 리터럴 클래스 (JIT 스캔 대상이므로 동적 조합 금지, 전체 문자열 유지)
export const TONES = {
  primary: { soft: 'bg-primary-50 text-primary-600',  solid: 'bg-primary text-white',     line: 'text-primary-600',  dot: 'bg-primary',     hex: '#1A8FE3' },
  emerald: { soft: 'bg-emerald-100 text-emerald-600', solid: 'bg-emerald-500 text-white', line: 'text-emerald-600',  dot: 'bg-emerald-500', hex: '#22C55E' },
  blue:    { soft: 'bg-blue-100 text-blue-600',       solid: 'bg-blue-500 text-white',    line: 'text-blue-600',     dot: 'bg-blue-500',    hex: '#3182F6' },
  sky:     { soft: 'bg-sky-100 text-sky-600',         solid: 'bg-sky-500 text-white',     line: 'text-sky-600',      dot: 'bg-sky-500',     hex: '#0EA5E9' },
  cyan:    { soft: 'bg-cyan-100 text-cyan-700',       solid: 'bg-cyan-500 text-white',    line: 'text-cyan-700',     dot: 'bg-cyan-500',    hex: '#06B6D4' },
  violet:  { soft: 'bg-violet-100 text-violet-600',   solid: 'bg-violet-500 text-white',  line: 'text-violet-600',   dot: 'bg-violet-500',  hex: '#A855F7' },
  indigo:  { soft: 'bg-indigo-100 text-indigo-600',   solid: 'bg-indigo-500 text-white',  line: 'text-indigo-600',   dot: 'bg-indigo-500',  hex: '#6366F1' },
  amber:   { soft: 'bg-amber-100 text-amber-600',     solid: 'bg-amber-500 text-white',   line: 'text-amber-600',    dot: 'bg-amber-500',   hex: '#F59E0B' },
  orange:  { soft: 'bg-orange-100 text-orange-600',   solid: 'bg-orange-500 text-white',  line: 'text-orange-600',   dot: 'bg-orange-500',  hex: '#F97316' },
  rose:    { soft: 'bg-rose-100 text-rose-600',       solid: 'bg-rose-500 text-white',    line: 'text-rose-600',     dot: 'bg-rose-500',    hex: '#F04452' },
  red:     { soft: 'bg-red-100 text-red-600',         solid: 'bg-red-500 text-white',     line: 'text-red-600',      dot: 'bg-red-500',     hex: '#EF4444' },
  success: { soft: 'bg-success-50 text-success-600',  solid: 'bg-success text-white',     line: 'text-success-600',  dot: 'bg-success',     hex: '#3EBE6E' },
  warning: { soft: 'bg-warning-50 text-warning-600',  solid: 'bg-warning text-white',     line: 'text-warning-600',  dot: 'bg-warning',     hex: '#E85D24' },
  danger:  { soft: 'bg-danger-50 text-danger-600',    solid: 'bg-danger text-white',      line: 'text-danger-600',   dot: 'bg-danger',      hex: '#DC2626' },
}

// lucide 에 stairs 아이콘이 없어 동일 룩(24x24·currentColor·stroke 2)으로 직접 정의
export function Stairs({ strokeWidth = 2, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      {...props}
    >
      <path d="M3 20h4v-5h4v-5h4V5h5" />
    </svg>
  )
}

// 5종 페르소나 (WALK_STATES 의 id 와 1:1)
export const WALK_ICONS = {
  older:      { Icon: PersonStanding, tone: 'success' },
  wheelchair: { Icon: Accessibility,  tone: 'primary' },
  visual:     { Icon: Glasses,        tone: 'warning' },
  stroller:   { Icon: Baby,           tone: 'violet' },
  injured:    { Icon: Bandage,        tone: 'danger' },
}

// 무장애 시설 / POI 타입 (POI_TYPES 의 key 와 1:1)
export const POI_ICONS = {
  rest:     { Icon: Armchair,      tone: 'emerald' },
  toilet:   { Icon: Toilet,        tone: 'blue' },
  cross:    { Icon: Accessibility, tone: 'rose' },
  elev:     { Icon: ArrowUpDown,   tone: 'violet' },
  ramp:     { Icon: TrendingUp,    tone: 'amber' },
  hospital: { Icon: Hospital,      tone: 'red' },
  pharmacy: { Icon: Pill,          tone: 'cyan' },
  subway:   { Icon: TrainFront,    tone: 'sky' },
  public:   { Icon: Landmark,      tone: 'indigo' },
}

// 커뮤니티 위험 제보 타입 (HAZARD_TYPES 의 key 와 1:1)
export const HAZARD_ICONS = {
  construction: { Icon: TrafficCone,  tone: 'orange' },
  blocked:      { Icon: Ban,          tone: 'red' },
  stairs:       { Icon: Stairs,       tone: 'violet' },
  slope:        { Icon: Mountain,     tone: 'amber' },
  flood:        { Icon: Droplets,     tone: 'sky' },
  other:        { Icon: TriangleAlert, tone: 'indigo' },
}

// 즐겨찾기 아이콘 선택지 (이모지 피커 대체)
export const FAVORITE_ICONS = [
  { key: 'home',     Icon: House,           tone: 'primary', label: '집' },
  { key: 'hospital', Icon: Hospital,        tone: 'red',     label: '병원' },
  { key: 'cart',     Icon: ShoppingCart,    tone: 'emerald', label: '마트' },
  { key: 'public',   Icon: Landmark,        tone: 'indigo',  label: '관공서' },
  { key: 'church',   Icon: Church,          tone: 'violet',  label: '종교시설' },
  { key: 'park',     Icon: TreePine,        tone: 'success', label: '공원' },
  { key: 'food',     Icon: UtensilsCrossed, tone: 'amber',   label: '식당' },
  { key: 'cafe',     Icon: Coffee,          tone: 'orange',  label: '카페' },
  { key: 'pharmacy', Icon: Pill,            tone: 'cyan',    label: '약국' },
  { key: 'station',  Icon: TrainFront,      tone: 'sky',     label: '역' },
  { key: 'school',   Icon: School,          tone: 'blue',    label: '학교' },
  { key: 'star',     Icon: Star,            tone: 'amber',   label: '기타' },
]

// 기존 localStorage 에 저장된 이모지 → 아이콘 key 매핑 (하위 호환)
const LEGACY_EMOJI_TO_KEY = {
  '🏠': 'home', '🏥': 'hospital', '🛒': 'cart', '🏛️': 'public', '⛪': 'church',
  '🌳': 'park', '🍚': 'food', '☕': 'cafe', '💊': 'pharmacy', '🚉': 'station',
  '🏫': 'school', '⭐': 'star',
}

const FALLBACK = { Icon: MapPin, tone: 'primary' }

export const walkIcon = (id) => WALK_ICONS[id] || FALLBACK
export const poiIcon = (type) => POI_ICONS[type] || FALLBACK
export const hazardIcon = (type) => HAZARD_ICONS[type] || HAZARD_ICONS.other

// 시설 제보는 POI 와 동일 매핑, 위험 제보는 HAZARD 매핑
export const reportIcon = (type, category = 'hazard') =>
  category === 'facility' ? poiIcon(type) : hazardIcon(type)

// 즐겨찾기: 신규 icon key 우선, 없으면 레거시 이모지 매핑, 그래도 없으면 별
export const favoriteIcon = (fav) => {
  const key = fav?.icon || LEGACY_EMOJI_TO_KEY[fav?.emoji]
  return FAVORITE_ICONS.find((f) => f.key === key) || FAVORITE_ICONS[FAVORITE_ICONS.length - 1]
}

const BADGE_SIZES = {
  xs: 'w-7 h-7 rounded-lg [&_svg]:w-4 [&_svg]:h-4',
  sm: 'w-9 h-9 rounded-lg [&_svg]:w-5 [&_svg]:h-5',
  md: 'w-11 h-11 rounded-xl [&_svg]:w-[22px] [&_svg]:h-[22px]',
  lg: 'w-14 h-14 rounded-2xl [&_svg]:w-7 [&_svg]:h-7',
  xl: 'w-16 h-16 rounded-[20px] [&_svg]:w-8 [&_svg]:h-8',
  '2xl': 'w-20 h-20 rounded-[24px] [&_svg]:w-10 [&_svg]:h-10',
}

/**
 * 앱 전역 아이콘 배지 — 둥근 사각형 + 톤 배경 + 컬러 아이콘
 * @param {object} Icon   lucide(또는 호환) 컴포넌트
 * @param {string} tone   TONES key
 * @param {'soft'|'solid'} variant
 * @param {keyof BADGE_SIZES} size
 */
export function IconBadge({ Icon, tone = 'primary', variant = 'soft', size = 'md', strokeWidth = 2.2, className, ...props }) {
  const t = TONES[tone] || TONES.primary
  return (
    <span
      aria-hidden="true"
      className={cn('inline-grid place-items-center shrink-0', BADGE_SIZES[size] || BADGE_SIZES.md, variant === 'solid' ? t.solid : t.soft, className)}
      {...props}
    >
      {Icon ? <Icon strokeWidth={strokeWidth} /> : null}
    </span>
  )
}
