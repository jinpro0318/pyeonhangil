import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGPS } from '../hooks/useGPS'
import { useVoice } from '../hooks/useVoice'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import SOSButton from '../components/SOSButton'
import './Navigation.css'

export default function Navigation() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const { speak, isSpeaking } = useVoice()
  const { speedMeterPerMin, isStaying, isTracking, start } = useGPS({
    stayThresholdSeconds: 180,
  })
  const [remainingTime, setRemainingTime] = useState(12)
  const walk = WALK_STATES[state.user.walkState]
  const destination = state.destination?.name || '병원'

  useEffect(() => {
    start()
    speak(`${destination}까지 ${remainingTime}분 남았어요. 잠시 후 오른쪽으로 도세요`)
    // eslint-disable-next-line
  }, [])

  // GPS 체류 감지 → 자동으로 쉬고 계신 중 화면으로 전환
  useEffect(() => {
    if (isStaying) {
      navigate('/resting')
    }
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
      <div className="nav-top">
        {/* 음성 + GPS 상태 */}
        <div className="nav-status">
          <div className="voice-indicator">
            <div className="voice-dot"></div>
            {isSpeaking ? '🔊 말하는 중' : '🎙 대기 중'}
          </div>
          <div className="gps-indicator">
            <div className="gps-dot"></div>
            📍 {isTracking ? `분당 ${Math.max(speedMeterPerMin, 40)}m` : 'GPS 켜는 중'}
          </div>
        </div>

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

        {/* 음성 명령 힌트 */}
        <div className="nav-commands">
          <div className="nav-commands-label">🎙 말씀하셔도 돼요</div>
          <div className="nav-commands-list">
            <span className="nav-cmd">"다시 말해줘"</span>
            <span className="nav-cmd">"힘들어"</span>
            <span className="nav-cmd">"화장실"</span>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="nav-quick">
          <button className="nav-quick-btn warn" onClick={() => navigate('/resting')}>
            <div className="nav-quick-emoji">😮‍💨</div>
            <div className="nav-quick-label">힘들어요</div>
          </button>
          <button className="nav-quick-btn toilet">
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
