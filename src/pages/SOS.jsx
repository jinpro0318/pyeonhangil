import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoice } from '../hooks/useVoice'
import './SOS.css'

export default function SOS() {
  const navigate = useNavigate()
  const { speak } = useVoice()

  useEffect(() => {
    speak('어떤 도움이 필요하세요? 119 구조, 가족 연락, 가까운 쉼터 중 하나를 선택하세요', {
      immediate: true,
    })
  }, [speak])

  const call119 = () => {
    if (confirm('119에 전화하시겠어요?')) {
      window.location.href = 'tel:119'
    }
  }

  const callFamily = () => {
    alert('가족(딸 영수)에게 위치가 전송되었어요')
    navigate(-1)
  }

  const findRest = () => {
    navigate('/map', { state: { filter: 'rest' } })
  }

  return (
    <div className="sos-page">
      <div className="sos-header">
        <div className="sos-label">긴급 도움</div>
        <h1>어떤 도움이<br />필요하세요?</h1>
      </div>

      <div className="sos-options">
        <button className="sos-btn primary" onClick={call119}>
          <span className="sos-btn-icon">📞</span>
          <div className="sos-btn-text">
            <div className="sos-btn-title">119 구조 요청</div>
            <div className="sos-btn-sub">바로 전화 걸려요</div>
          </div>
        </button>

        <button className="sos-btn outline" onClick={callFamily}>
          <span className="sos-btn-icon">👨‍👩‍👧</span>
          <div className="sos-btn-text">
            <div className="sos-btn-title">가족에게 연락</div>
            <div className="sos-btn-sub">딸 영수에게 위치 전송</div>
          </div>
        </button>

        <button className="sos-btn outline" onClick={findRest}>
          <span className="sos-btn-icon">🪑</span>
          <div className="sos-btn-text">
            <div className="sos-btn-title">가장 가까운 쉼터</div>
            <div className="sos-btn-sub">30m · 걸어서 1분</div>
          </div>
        </button>
      </div>

      <div className="sos-notice">
        가족이 지금 어디 계신지<br />보고 계세요
      </div>

      <button className="sos-cancel" onClick={() => navigate(-1)}>
        괜찮아요, 취소
      </button>
    </div>
  )
}
