/**
 * 편한길 POI 샘플 데이터
 * 실제 서비스에서는 공공데이터포털 API로 대체
 * (장애인 편의시설 표준데이터 등)
 */

export const POI_TYPES = {
  rest: { label: '쉼터', emoji: '🪑', color: '#22C55E' },
  toilet: { label: '화장실', emoji: '🚻', color: '#3182F6' },
  cross: { label: '무장애 시설', emoji: '🚸', color: '#F04452' },
  elev: { label: '엘리베이터', emoji: '🛗', color: '#A855F7' },
  ramp: { label: '경사로', emoji: '📐', color: '#F59E0B' },
  hospital: { label: '병원', emoji: '🏥', color: '#EF4444' },
  pharmacy: { label: '약국', emoji: '💊', color: '#06B6D4' },
  subway: { label: '지하철역', emoji: '🚇', color: '#0EA5E9' },
  public: { label: '공공기관', emoji: '🏛️', color: '#6366F1' },
}

// 서울 종로구 인근 샘플 POI
export const SAMPLE_POIS = [
  {
    id: 'poi_1',
    type: 'rest',
    name: '장수의자',
    lat: 37.5712,
    lng: 126.9910,
    source: '종로구청',
    status: 'available',
    description: '그늘 있음 · 자리 2개',
  },
  {
    id: 'poi_2',
    type: 'rest',
    name: '온열의자',
    lat: 37.5695,
    lng: 126.9945,
    source: '서울시',
    status: 'available',
    description: '정류장 근처 · 온열 기능',
  },
  {
    id: 'poi_3',
    type: 'cross',
    name: '안전 횡단보도',
    lat: 37.5700,
    lng: 126.9918,
    source: '경찰청',
    status: 'available',
    description: '보행신호 자동연장',
  },
  {
    id: 'poi_4',
    type: 'toilet',
    name: '무장애 화장실',
    lat: 37.5718,
    lng: 126.9935,
    source: '보건복지부',
    status: 'available',
    description: '24시간 · 휠체어 가능',
  },
  {
    id: 'poi_5',
    type: 'rest',
    name: '무더위쉼터',
    lat: 37.5688,
    lng: 126.9915,
    source: '행정안전부',
    status: 'available',
    description: '실내 · 에어컨',
  },
  {
    id: 'poi_6',
    type: 'elev',
    name: '지하철 엘리베이터',
    lat: 37.5702,
    lng: 126.9895,
    source: '서울교통공사',
    status: 'available',
    description: '종로3가역 5번 출구',
  },
]

export const QUICK_DESTINATIONS = [
  { id: 'q1', emoji: '🚻', label: '화장실', type: 'toilet' },
  { id: 'q2', emoji: '🪑', label: '쉼터', type: 'rest' },
  { id: 'q3', emoji: '🛗', label: '엘리베이터', type: 'elev' },
]
