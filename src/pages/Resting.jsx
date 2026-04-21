import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoice } from '../hooks/useVoice'
import './Resting.css'

export default function Resting() {
  const navigate = useNavigate()
  const { speak } = useVoice()
  const [restTime, setRestTime] = useState(3)

  useEffect(() => {
    speak('쉬고 계시네요. 충분히 쉬시고 천천히 일어나서 걸어가세요')
    const interval = setInterval(() => {
      setRestTime((t) => t + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [speak])

  const handleResume = () => {
    speak('다시 안내를 시작할게요', { immediate: true })
    navigate('/navigation')
  }

  return (
    <div className="rest-page">
      <div className="rest-status">
        <div className="gps-indicator">
          <div className="gps-dot"></div>
          📍 같은 곳 · {restTime}분 정지
        </div>
      </div>

      <div className="rest-main">
        <div className="rest-icon-wrap">
          <div className="rest-icon">🪑</div>
        </div>

        <div className="rest-tag">📍 GPS로 인식했어요</div>
        <h1 className="rest-title">쉬고 계시네요</h1>
        <p className="rest-sub">
          충분히 쉬시고<br />
          천천히 일어나서 걸어가세요
        </p>
      </div>

      <div className="rest-auto">
        <div className="rest-auto-icon">▶</div>
        <div>
          <div className="rest-auto-title">다시 걸으시면 자동 재개</div>
          <div className="rest-auto-desc">
            아무것도 누르지 마세요. GPS가 걸음을 감지하면 바로 안내해요
          </div>
        </div>
      </div>

      <div className="rest-voice-hint">
        <span>🎙</span>
        <span>"이제 가자"라고 말씀하시면 바로 안내 재개돼요</span>
      </div>

      <div className="rest-stats">
        <div className="rest-stat">
          <div className="rest-stat-num" style={{ color: 'var(--cat-rest)' }}>
            {restTime}분
          </div>
          <div className="rest-stat-lbl">쉬신 시간</div>
        </div>
        <div className="rest-stat-divider" />
        <div className="rest-stat">
          <div className="rest-stat-num" style={{ color: 'var(--primary)' }}>9분</div>
          <div className="rest-stat-lbl">더 가시면 도착</div>
        </div>
      </div>

      <button className="btn large" onClick={handleResume}>
        지금 다시 출발
      </button>
    </div>
  )
}
