import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Splash.css'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('pyeonhangil_onboarded')
    const timer = setTimeout(() => {
      navigate(hasOnboarded ? '/home' : '/intro')
    }, 1800)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="splash">
      <img
        className="splash-logo-img"
        src="/pyeonhangil_icon.png"
        alt="편한길 로고"
        width="120"
        height="120"
      />
      <h1 className="splash-title">편한길</h1>
      <p className="splash-sub">편하고 안전한 걸음을 위해</p>
      <div className="splash-footer">PyeonhanGil</div>
    </div>
  )
}
