import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Permissions.css'

export default function Permissions() {
  const navigate = useNavigate()
  const [perms, setPerms] = useState({ location: false, notify: false, voice: false })

  const requestLocation = async () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      () => setPerms((p) => ({ ...p, location: true })),
      () => setPerms((p) => ({ ...p, location: true })) // 거부해도 진행
    )
  }

  const requestNotify = async () => {
    if (!('Notification' in window)) {
      setPerms((p) => ({ ...p, notify: true }))
      return
    }
    await Notification.requestPermission()
    setPerms((p) => ({ ...p, notify: true }))
  }

  const requestVoice = () => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('편한길입니다')
      u.lang = 'ko-KR'
      u.volume = 0.5
      window.speechSynthesis.speak(u)
    }
    setPerms((p) => ({ ...p, voice: true }))
  }

  const allGranted = Object.values(perms).every(Boolean)

  const handleNext = () => {
    localStorage.setItem('pyeonhangil_onboarded', '1')
    navigate('/home')
  }

  const items = [
    {
      key: 'location',
      icon: '📍',
      title: '내 위치 알기',
      desc: '어디 계신지 확인해요',
      action: requestLocation,
    },
    {
      key: 'notify',
      icon: '🔔',
      title: '알림 받기',
      desc: '쉴 곳을 알려드려요',
      action: requestNotify,
    },
    {
      key: 'voice',
      icon: '🎙',
      title: '말로 안내 듣기',
      desc: '화면 안 봐도 들려드려요',
      action: requestVoice,
    },
  ]

  return (
    <div className="perm-page">
      <div className="perm-header">
        <h1>준비가 거의 됐어요</h1>
        <p>편한 길 안내를 위해 아래 세 가지가 필요해요</p>
      </div>

      <div className="perm-list">
        {items.map((it) => {
          const granted = perms[it.key]
          return (
            <div key={it.key} className="perm-item">
              <div className="perm-icon">{it.icon}</div>
              <div className="perm-text">
                <div className="perm-title">{it.title}</div>
                <div className="perm-desc">{it.desc}</div>
              </div>
              {granted ? (
                <div className="perm-status granted">✓ 허용됨</div>
              ) : (
                <button className="perm-btn" onClick={it.action}>
                  허용
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="perm-footer">
        <button
          className={`btn large ${!allGranted ? 'secondary' : ''}`}
          onClick={handleNext}
        >
          {allGranted ? '다음' : '건너뛰고 시작'}
        </button>
      </div>
    </div>
  )
}
