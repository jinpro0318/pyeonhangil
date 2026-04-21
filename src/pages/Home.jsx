import { useNavigate } from 'react-router-dom'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import TabBar from '../components/TabBar'
import SOSButton from '../components/SOSButton'
import { QUICK_DESTINATIONS } from '../data/pois'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const walk = WALK_STATES[state.user.walkState]

  return (
    <>
      <div className="home-page">
        {/* 상단 인사 + 걸음 상태 */}
        <div className="home-top">
          <div>
            <div className="home-greeting">안녕하세요</div>
            <div className="home-name-row">
              <div className="home-name">{state.user.name} 님</div>
              <span className={`chip ${walk.color}`}>
                {walk.emoji} {walk.name}
              </span>
            </div>
          </div>
          <div className="home-avatar">{state.user.name[0]}</div>
        </div>

        {/* 음성/GPS 상태 */}
        <div className="home-status">
          <div className="voice-indicator">
            <div className="voice-dot"></div>
            🎙 말씀하시면 들어요
          </div>
          <div className="gps-indicator">
            <div className="gps-dot"></div>
            📍 GPS 켜짐
          </div>
        </div>

        <div className="home-body no-scrollbar">
          {/* 검색 영역 */}
          <div className="home-search-row">
            <button
              className="home-voice-search"
              onClick={() => navigate('/search?mode=voice')}
            >
              <div className="home-voice-icon">🎙</div>
              <div>
                <div className="home-voice-label">말하기</div>
                <div className="home-voice-title">어디로 가세요?</div>
              </div>
            </button>
            <button
              className="home-text-search"
              onClick={() => navigate('/search?mode=text')}
            >
              <div className="home-text-icon">⌨️</div>
              <div className="home-text-label">글자로</div>
            </button>
          </div>

          {/* 자주 가시는 곳 */}
          <div className="list-label">자주 가시는 곳</div>
          <div className="home-favorites">
            {state.favorites.map((f) => (
              <button
                key={f.id}
                className="home-fav-card"
                onClick={() => navigate('/route', { state: { destination: f } })}
              >
                <div className="home-fav-emoji">{f.emoji}</div>
                <div className="home-fav-name">{f.name}</div>
                <div className="home-fav-addr">{f.address}</div>
              </button>
            ))}
            <button className="home-fav-add">
              <div className="home-fav-plus">+</div>
              <div className="home-fav-add-label">추가</div>
            </button>
          </div>

          {/* 급할 때 바로 찾기 */}
          <div className="list-label">급할 때 바로 찾기</div>
          <div className="home-quick">
            {QUICK_DESTINATIONS.map((q) => (
              <button
                key={q.id}
                className={`home-quick-btn cat-${q.type}`}
                onClick={() => navigate('/map', { state: { filter: q.type } })}
              >
                <div className="home-quick-emoji">{q.emoji}</div>
                <div className="home-quick-label">{q.label}</div>
              </button>
            ))}
          </div>
        </div>

        <SOSButton bottom={90} />
      </div>
      <TabBar />
    </>
  )
}
