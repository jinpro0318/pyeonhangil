import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoice } from '../hooks/useVoice'
import { useAppState } from '../hooks/useAppState'
import './Arrived.css'

export default function Arrived() {
  const navigate = useNavigate()
  const { speak } = useVoice()
  const { state } = useAppState()
  const destination = state.destination?.name || '목적지'

  useEffect(() => {
    speak('도착했어요. 수고 많으셨어요. 가족에게도 자동으로 알려드렸어요')
  }, [speak])

  return (
    <div className="arrived-page">
      <div className="arrived-gps">
        <div className="gps-indicator">
          <div className="gps-dot"></div>
          📍 GPS로 도착 자동 감지
        </div>
      </div>

      <div className="arrived-icon-wrap">
        <div className="arrived-check">✓</div>
      </div>

      <div className="arrived-title">도착했어요!</div>
      <div className="arrived-dest">{destination}</div>

      <div className="arrived-stats">
        <div className="arrived-label">수고 많으셨어요</div>
        <div className="arrived-stats-row">
          <div className="arrived-stat">
            <div className="arrived-stat-num" style={{ color: 'var(--primary)' }}>
              18분
            </div>
            <div className="arrived-stat-lbl">소요</div>
          </div>
          <div className="arrived-stat">
            <div className="arrived-stat-num" style={{ color: 'var(--cat-rest)' }}>
              2번
            </div>
            <div className="arrived-stat-lbl">쉬었어요</div>
          </div>
        </div>
      </div>

      <div className="arrived-family">
        <span className="arrived-family-check">✓</span>
        <div>
          <div className="arrived-family-title">가족에게 자동으로 알렸어요</div>
          <div className="arrived-family-desc">"무사히 도착하셨어요"</div>
        </div>
      </div>

      <div className="arrived-footer">
        <button className="btn secondary" onClick={() => navigate('/home')}>
          홈으로
        </button>
        <button
          className="btn large"
          onClick={() => navigate('/search?mode=voice')}
        >
          돌아가는 길도 편하게
        </button>
      </div>
    </div>
  )
}
