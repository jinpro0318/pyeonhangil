import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGPS } from '../hooks/useGPS'
import { useVoice } from '../hooks/useVoice'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { SAMPLE_POIS } from '../data/pois'
import SOSButton from '../components/SOSButton'
import './Navigation.css'

export default function Navigation() {
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const { state } = useAppState()
  const { speak, isSpeaking } = useVoice()
  const { position, speedMeterPerMin, isStaying, isTracking, start } = useGPS({
    stayThresholdSeconds: 180,
  })
  const [remainingTime, setRemainingTime] = useState(12)
  const walk = WALK_STATES[state.user.walkState]
  const destination = state.destination?.name || '병원'

  // 지도 - 주변 쉼터/화장실 표시
  const nearbyPois = SAMPLE_POIS.filter((p) => ['rest', 'toilet'].includes(p.type)).slice(0, 4)
  const { isReady: mapReady, error: mapError } = useKakaoMap(mapRef, {
    pois: nearbyPois,
    center: position,
    myLocation: isTracking ? position : null,
    level: 4,
    draggable: false,
  })

  useEffect(() => {
    start()
    speak(`${destination}까지 ${remainingTime}분 남았어요. 잠시 후 오른쪽으로 도세요`)
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (isStaying) navigate('/resting')
  }, [isStaying, navigate])

  const handleRepeat = () => {
    speak(`${destination}까지 ${remainingTime}분 남았어요. 잠시 후 오른쪽으로 도세요`, {
      immediate: true,
    })
  }

  const handleArrived = () => {
    navigate('/arrived')
  }

  return (
    <div className="nav-page">
      {/* 상단 미니 지도 */}
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
            {destination}까지 {remainingTime}분 남음
          </div>
          <span className={`chip ${walk.color}`}>{walk.emoji} 내 걸음</span>
        </div>

        <div className="nav-main">
          <div className="nav-wave">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="nav-wave-bar"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0.6 + (i % 3) * 0.15,
                }}
              />
            ))}
          </div>

          <div className="nav-distance">
            <div className="nav-arrow">›</div>
            <div className="nav-num">120<span>m</span></div>
          </div>

          <div className="nav-instruction">오른쪽으로 도세요</div>
          <div className="nav-preview">"120미터 앞에서 오른쪽"</div>
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
          <button className="nav-quick-btn toilet" onClick={() => navigate('/map', { state: { filter: 'toilet' } })}>
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
