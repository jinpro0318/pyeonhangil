import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGPS } from '../hooks/useGPS'
import { useVoice } from '../hooks/useVoice'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { fetchPois } from '../services/poiApi'
import { fetchRoute } from '../services/routeApi'
import { formatDistance, estimateMinutes } from '../utils/geo'
import SOSButton from '../components/SOSButton'
import './Navigation.css'

export default function Navigation() {
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const { state, setActiveRoute } = useAppState()
  const { speak, isSpeaking } = useVoice()
  const { position, speedMeterPerMin, isStaying, isTracking, start } = useGPS({
    stayThresholdSeconds: 180,
  })
  const walk = WALK_STATES[state.user.walkState]
  const destination = state.destination
  const destName = destination?.name || '병원'

  const [route, setRoute] = useState(state.activeRoute || null)
  const [nearbyPois, setNearbyPois] = useState([])

  // GPS 시작 + 경로 확보 (없으면 fetch)
  useEffect(() => {
    start()
    if (!state.activeRoute && position && destination?.lat) {
      fetchRoute(position, { lat: destination.lat, lng: destination.lng }).then((r) => {
        setRoute(r)
        if (r) setActiveRoute(r)
      })
    }
    // eslint-disable-next-line
  }, [position?.lat, destination?.lat])

  // 주변 쉼터/화장실
  useEffect(() => {
    if (!position) return
    fetchPois({ center: position, types: ['rest', 'toilet'], radius: 800 }).then((list) =>
      setNearbyPois(list.slice(0, 5))
    )
  }, [position?.lat])

  // 체류 감지 → 쉬는중 화면
  useEffect(() => {
    if (isStaying) navigate('/resting')
  }, [isStaying, navigate])

  const distanceMeters = route?.distanceMeters || 0
  const remainingTime = distanceMeters
    ? estimateMinutes(distanceMeters, walk.id)
    : 12

  // 첫 마운트 시 안내 1회
  const announcedRef = useRef(false)
  useEffect(() => {
    if (announcedRef.current) return
    if (!route && distanceMeters === 0) return
    announcedRef.current = true
    speak(`${destName}까지 ${remainingTime}분 남았어요. 안전하게 천천히 가세요`)
    // eslint-disable-next-line
  }, [route])

  const handleRepeat = () => {
    speak(`${destName}까지 ${remainingTime}분 남았어요`, { immediate: true })
  }

  const handleArrived = () => navigate('/arrived')

  const polylines = route?.coords?.length > 1
    ? [{ path: route.coords, color: '#3182F6', weight: 7, opacity: 0.85 }]
    : []

  // 도착 마커
  const destPois = []
  if (destination?.lat) {
    destPois.push({
      id: 'nav_end',
      type: 'end',
      name: destName,
      lat: destination.lat,
      lng: destination.lng,
    })
  }

  const mapPois = useMemo(() => [...destPois, ...nearbyPois], [destPois, nearbyPois])

  const { isReady: mapReady, error: mapError } = useKakaoMap(mapRef, {
    pois: mapPois,
    polylines,
    center: position,
    myLocation: isTracking ? position : null,
    level: 4,
    draggable: true,
    fitBoundsOnPolyline: true,
  })

  return (
    <div className="nav-page">
      <div className="nav-map-wrap">
        <div className="nav-map" ref={mapRef}>
          {!mapReady && !mapError && (
            <div className="nav-map-placeholder">🗺️ 지도 불러오는 중...</div>
          )}
          {mapError && (
            <div className="nav-map-placeholder error">
              지도 표시 실패 · 안내는 계속됩니다
            </div>
          )}
        </div>
        <div className="nav-map-overlay">
          <div className="voice-indicator">
            <div className="voice-dot"></div>
            {isSpeaking ? '🔊 말하는 중' : '🎙 대기 중'}
          </div>
          <div className="gps-indicator">
            <div className="gps-dot"></div>
            📍 {isTracking ? `분당 ${Math.max(speedMeterPerMin, 40)}m` : 'GPS 켜는 중'}
          </div>
        </div>
      </div>

      <div className="nav-body">
        <div className="nav-progress">
          <div className="nav-remain">
            {destName}까지 {remainingTime}분 남음
            {distanceMeters > 0 && ` · ${formatDistance(distanceMeters)}`}
          </div>
          <span className={`chip ${walk.color}`}>{walk.emoji} 내 걸음</span>
        </div>

        <div className="nav-main">
          <div className="nav-wave">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="nav-wave-bar"
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0.6 + (i % 3) * 0.15 }}
              />
            ))}
          </div>

          <div className="nav-distance">
            <div className="nav-arrow">›</div>
            <div className="nav-num">{formatDistance(distanceMeters || 120).replace(/[a-z]/i, '')}<span>m</span></div>
          </div>

          <div className="nav-instruction">{destName} 방향</div>
          <div className="nav-preview">"파란선을 따라가세요"</div>
        </div>

        <div className="nav-commands">
          <div className="nav-commands-label">🎙 말씀하셔도 돼요</div>
          <div className="nav-commands-list">
            <span className="nav-cmd">"다시 말해줘"</span>
            <span className="nav-cmd">"힘들어"</span>
            <span className="nav-cmd">"화장실"</span>
          </div>
        </div>

        <div className="nav-quick">
          <button className="nav-quick-btn warn" onClick={() => navigate('/resting')}>
            <div className="nav-quick-emoji">😮‍💨</div>
            <div className="nav-quick-label">힘들어요</div>
          </button>
          <button
            className="nav-quick-btn toilet"
            onClick={() => navigate('/map', { state: { filter: 'toilet' } })}
          >
            <div className="nav-quick-emoji">🚻</div>
            <div className="nav-quick-label">화장실</div>
          </button>
          <button className="nav-quick-btn voice" onClick={handleRepeat}>
            <div className="nav-quick-emoji">🔊</div>
            <div className="nav-quick-label">다시듣기</div>
          </button>
        </div>

        <button className="btn secondary" onClick={handleArrived}>
          도착 시뮬레이션
        </button>
      </div>

      <SOSButton bottom={24} />
    </div>
  )
}
