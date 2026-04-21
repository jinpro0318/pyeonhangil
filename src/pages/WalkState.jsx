import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import './WalkState.css'

export default function WalkState() {
  const navigate = useNavigate()
  const { state, updateUser } = useAppState()
  const [selected, setSelected] = useState(state.user.walkState || 'slow')

  const handleComplete = () => {
    updateUser({ walkState: selected })
    navigate('/home')
  }

  return (
    <div className="walk-page">
      <div className="walk-header">
        <div className="walk-tag">마지막 단계</div>
        <h1 className="walk-title">
          어떤 걸음이<br />가장 편하세요?
        </h1>
        <p className="walk-sub">
          선택하시면 걸음에 맞춰<br />길을 찾아드려요
        </p>
      </div>

      <div className="walk-options">
        {Object.values(WALK_STATES).map((opt) => (
          <button
            key={opt.id}
            className={`walk-option ${selected === opt.id ? 'selected' : ''}`}
            onClick={() => setSelected(opt.id)}
          >
            <div
              className="walk-option-icon"
              style={{ background: `var(--${opt.color}-soft)` }}
            >
              {opt.emoji}
            </div>
            <div className="walk-option-text">
              <div className="walk-option-t">{opt.name}</div>
              <div className="walk-option-s">{opt.desc}</div>
            </div>
            <div className="walk-check">
              {selected === opt.id ? '✓' : ''}
            </div>
          </button>
        ))}
      </div>

      <div className="walk-note">
        📍 실제 걸음 속도는 <strong>GPS가 자동으로 측정</strong>해서 더 정확히 맞춰드려요
      </div>

      <button className="btn large" onClick={handleComplete}>
        시작하기
      </button>
    </div>
  )
}
