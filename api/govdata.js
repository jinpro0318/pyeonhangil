/**
 * 정부 공공데이터 (data.go.kr / odcloud) 프록시
 *
 * GET /api/govdata?type=heat-shelter|public-toilet|disabled-facility
 *                  &minLat=...&maxLat=...&minLng=...&maxLng=...
 *
 * - 키 (DATA_GO_KR_SERVICE_KEY) 가 설정되면 ODCloud(공공데이터포털 신규 OpenAPI) 호출
 * - 첫 호출 시 전국 데이터 수 페이지 fetch → 모듈 캐시 (24h TTL)
 * - 이후 호출은 캐시에서 bbox 필터만 수행 (수 ms)
 * - 키 미설정 시 빈 배열 + hint 반환 (정적 GeoJSON 폴백 활용)
 */

// 모듈 스코프 캐시 (Vercel 인스턴스 재사용 시 유지, 서버리스 콜드스타트마다 초기화)
const cache = new Map() // type -> { ts, all: POI[] }
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

/**
 * ODCloud 표준데이터 설정
 * - endpoint: 데이터셋 페이지 → "활용신청" 후 발급되는 base URL
 *   사용자가 활용 승인 후 '엔드포인트' 그대로 .env 의 DATA_GO_KR_<TYPE>_URL 로 등록 가능
 * - field: ODCloud 응답의 한글 필드명 → 우리 POI 스키마 매핑
 */
const CONFIGS = {
  'heat-shelter': {
    type: 'rest',
    label: '무더위쉼터',
    sourceLabel: '행정안전부 · 무더위쉼터 표준데이터',
    // data.go.kr ID 15013199 (전국무더위쉼터표준데이터)
    defaultEndpoint:
      'https://api.odcloud.kr/api/15013199/v1/uddi:6f7ae8ad-c12c-46a8-a505-5c4c2c1bbe85',
    envEndpoint: 'DATA_GO_KR_HEAT_SHELTER_URL',
    fields: {
      lat: ['위도', 'lat', 'LA'],
      lng: ['경도', 'lng', 'LO'],
      name: ['시설명', '쉼터명칭', 'fcltyNm'],
      address: ['도로명전체주소', '도로명주소', 'rnAdres', '소재지도로명주소'],
    },
  },
  'public-toilet': {
    type: 'toilet',
    label: '공중화장실',
    sourceLabel: '행정안전부 · 공중화장실 표준데이터',
    // data.go.kr ID 15012892 (전국공중화장실표준데이터)
    defaultEndpoint:
      'https://api.odcloud.kr/api/15012892/v1/uddi:f76b6cd7-7a5e-4eaf-bd5b-66097fcc1f6a',
    envEndpoint: 'DATA_GO_KR_PUBLIC_TOILET_URL',
    fields: {
      lat: ['위도', 'WGS84위도', 'lat'],
      lng: ['경도', 'WGS84경도', 'lng'],
      name: ['화장실명', '시설명', 'fcltyNm'],
      address: ['소재지도로명주소', '도로명주소', '소재지지번주소'],
      // 장애인용 화장실 유무
      disabledMen: ['장애인용대변기수남자'],
      disabledWomen: ['장애인용대변기수여자'],
    },
    // 장애인 칸이 1개 이상인 화장실만 (편한길 컨셉에 맞춤)
    filter: (r) => {
      const m = Number(r['장애인용대변기수남자'] || 0)
      const w = Number(r['장애인용대변기수여자'] || 0)
      return m + w > 0
    },
  },
  'disabled-facility': {
    type: 'cross', // 장애인편의시설은 cross/ramp 등 광범위 → 일단 cross 색으로 표시
    label: '장애인 편의시설',
    sourceLabel: '보건복지부 · 장애인편의시설 표준데이터',
    // data.go.kr ID 15100058 (전국장애인편의시설표준데이터)
    defaultEndpoint:
      'https://api.odcloud.kr/api/15100058/v1/uddi:0be81db2-e8a3-4c78-9d58-4f0f97f5cdda',
    envEndpoint: 'DATA_GO_KR_DISABLED_FACILITY_URL',
    fields: {
      lat: ['위도', '시설위도', 'lat'],
      lng: ['경도', '시설경도', 'lng'],
      name: ['시설명', '대상시설명', 'fcltyNm'],
      address: ['도로명주소', '소재지도로명주소', '시설주소'],
    },
  },
}

function pickField(record, candidates) {
  for (const k of candidates) {
    if (record[k] != null && record[k] !== '') return record[k]
  }
  return null
}

function normalizeRecord(record, cfg, idx) {
  const lat = Number(pickField(record, cfg.fields.lat))
  const lng = Number(pickField(record, cfg.fields.lng))
  if (!isFinite(lat) || !isFinite(lng) || lat === 0 || lng === 0) return null
  if (lat < 33 || lat > 39 || lng < 124 || lng > 132) return null // 한반도 범위
  return {
    id: `gov_${cfg.type}_${idx}_${lat.toFixed(5)}_${lng.toFixed(5)}`,
    type: cfg.type,
    name: pickField(record, cfg.fields.name) || cfg.label,
    address: pickField(record, cfg.fields.address) || '',
    lat,
    lng,
    source: cfg.sourceLabel,
  }
}

async function fetchAllRecords(cfg, key) {
  const endpoint = process.env[cfg.envEndpoint] || cfg.defaultEndpoint
  const allRecords = []
  // 첫 페이지로 totalCount 확인 후 5페이지(최대 5000건)까지 수집
  // 전국 데이터는 수만건이지만 5000개로도 주요 지역 커버
  const PER_PAGE = 1000
  const MAX_PAGES = 5
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL(endpoint)
    url.searchParams.set('serviceKey', key)
    url.searchParams.set('page', String(page))
    url.searchParams.set('perPage', String(PER_PAGE))
    url.searchParams.set('returnType', 'json')
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!r.ok) break
      const data = await r.json()
      const rows = data?.data || data?.body?.items || []
      allRecords.push(...rows)
      const total = data?.totalCount || data?.matchCount || 0
      if (allRecords.length >= total) break
      if (rows.length < PER_PAGE) break
    } catch (e) {
      console.warn(`[govdata] page ${page} failed:`, e.message)
      break
    }
  }
  return allRecords
}

async function getCachedPois(typeKey) {
  const cached = cache.get(typeKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.all

  const cfg = CONFIGS[typeKey]
  if (!cfg) throw new Error(`unknown type: ${typeKey}`)

  const key = process.env.DATA_GO_KR_SERVICE_KEY
  if (!key) return null // 키 미설정

  const rawRecords = await fetchAllRecords(cfg, key)
  const filtered = cfg.filter ? rawRecords.filter(cfg.filter) : rawRecords
  const pois = filtered
    .map((r, i) => normalizeRecord(r, cfg, i))
    .filter(Boolean)

  cache.set(typeKey, { ts: Date.now(), all: pois })
  return pois
}

function withinBbox(p, b) {
  return p.lat >= b.minLat && p.lat <= b.maxLat && p.lng >= b.minLng && p.lng <= b.maxLng
}

export default async function handler(req, res) {
  const { type, minLat, maxLat, minLng, maxLng, limit = '100' } = req.query || {}

  if (!type || !CONFIGS[type]) {
    res.status(400).json({
      error: 'type required',
      supported: Object.keys(CONFIGS),
    })
    return
  }

  const bbox =
    minLat && maxLat && minLng && maxLng
      ? {
          minLat: Number(minLat),
          maxLat: Number(maxLat),
          minLng: Number(minLng),
          maxLng: Number(maxLng),
        }
      : null

  try {
    const all = await getCachedPois(type)
    if (all === null) {
      res.status(200).json({
        pois: [],
        cached: false,
        hint: 'DATA_GO_KR_SERVICE_KEY 가 설정되지 않았어요. data.go.kr 가입 → 활용신청 후 Vercel 환경변수에 등록해주세요.',
      })
      return
    }

    let filtered = bbox ? all.filter((p) => withinBbox(p, bbox)) : all
    const max = Math.min(500, Math.max(1, Number(limit)))
    if (filtered.length > max) filtered = filtered.slice(0, max)

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json({
      pois: filtered,
      cached: cache.has(type),
      total: all.length,
      returned: filtered.length,
    })
  } catch (e) {
    console.error('[govdata]', e)
    res.status(502).json({ error: 'fetch_failed', detail: e.message })
  }
}
