/**
 * 카카오 로컬 검색 프록시
 * GET /api/local?query=화장실&x=126.99&y=37.57&radius=1000&type=toilet
 *
 * - 카카오 REST 키를 서버에서만 보유 (KAKAO_REST_API_KEY 환경변수)
 * - 응답을 편한길 POI 스키마로 정규화
 */

const POI_TYPE_BY_QUERY = {
  화장실: 'toilet',
  공중화장실: 'toilet',
  쉼터: 'rest',
  무더위쉼터: 'rest',
  장수의자: 'rest',
  엘리베이터: 'elev',
  지하철엘리베이터: 'elev',
  횡단보도: 'cross',
  경사로: 'ramp',
}

export default async function handler(req, res) {
  const { query, x, y, radius = 1000, type } = req.query || {}

  if (!query) {
    res.status(400).json({ error: 'query is required' })
    return
  }
  if (!x || !y) {
    res.status(400).json({ error: 'x (lng) and y (lat) are required' })
    return
  }

  const key = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_REST_API_KEY
  if (!key) {
    res.status(500).json({ error: 'KAKAO_REST_API_KEY 가 서버에 설정되지 않았어요' })
    return
  }

  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json')
  url.searchParams.set('query', query)
  url.searchParams.set('x', String(x))
  url.searchParams.set('y', String(y))
  url.searchParams.set('radius', String(Math.min(20000, Number(radius) || 1000)))
  url.searchParams.set('size', '15')
  url.searchParams.set('sort', 'distance')

  try {
    const r = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
    })
    if (!r.ok) {
      const text = await r.text()
      res.status(r.status).json({ error: 'kakao_api_error', detail: text.slice(0, 300) })
      return
    }
    const data = await r.json()
    const inferredType = type || POI_TYPE_BY_QUERY[query] || 'rest'

    const pois = (data.documents || []).map((d) => ({
      id: `kakao_${d.id}`,
      type: inferredType,
      name: d.place_name,
      lat: Number(d.y),
      lng: Number(d.x),
      address: d.road_address_name || d.address_name,
      phone: d.phone || '',
      categoryName: d.category_name || '',
      distance: d.distance ? Number(d.distance) : null,
      source: '카카오 로컬',
      url: d.place_url,
    }))

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json({ pois, total: data.meta?.total_count || pois.length })
  } catch (e) {
    res.status(502).json({ error: 'fetch_failed', detail: e.message })
  }
}
