import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { useVoice } from '../hooks/useVoice'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useGPS } from '../hooks/useGPS'
import { SAMPLE_POIS } from '../data/pois'
import './RouteSuggest.css'

export default function RouteSuggest() {
  const location = useLocation()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const { state, setDestination } = useAppState()
  const { speak } = useVoice()
  const { position, start } = useGPS({ enableStayDetection: false })

  const destination = location.state?.destination || {
    name: '서울대학교병원',
    address: '서울 종로구 대학로 101',
  }

  const walk = WALK_STATES[state.user.walkState]

  const estimatedTime =
    walk.id === 'slow' ? 18 :
    walk.id === 'very-slow' ? 24 :
    walk.id === 'needs-help' ? 30 :
    20

  // 경로 미리보기 - 주변 쉼터/화장실 표시
  const routePois = SAMPLE_POIS.filter((p) => ['rest', 'toilet', 'cross'].includes(p.type)).slice(0, 5)
  useKakaoMap(mapRef, {
    pois: routePois,
    center: position,
    myLocation: position,
    level: 5,
  })

  useEffect(() => {
    start()
    speak(`${destination.name}까지 ${estimatedTime}분 걸리는 편한 길을 찾았어요`)
    // eslint-disable-next-line
  }, [])

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
        {/* 경로 미리보기 지도 */}
        <div className="route-map" ref={mapRef}>
          <div className="route-map-fallback">🗺️ 지도 불러오는 중...</div>
        </div>

        {/* 출발-도착 표시 */}
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
