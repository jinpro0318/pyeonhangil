import { useNavigate } from 'react-router-dom'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import TabBar from '../components/TabBar'
import './MyInfo.css'

export default function MyInfo() {
  const navigate = useNavigate()
  const { state, updateUser } = useAppState()
  const walk = WALK_STATES[state.user.walkState]

  const changeWalkState = () => {
    navigate('/walk-state')
  }

  const changeName = () => {
    const name = prompt('이름을 입력하세요', state.user.name)
    if (name && name.trim()) {
      updateUser({ name: name.trim() })
    }
  }

  const resetApp = () => {
    if (confirm('모든 정보를 초기화하시겠어요?')) {
      localStorage.clear()
      window.location.href = '/'
    }
  }

  return (
    <>
      <div className="my-page">
        <div className="my-body no-scrollbar">
          <div className="my-profile">
            <div className="my-avatar" onClick={changeName}>
              {state.user.name[0]}
            </div>
            <div className="my-name" onClick={changeName}>
              {state.user.name} 님 ✏️
            </div>
          </div>

          {/* 걸음 상태 - 최상단 노출 */}
          <div className="list-label" style={{ marginTop: 0 }}>
            지금 걸음 상태
          </div>
          <button
            className={`my-walk-card`}
            style={{ background: `var(--${walk.color}-soft)`, borderColor: `var(--${walk.color})` }}
            onClick={changeWalkState}
          >
            <div className="my-walk-icon">{walk.emoji}</div>
            <div className="my-walk-text">
              <div className="my-walk-name">{walk.name}</div>
              <div className="my-walk-sub">눌러서 바꾸기</div>
            </div>
            <div className="my-walk-arrow">›</div>
          </button>

          {/* 이번 달 기록 */}
          <div className="list-label">이번 달 기록</div>
          <div className="my-stats">
            <div className="my-stat">
              <div className="my-stat-num">23번</div>
              <div className="my-stat-lbl">나가셨어요</div>
            </div>
            <div className="my-stat-divider" />
            <div className="my-stat">
              <div className="my-stat-num">18km</div>
              <div className="my-stat-lbl">걸으셨어요</div>
            </div>
          </div>

          {/* 설정 */}
          <div className="list-label">설정</div>

          <button className="action-card">
            <div className="action-card-icon">⭐</div>
            <div className="action-card-text">
              <div className="t">자주 가는 곳</div>
              <div className="s">집 · 병원 · 마트 편집</div>
            </div>
            <span className="chev">›</span>
          </button>

          <button className="action-card">
            <div
              className="action-card-icon"
              style={{ background: 'var(--cat-ramp-soft)', color: 'var(--cat-ramp)' }}
            >
              🔠
            </div>
            <div className="action-card-text">
              <div className="t">글씨 크기</div>
              <div className="s">3단계 조절</div>
            </div>
            <span className="chev">›</span>
          </button>

          <button className="action-card">
            <div
              className="action-card-icon"
              style={{ background: 'var(--cat-cross-soft)', color: 'var(--cat-cross)' }}
            >
              📞
            </div>
            <div className="action-card-text">
              <div className="t">긴급 연락처</div>
              <div className="s">SOS 대상 설정</div>
            </div>
            <span className="chev">›</span>
          </button>

          <button className="action-card" onClick={resetApp}>
            <div
              className="action-card-icon"
              style={{ background: 'var(--walk-red-soft)', color: 'var(--walk-red)' }}
            >
              🔄
            </div>
            <div className="action-card-text">
              <div className="t">초기화</div>
              <div className="s">모든 정보 지우기</div>
            </div>
            <span className="chev">›</span>
          </button>

          <div className="my-footer-info">
            편한길 v1.0.0
          </div>
        </div>
      </div>
      <TabBar />
    </>
  )
}
