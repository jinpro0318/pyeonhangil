/**
 * 카카오맵 장소 상세 — /api/place 호출
 */
const cache = new Map()
const TTL = 10 * 60 * 1000

export async function fetchPlaceDetail(poiOrId) {
  const id = typeof poiOrId === 'string' ? poiOrId : poiOrId?.id
  if (!id) return null
  const placeId = String(id).replace(/^kakao_/, '')
  if (!/^\d+$/.test(placeId)) return null // 카카오 POI 아님

  const cached = cache.get(placeId)
  if (cached && Date.now() - cached.ts < TTL) return cached.data

  try {
    const r = await fetch(`/api/place?id=${placeId}`)
    if (!r.ok) return null
    const data = await r.json()
    cache.set(placeId, { ts: Date.now(), data })
    return data
  } catch {
    return null
  }
}
