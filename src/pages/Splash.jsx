import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Splash() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    const hasOnboarded = localStorage.getItem('pyeonhangil_onboarded')
    const timer = setTimeout(() => {
      if (!user) navigate('/login', { replace: true })
      else navigate(hasOnboarded ? '/home' : '/intro', { replace: true })
    }, 1500)
    return () => clearTimeout(timer)
  }, [navigate, user, loading])

  return (
    <div className="flex-1 relative flex flex-col items-center justify-center bg-background text-ink-900 animate-fade-in overflow-hidden px-8">
      <div className="absolute inset-x-0 top-0 h-[42%] bg-primary" />
      <div className="relative z-10 w-full">
        <div className="mx-auto mb-7 grid place-items-center">
          <img
            src="/pyeonhangil_icon.png"
            alt="편한길 로고"
            width="180" height="180"
            className="object-contain drop-shadow-2xl"
          />
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-normal mb-3">편한길</h1>
          <p className="text-[17px] text-ink-700 font-bold leading-relaxed">
            계단과 경사를 피해<br />안전한 길을 연결합니다
          </p>
        </div>
      </div>
      <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-2">
        {['공공데이터', '쉬운 길', '가족 안심'].map((label) => (
          <div key={label} className="bg-white border border-ink-200 rounded-lg py-2 text-center text-xs font-extrabold text-ink-700 shadow-sm">
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
