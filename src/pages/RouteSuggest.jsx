import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { useVoice } from '../hooks/useVoice'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useGPS } from '../hooks/useGPS'
import { fetchRoute } from '../services/routeApi'
import { fetchPois } from '../services/poiApi'
import { formatDistance, estimateMinutes } from '../utils/geo'
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

  // 경로 fetch
  useEffect(() => {
    start()
    if (!position || !destination?.lat) return
    fetchRoute(position, { lat: destination.lat, lng: destination.lng })
      .then((r) => {
        setRoute(r)
      })
      .catch(() => setRoute(null))
    // eslint-disable-next-line
  }, [position?.lat, position?.lng, destination?.lat, destination?.lng])

  // 경로 주변 쉼터/화장실
  useEffect(() => {
    if (!position) return
    const center = destination?.lat
      ? {
          lat: (position.lat + destination.lat) / 2,
          lng: (position.lng + destination.lng) / 2,
        }
      : position
    fetchPois({ center, radius: 1500, types: ['rest', 'toilet'] }).then(setRoutePois)
  }, [position?.lat, destination?.lat])

  const polylines = route?.coords?.length > 1
    ? [{ path: route.coords, color: '#3182F6', weight: 7, opacity: 0.85 }]
    : []

  const startEndPois = []
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
    pois: [...startEndPois, ...routePois.slice(0, 6)],
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

  return (
    <div className="route-page">
      <div className="route-header">
        <button className="search-back" onClick={() => navigate(-1)}>‹</button>
        <h2>편한 길</h2>
      </div>

      <div className="route-body">
        <div className="route-map" ref={mapRef}>
          {!route && <div className="route-map-fallback">🗺️ 경로 그리는 중...</div>}
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
        </div>

        <div className={`chip ${walk.color}`} style={{ alignSelf: 'flex-start' }}>
          {walk.emoji} {walk.name} · 걸음 기준 맞춤
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

          <div className="route-features">
            <div className="route-feat">
              <span className="route-check">✓</span>
              <span>
                {route?.source === 'tmap' && '실제 보행자 도로 따라감'}
                {route?.source === 'kakao-driving' && '큰길 위주 우회 경로'}
                {(!route || route.source === 'straight' || route.source === 'client-straight') &&
                  '직선 경로 (백업)'}
              </span>
            </div>
            <div className="route-feat">
              <span className="route-check">✓</span>
              <span>쉴 곳 {restCount}군데 · 화장실 {toiletCount}곳</span>
            </div>
            <div className="route-feat">
              <span className="route-check">✓</span>
              <span>실시간 GPS로 안내</span>
            </div>
          </div>
        </div>

        <button className="btn ghost">다른 길도 볼까요? ›</button>
      </div>

      <div className="route-footer">
        <button className="btn large" onClick={handleStart}>
          이 길로 갈게요
        </button>
      </div>
    </div>
  )
}
