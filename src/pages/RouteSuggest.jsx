import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { useVoice } from '../hooks/useVoice'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useGPS } from '../hooks/useGPS'
import { fetchRoute } from '../services/routeApi'
import { fetchPoisInBbox } from '../services/poiApi'
import { bboxFromCoords, formatDistance, estimateMinutes, minDistanceToPolyline } from '../utils/geo'
import { POI_TYPES } from '../data/pois'
import PoiDetailCard from '../components/PoiDetailCard'
import './RouteSuggest.css'

// 우리 서비스 범주 — 이 외 타입은 지도에 표시하지 않음
const SERVICE_TYPES = ['rest', 'toilet', 'elev', 'ramp', 'cross']
const ROUTE_RADIUS_METERS = 50

// 카카오 로컬 검색 — 타이핑 자동완성용
async function kakaoSuggest(query, center) {
  if (!query || query.trim().length < 1) return []
  const params = new URLSearchParams({ query })
  if (center?.lat) {
    params.set('x', String(center.lng))
    params.set('y', String(center.lat))
    params.set('radius', '10000')
  } else {
    params.set('x', '126.978')
    params.set('y', '37.566')
    params.set('radius', '20000')
  }
  try {
    const r = await fetch(`/api/local?${params.toString()}`)
    if (!r.ok) return []
    const data = await r.json()
    return (data.pois || []).slice(0, 6).map((p) => ({
      name: p.name,
      address: p.address || '',
      lat: p.lat,
      lng: p.lng,
    }))
  } catch {
    return []
  }
}

export default function RouteSuggest() {
  const location = useLocation()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const { state, setDestination, setActiveRoute } = useAppState()
  const { speak } = useVoice()
  const { position, start } = useGPS({ enableStayDetection: false })

  const initialDestination = location.state?.destination ||
    state.destination || {
      name: '서울대학교병원',
      address: '서울 종로구 대학로 101',
      lat: 37.579617,
      lng: 126.998292,
    }

  const walk = WALK_STATES[state.user.walkState]

  const [route, setRoute] = useState(null)
  const [routePois, setRoutePois] = useState([])
  const [isRouting, setIsRouting] = useState(false)
  const [selectedPoi, setSelectedPoi] = useState(null)

  // 출발/도착 직접 편집 상태
  // originPick = null → GPS 현재 위치 사용. 직접 장소를 고르면 override.
  const [originText, setOriginText] = useState('')
  const [originPick, setOriginPick] = useState(null)
  const [destText, setDestText] = useState(initialDestination.name || '')
  const [destPick, setDestPick] = useState(initialDestination)
  const [originSug, setOriginSug] = useState([])
  const [destSug, setDestSug] = useState([])
  const [activeField, setActiveField] = useState(null) // 'origin' | 'dest' | null
  const originDebRef = useRef(null)
  const destDebRef = useRef(null)

  // 실제 경로 계산에 사용될 출발/도착
  const origin = originPick || position
  const destination = destPick || initialDestination

  // 경로 fetch
  useEffect(() => {
    start()
    if (!origin?.lat || !destination?.lat) return
    setIsRouting(true)
    fetchRoute(
      { lat: origin.lat, lng: origin.lng },
      { lat: destination.lat, lng: destination.lng }
    )
      .then((r) => setRoute(r))
      .catch(() => setRoute(null))
      .finally(() => setIsRouting(false))
    // eslint-disable-next-line
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng])

  // 자동완성 (debounced)
  useEffect(() => {
    if (activeField !== 'origin') return
    if (originPick && originText === originPick.name) { setOriginSug([]); return }
    if (originDebRef.current) clearTimeout(originDebRef.current)
    originDebRef.current = setTimeout(async () => {
      setOriginSug(await kakaoSuggest(originText, position))
    }, 250)
    return () => clearTimeout(originDebRef.current)
    // eslint-disable-next-line
  }, [originText, activeField])

  useEffect(() => {
    if (activeField !== 'dest') return
    if (destPick && destText === destPick.name) { setDestSug([]); return }
    if (destDebRef.current) clearTimeout(destDebRef.current)
    destDebRef.current = setTimeout(async () => {
      setDestSug(await kakaoSuggest(destText, position))
    }, 250)
    return () => clearTimeout(destDebRef.current)
    // eslint-disable-next-line
  }, [destText, activeField])

  // 경로에서 50m 이내 & 우리 서비스 범주인 POI 만 표시
  useEffect(() => {
    if (!route?.coords?.length) return
    // bbox 는 50m + 여유 10m 로 작게 — 넓게 받고 정원형(50m) 필터링
    const bbox = bboxFromCoords(route.coords, ROUTE_RADIUS_METERS + 10)
    if (!bbox) return
    fetchPoisInBbox({ bbox, types: SERVICE_TYPES }).then((list) => {
      const filtered = list
        .filter((p) => SERVICE_TYPES.includes(p.type))
        .map((p) => ({ ...p, _dToRoute: minDistanceToPolyline(p, route.coords) }))
        .filter((p) => p._dToRoute <= ROUTE_RADIUS_METERS)
        .sort((a, b) => a._dToRoute - b._dToRoute)
      setRoutePois(filtered.slice(0, 40))
    })
  }, [route])

  const polylines = route?.coords?.length > 1
    ? [{ path: route.coords, color: '#3182F6', weight: 7, opacity: 0.85 }]
    : []

  const startEndPois = []
  if (origin?.lat) {
    startEndPois.push({
      id: 'route_start',
      type: 'start',
      name: originPick ? originPick.name : '지금 여기',
      lat: origin.lat,
      lng: origin.lng,
    })
  }
  if (destination?.lat) {
    startEndPois.push({
      id: 'route_end',
      type: 'end',
      name: destination.name,
      lat: destination.lat,
      lng: destination.lng,
    })
  }

  const { isReady: isMapReady, error: mapError } = useKakaoMap(mapRef, {
    pois: [...startEndPois, ...routePois.slice(0, 25)],
    polylines,
    center: position,
    myLocation: position,
    level: 5,
    fitBoundsOnPolyline: true,
    onPoiClick: (poi) => {
      if (poi.type === 'start') return // 내 위치는 카드 안 띄움
      setSelectedPoi(poi)
    },
  })

  // 거리 -> 시간 추정 (실측 거리 우선, 없으면 직선)
  const distanceMeters = route?.distanceMeters || 0
  const minutes = distanceMeters
    ? Math.max(estimateMinutes(distanceMeters, walk.id), Math.round((route?.durationSeconds || 0) / 60))
    : (walk.id === 'slow' ? 18 : walk.id === 'very-slow' ? 24 : walk.id === 'needs-help' ? 30 : 20)

  useEffect(() => {
    if (route) {
      speak(`${destination.name}까지 ${minutes}분 걸리는 편한 길을 찾았어요`)
    }
    // eslint-disable-next-line
  }, [route])

  const handleStart = () => {
    setDestination(destination)
    if (route) setActiveRoute(route)
    navigate('/navigation')
  }

  const restCount = routePois.filter((p) => p.type === 'rest').length
  const toiletCount = routePois.filter((p) => p.type === 'toilet').length
  const accessibleCount = routePois.filter((p) => p.type === 'cross').length
  const elevCount = routePois.filter((p) => p.type === 'elev').length
  const rampCount = routePois.filter((p) => p.type === 'ramp').length

  // 경로 주변에 실제 존재하는 타입만 범례로 표시
  const LEGEND_ORDER = ['rest', 'toilet', 'elev', 'ramp', 'cross']
  const legend = LEGEND_ORDER
    .map((t) => ({
      type: t,
      count: routePois.filter((p) => p.type === t).length,
      ...POI_TYPES[t],
    }))
    .filter((l) => l.count > 0)

  return (
    <div className="route-page">
      <div className="route-header">
        <button className="search-back" onClick={() => navigate(-1)}>‹</button>
        <h2>편한 길</h2>
      </div>

      <div className="route-body">
        <div className="route-map" ref={mapRef}>
          {!isMapReady && !mapError && (
            <div className="route-map-fallback">🗺️ 지도를 불러오는 중…</div>
          )}
          {isMapReady && (!route || isRouting) && (
            <div className="route-map-fallback">🗺️ 편한 길을 그리고 있어요…</div>
          )}
          {mapError && (
            <div className="route-map-error">
              <div className="route-map-error-title">🗺️ 지도를 불러올 수 없어요</div>
              <div className="route-map-error-msg">{mapError}</div>
              <ol className="route-map-error-list">
                <li>카카오 콘솔 → <b>편한길 앱</b> → 앱 설정 → 플랫폼 → <b>Web 플랫폼</b></li>
                <li>사이트 도메인에 <code>https://pyeonhangil.vercel.app</code> 추가</li>
                <li>Vercel 환경변수 <code>VITE_KAKAO_JS_KEY</code> 확인 후 재배포</li>
              </ol>
              <button className="btn ghost" onClick={() => window.location.reload()}>다시 시도</button>
            </div>
          )}
        </div>

        {/* 경로 주변 시설 범례 */}
        {legend.length > 0 && (
          <div className="route-legend">
            <div className="route-legend-title">경로 주변 시설</div>
            <div className="route-legend-chips no-scrollbar">
              {legend.map((l) => (
                <div key={l.type} className="route-legend-chip">
                  <span
                    className="route-legend-dot"
                    style={{ background: l.color }}
                  >
                    {l.emoji}
                  </span>
                  <span className="route-legend-lbl">{l.label}</span>
                  <span className="route-legend-cnt">{l.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="route-path-box">
          {/* 출발 */}
          <div className="route-field">
            <div className="route-dot start" />
            <input
              type="text"
              className="route-input"
              placeholder="출발 — 비우면 현재 위치"
              value={originText}
              onChange={(e) => {
                setOriginText(e.target.value)
                setOriginPick(null)
              }}
              onFocus={() => setActiveField('origin')}
              onBlur={() => setTimeout(() => setActiveField(null), 200)}
              enterKeyHint="search"
            />
            {(originText || originPick) && (
              <button
                type="button"
                className="route-clear"
                aria-label="출발 지우기"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOriginText('')
                  setOriginPick(null)
                  setOriginSug([])
                }}
              >✕</button>
            )}
            {activeField === 'origin' && originSug.length > 0 && (
              <ul className="route-sug">
                {originSug.map((s, i) => (
                  <li
                    key={`${s.name}-${s.lat}-${i}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setOriginPick(s)
                      setOriginText(s.name)
                      setOriginSug([])
                      setActiveField(null)
                    }}
                  >
                    <b>{s.name}</b>
                    {s.address && <span>{s.address}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="route-line" />

          {/* 도착 */}
          <div className="route-field">
            <div className="route-dot end" />
            <input
              type="text"
              className="route-input strong"
              placeholder="도착지를 입력하세요"
              value={destText}
              onChange={(e) => {
                setDestText(e.target.value)
                setDestPick(null)
              }}
              onFocus={() => setActiveField('dest')}
              onBlur={() => setTimeout(() => setActiveField(null), 200)}
              enterKeyHint="search"
            />
            {destText && (
              <button
                type="button"
                className="route-clear"
                aria-label="도착 지우기"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setDestText('')
                  setDestPick(null)
                  setDestSug([])
                }}
              >✕</button>
            )}
            {activeField === 'dest' && destSug.length > 0 && (
              <ul className="route-sug">
                {destSug.map((s, i) => (
                  <li
                    key={`${s.name}-${s.lat}-${i}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setDestPick(s)
                      setDestText(s.name)
                      setDestSug([])
                      setActiveField(null)
                    }}
                  >
                    <b>{s.name}</b>
                    {s.address && <span>{s.address}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {destination?.address && destPick && (
            <div className="route-point-addr">{destination.address}</div>
          )}
        </div>

        <div className="route-recommend">
          <div className="route-badge">편하고 안전한 길</div>

          <div className="route-time">
            <span className="route-time-num">{minutes}</span>
            <span className="route-time-unit">분</span>
            {distanceMeters > 0 && (
              <span className="route-time-dist">· {formatDistance(distanceMeters)}</span>
            )}
          </div>

          <div className={`chip ${walk.color}`} style={{ alignSelf: 'flex-start', marginTop: 10 }}>
            {walk.emoji} {walk.name} · 걸음 기준 맞춤
          </div>

          <div className="route-features">
            <div className="route-feat">
              <span className="route-check">✓</span>
              <span>
                {route?.source === 'tmap' && '실제 한국 보행자 도로 경로 (Tmap)'}
                {route?.source === 'osrm-foot' && '실제 도보 경로 (OpenStreetMap 기반)'}
                {route?.source === 'kakao-driving' && '큰길 기준 근사 경로'}
                {(!route || route.source === 'straight' || route.source === 'client-straight') &&
                  '직선 기준 예상 경로'}
              </span>
            </div>
            <div className="route-feat">
              <span className="route-check">✓</span>
              <span>쉴 곳 {restCount}곳 · 화장실 {toiletCount}곳</span>
            </div>
            {(elevCount > 0 || rampCount > 0 || accessibleCount > 0) && (
              <div className="route-feat">
                <span className="route-check">✓</span>
                <span>
                  {[
                    elevCount > 0 && `엘리베이터 ${elevCount}곳`,
                    rampCount > 0 && `경사로 ${rampCount}곳`,
                    accessibleCount > 0 && `장애인 편의시설 ${accessibleCount}곳`,
                  ].filter(Boolean).join(' · ')}
                </span>
              </div>
            )}
            <div className="route-feat">
              <span className="route-check">✓</span>
              <span>실시간 GPS로 안내</span>
            </div>
          </div>
        </div>
      </div>

      <div className="route-footer">
        <button className="btn large" onClick={handleStart}>
          이 길로 갈게요
        </button>
      </div>

      {selectedPoi && (
        <PoiDetailCard poi={selectedPoi} onClose={() => setSelectedPoi(null)} />
      )}
    </div>
  )
}
