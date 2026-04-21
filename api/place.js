/**
 * 카카오맵 장소 상세 프록시
 * GET /api/place?id={kakaoPlaceId}
 *
 * 카카오 로컬 검색 응답의 d.id (예: "1234567890") 를 그대로 넘기면
 * 카카오맵이 내부적으로 쓰는 상세 정보(영업시간·사진·평점·휠체어 진입 등)를
 * 정규화해서 돌려준다.
 *
 * ⚠️ 카카오의 비공식 endpoint 라 spec 변경 가능성이 있음.
 *    실패해도 기존 기본 정보(전화·주소·카테고리)는 그대로 표시됨.
 */

const PLACE_ENDPOINT = (id) => `https://place.map.kakao.com/main/v/${id}`

function normalizeHours(openHourBlock) {
  if (!openHourBlock?.periodList?.length) return null
  // 요일별 영업시간 배열로 정리
  return openHourBlock.periodList.map((p) => ({
    day: p.timeName || '',
    open: p.timeList?.[0]?.timeSE || p.timeSE || '',
  }))
}

function normalizeAccessibility(convInfo) {
  if (!convInfo) return []
  const labels = []
  // 카카오의 conv 정보는 "휠체어 가능", "주차 가능" 등 토글 형태
  if (convInfo.wheelchair || convInfo.disableParking) labels.push('휠체어 진입 가능')
  if (convInfo.disabledToilet) labels.push('장애인 화장실')
  if (convInfo.elevator) labels.push('엘리베이터')
  if (convInfo.parking) labels.push('주차 가능')
  if (convInfo.smokingroom === false) labels.push('금연')
  return labels
}

export default async function handler(req, res) {
  const { id } = req.query || {}

  if (!id) {
    res.status(400).json({ error: 'id 가 필요합니다 (카카오 placeId)' })
    return
  }

  // kakao_12345 형식으로 들어오면 prefix 제거
  const placeId = String(id).replace(/^kakao_/, '')
  if (!/^\d+$/.test(placeId)) {
    res.status(400).json({ error: 'placeId 는 숫자여야 합니다' })
    return
  }

  try {
    const r = await fetch(PLACE_ENDPOINT(placeId), {
      headers: {
        // 카카오는 referer 검사로 일반 브라우저처럼 보이게 함
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Referer: 'https://place.map.kakao.com/',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    })
    if (!r.ok) {
      res.status(r.status).json({ error: 'kakao_place_unavailable', detail: r.statusText })
      return
    }
    const data = await r.json()

    // 정규화 — 우리 UI에서 필요한 것만 추림
    const out = {
      id: placeId,
      name: data.basicInfo?.placenamefull || data.basicInfo?.placename || '',
      category: data.basicInfo?.category?.catename || '',
      phone: data.basicInfo?.phonenum || '',
      address:
        data.basicInfo?.address?.newaddr?.newaddrfull ||
        data.basicInfo?.address?.addrbunho?.address || '',
      hours: normalizeHours(data.basicInfo?.openHour),
      homepage: data.basicInfo?.homepage || '',
      rating: data.comment?.scoresum && data.comment?.scorecnt
        ? Number((data.comment.scoresum / data.comment.scorecnt).toFixed(1))
        : null,
      reviewCount: data.comment?.kamapComntcnt || data.comment?.scorecnt || 0,
      photos: (data.photo?.photoList || [])
        .flatMap((g) => g.list || [])
        .slice(0, 6)
        .map((p) => p.orgurl || p.url)
        .filter(Boolean),
      accessibility: normalizeAccessibility(data.basicInfo?.facilityInfo || data.optionInfo),
      menus: (data.menuInfo?.menuList || []).slice(0, 5).map((m) => ({
        name: m.menu,
        price: m.price || '',
      })),
      url: `https://place.map.kakao.com/${placeId}`,
    }

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
    res.status(200).json(out)
  } catch (e) {
    res.status(502).json({ error: 'fetch_failed', detail: e.message })
  }
}
