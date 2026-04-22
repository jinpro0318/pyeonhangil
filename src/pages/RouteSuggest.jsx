import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { useVoice } from '../hooks/useVoice'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useGPS } from '../hooks/useGPS'
import { fetchRoute } from '../services/routeApi'
import { fetchPoisInBbox } from '../services/poiApi'
import { bboxFromCoords, formatDistance, estimateMinutes } from '../utils/geo'
import './RouteSuggest.css'

export default function RouteSuggest() {
  const location = useLocation()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const { state, setDestination, setActiveRoute } = useAppState()
  const { speak } = useVoice()
  const { position, start } = useGPS({ enableStayDetection: false })

  const destination = location.state?.destination ||
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

  // 경로 fetch
  useEffect(() => {
    start()
    if (!position || !destination?.lat) return
    setIsRouting(true)
    fetchRoute(position, { lat: destination.lat, lng: destination.lng })
      .then((r) => setRoute(r))
      .catch(() => setRoute(null))
      .finally(() => setIsRouting(false))
    // eslint-disable-next-line
  }, [position?.lat, position?.lng, destination?.lat, destination?.lng])

  // 경로 주변(bbox) 쉼터/화장실/장애인편의시설
  useEffect(() => {
    if (!route?.coords?.length) return
    const bbox = bboxFromCoords(route.coords, 250)
    if (!bbox) return
    fetchPoisInBbox({
      bbox,
      types: ['rest', 'toilet', 'elev', 'cross'],
    }).then((list) => setRoutePois(list.slice(0, 30)))
  }, [route])

  const polylines = route?.coords?.length > 1
    ? [{ path: route.coords, color: '#3182F6', weight: 7, opacity: 0.85 }]
    : []

  const startEndPois = []
  if (position?.lat) {
    startEndPois.push({
      id: 'route_start',
      type: 'start',
      name: '지금 여기',
      lat: position.lat,
      lng: position.lng,
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

  useKakaoMap(mapRef, {
    pois: [...startEndPois, ...routePois.slice(0, 8)],
    polylines,
    center: position,
    myLocation: position,
    level: 5,
    fitBoundsOnPolyline: true,
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

  return (
    <div className="route-page">
      <div className="route-header">
        <button className="search-back" onClick={() => navigate(-1)}>‹</button>
        <h2>편한 길</h2>
      </div>

      <div className="route-body">
        <div className="route-map" ref={mapRef}>
          {(!route || isRouting) && (
            <div className="route-map-fallback">🗺️ 편한 길을 그리고 있어요…</div>
          )}
        </div>

        <div className="route-path-box">
          <div className="route-point">
            <div className="route-dot start" />
            <div className="route-point-label">지금 여기</div>
          </div>
          <div className="route-line" />
          <div className="route-point">
            <div className="route-dot end" />
            <div className="route-point-label strong">{destination.name}</div>
          </div>
          {destination.address && (
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
                {route?.source === 'tmap' && '실제 보행자 도로 따라가는 경로'}
                {route?.source === 'kakao-driving' && '큰길 위주 우회 경로'}
                {(!route || route.source === 'straight' || route.source === 'client-straight') &&
                  '직선 기준 예상 경로'}
              </span>
            </div>
            <div className="route-feat">
              <span className="route-check">✓</span>
              <span>쉴 곳 {restCount}곳 · 화장실 {toiletCount}곳</span>
            </div>
            {(elevCount > 0 || accessibleCount > 0) && (
              <div className="route-feat">
                <span className="route-check">✓</span>
                <span>
                  {elevCount > 0 && `엘리베이터 ${elevCount}곳`}
                  {elevCount > 0 && accessibleCount > 0 && ' · '}
                  {accessibleCount > 0 && `장애인 편의시설 ${accessibleCount}곳`}
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
    </div>
  )
}
