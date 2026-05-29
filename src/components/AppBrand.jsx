import { useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function AppBrand() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  if (location.pathname !== '/home') return null

  return (
    <header className="flex items-center justify-between px-5 min-h-[64px] flex-shrink-0 bg-white">
      <h1 className="text-xl font-extrabold text-ink-900 tracking-normal">홈화면</h1>

      <button
        type="button"
        onClick={() => navigate(user ? '/my' : '/login', { state: { from: '/home' } })}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white px-3 py-2 text-xs font-extrabold text-primary shadow-sm active:scale-95 min-h-[40px]"
      >
        <LogIn className="w-3.5 h-3.5" />
        {user ? '내 정보' : '로그인/회원가입'}
      </button>
    </header>
  )
}
