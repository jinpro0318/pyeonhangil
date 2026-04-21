import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { useVoice } from '../hooks/useVoice'
import './RouteSuggest.css'

export default function RouteSuggest() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state, setDestination } = useAppState()
  const { speak } = useVoice()

  const destination = location.state?.destination || {
    name: '서울대학교병원',
    address: '서울 종로구 대학로 101',
  }

  const walk = WALK_STATES[state.user.walkState]

  // 걸음 상태별 예상 시간
  const estimatedTime =
    walk.id === 'slow' ? 18 :
    walk.id === 'very-slow' ? 24 :
    walk.id === 'needs-help' ? 30 :
    20

  useEffect(() => {
    speak(`${destination.name}까지 ${estimatedTime}분 걸리는 편한 길을 찾았어요`)
  }, [destination, estimatedTime, speak])

  const handleStart = () => {
    setDestination(destination)
    navigate('/navigation')
  }

  return (
    <div className="route-page">
      <div className="route-header">
        <button className="search-back" onClick={() => navigate(-1)}>‹</button>
        <h2>편한 길</h2>
      </div>

      <div className="route-body">
        {/* 경로 표시 */}
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

        {/* 걸음 기준 배지 */}
        <div className={`chip ${walk.color}`} style={{ alignSelf: 'flex-start' }}>
          {walk.emoji} {walk.name} · 걸음 기준 맞춤
        </div>

        {/* 추천 경로 카드 */}
        <div className="route-recommend">
          <div className="route-badge">편하고 안전한 길</div>

          <div className="route-time">
            <span className="route-time-num">{estimatedTime}</span>
            <span className="route-time-unit">분</span>
            <span className="route-time-dist">· 1.1km</span>
          </div>

          <div className="route-features">
            <div className="route-feat">
              <span className="route-check">✓</span>
              <span>계단 없어요</span>
            </div>
            <div className="route-feat">
              <span className="route-check">✓</span>
              <span>쉴 곳 3군데 · 화장실 2곳</span>
            </div>
            <div className="route-feat">
              <span className="route-check">✓</span>
              <span>안전 횡단보도 2곳</span>
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
