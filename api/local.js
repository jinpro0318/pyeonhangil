/**
 * 카카오 로컬 검색 프록시 — 카카오맵이 내부적으로 쓰는 것과 같은 API
 *
 * 두 모드를 지원:
 *   1) 키워드 검색  GET /api/local?query=화장실&x=126.99&y=37.57
 *   2) 카테고리 검색 GET /api/local?categoryCode=HP8&x=126.99&y=37.57
 *
 * 카테고리 코드 (카카오 공식):
 *   HP8 병원 · PM9 약국 · SW8 지하철역 · PO3 공공기관 · PK6 주차장
 *   CS2 편의점 · BK9 은행 · CT1 문화시설 · MT1 대형마트
 */

// 카테고리 코드 → 우리 POI 타입 매핑
const CATEGORY_TO_TYPE = {
  HP8: 'hospital',
  PM9: 'pharmacy',
  SW8: 'subway',
  PO3: 'public',
  PK6: 'parking',
  CS2: 'store',
  BK9: 'bank',
  CT1: 'culture',
  MT1: 'mart',
}

// 키워드 → 우리 POI 타입 (정확도 높이려고 자주 쓰는 표현 매핑)
const QUERY_TO_TYPE = {
  화장실: 'toilet',
  공중화장실: 'toilet',
  장애인화장실: 'toilet',
  쉼터: 'rest',
  무더위쉼터: 'rest',
  장수의자: 'rest',
  경로당: 'rest',
  노인복지관: 'rest',
  엘리베이터: 'elev',
  지하철엘리베이터: 'elev',
  횡단보도: 'cross',
  경사로: 'ramp',
  휠체어: 'cross',
  베리어프리: 'cross',
  무장애: 'cross',
}

function normalize(d, type) {
  return {
    id: `kakao_${d.id}`,
    type,
    name: d.place_name,
    lat: Number(d.y),
    lng: Number(d.x),
    address: d.road_address_name || d.address_name,
    phone: d.phone || '',
    categoryName: d.category_name || '',
    distance: d.distance ? Number(d.distance) : null,
    source: '카카오맵',
    url: d.place_url, // 카카오맵 상세 페이지 (영업시간·리뷰·사진)
  }
}

export default async function handler(req, res) {
  const {
    query,
    categoryCode,
    x,
    y,
    radius = 1000,
    type,
    size = '15',
    sort = 'distance',
  } = req.query || {}

  if (!query && !categoryCode) {
    res.status(400).json({ error: 'query 또는 categoryCode 중 하나는 필수입니다' })
    return
  }
  if (!x || !y) {
    res.status(400).json({ error: 'x (lng) 와 y (lat) 가 필요합니다' })
    return
  }

  const key = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_REST_API_KEY
  if (!key) {
    res.status(500).json({ error: 'KAKAO_REST_API_KEY 가 서버에 설정되지 않았어요' })
    return
  }

  const isCategory = !!categoryCode
  const url = new URL(
    isCategory
      ? 'https://dapi.kakao.com/v2/local/search/category.json'
      : 'https://dapi.kakao.com/v2/local/search/keyword.json'
  )
  if (isCategory) url.searchParams.set('category_group_code', categoryCode)
  else url.searchParams.set('query', query)
  url.searchParams.set('x', String(x))
  url.searchParams.set('y', String(y))
  url.searchParams.set('radius', String(Math.min(20000, Number(radius) || 1000)))
  url.searchParams.set('size', String(Math.min(15, Math.max(1, Number(size) || 15))))
  url.searchParams.set('sort', sort === 'accuracy' ? 'accuracy' : 'distance')

  try {
    const r = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } })
    if (!r.ok) {
      const text = await r.text()
      res.status(r.status).json({ error: 'kakao_api_error', detail: text.slice(0, 300) })
      return
    }
    const data = await r.json()
    const inferredType =
      type ||
      (isCategory
        ? CATEGORY_TO_TYPE[categoryCode] || 'public'
        : QUERY_TO_TYPE[query] || 'rest')

    const pois = (data.documents || []).map((d) => normalize(d, inferredType))

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json({
      pois,
      total: data.meta?.total_count || pois.length,
      mode: isCategory ? 'category' : 'keyword',
      query: isCategory ? categoryCode : query,
    })
  } catch (e) {
    res.status(502).json({ error: 'fetch_failed', detail: e.message })
  }
}
