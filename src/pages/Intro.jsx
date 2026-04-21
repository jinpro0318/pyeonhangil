import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Intro.css'

const STEPS = [
  {
    emoji: '🏡',
    title: '계단 걱정 없이\n편하게 다니세요',
    sub: '계단이 적고,\n쉴 곳이 있는 길만 알려드려요',
  },
  {
    emoji: '💙',
    title: '세 가지를 도와드려요',
    features: [
      { icon: '🪑', t: '쉼터·화장실 알림', s: '쉴 곳이 가까워지면 알려요' },
      { icon: '🚸', t: '안전한 횡단보도', s: '천천히 건너도 안전한 곳' },
      { icon: '👨‍👩‍👧', t: '가족에게 자동 알림', s: '위치·도착·쉼 실시간 공유' },
    ],
  },
]

export default function Intro() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
    else navigate('/permissions')
  }

  return (
    <div className="intro-page">
      <div className="intro-skip">
        <button className="skip-btn" onClick={() => navigate('/permissions')}>
          건너뛰기 ›
        </button>
      </div>

      <div className="intro-content">
        {!current.features ? (
          <>
            <div className="intro-illust">
              <span className="intro-emoji">{current.emoji}</span>
            </div>
            <h1 className="intro-title">{current.title}</h1>
            <p className="intro-sub">{current.sub}</p>
          </>
        ) : (
          <>
            <h1 className="intro-title" style={{ textAlign: 'left', marginTop: 0 }}>
              {current.title}
            </h1>
            <div className="feature-list">
              {current.features.map((f, i) => (
                <div key={i} className="action-card">
                  <div className="action-card-icon" style={{ fontSize: 22 }}>
                    {f.icon}
                  </div>
                  <div className="action-card-text">
                    <div className="t">{f.t}</div>
                    <div className="s">{f.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="intro-footer">
        <div className="dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`d ${i === step ? 'on' : ''}`} />
          ))}
        </div>
        <button className="btn large" onClick={handleNext}>
          {step < STEPS.length - 1 ? '다음' : '계속'}
        </button>
      </div>
    </div>
  )
}
