/**
 * 도보 경로 fetcher
 * - 서버 /api/route 호출 (Tmap → 카카오 → 직선 폴백)
 */

const cache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

function cacheKey(o, d) {
  return `${o.lat.toFixed(5)},${o.lng.toFixed(5)}->${d.lat.toFixed(5)},${d.lng.toFixed(5)}`
}

export async function fetchRoute(origin, destination) {
  if (!origin?.lat || !destination?.lat) return null

  const key = cacheKey(origin, destination)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data

  try {
    const r = await fetch('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination }),
    })
    if (!r.ok) throw new Error(`route ${r.status}`)
    const data = await r.json()
    cache.set(key, { ts: Date.now(), data })
    return data
  } catch (e) {
    console.warn('[routeApi] failed, fallback to straight', e)
    // 마지막 폴백: 직선
    return {
      coords: [origin, destination],
      distanceMeters: 0,
      durationSeconds: 0,
      source: 'client-straight',
    }
  }
}
