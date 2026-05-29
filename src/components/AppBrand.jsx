import { useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function AppBrand() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  if (location.pathname !== '/home') return null

  return (
    <header className="flex items-center justify-between px-4 h-14 flex-shrink-0 bg-white">
      <button
        type="button"
        aria-label="편한길"
        className="flex items-center gap-1.5 bg-transparent border-0 p-0 active:scale-95"
      >
        <img
          src="/pyeonhangil_icon_clean.png"
          alt=""
          className="w-10 h-10 object-contain"
        />
        <span className="text-[17px] font-extrabold text-ink-900 tracking-tight">편한길</span>
      </button>

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
