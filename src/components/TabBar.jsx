import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Map, MessagesSquare, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { path: '/home', label: '홈', Icon: Home },
  { path: '/map', label: '지도', Icon: Map },
  { path: '/community', label: '길 제보', Icon: MessagesSquare },
  { path: '/family', label: '가족', Icon: Users },
  { path: '/my', label: '마이', Icon: User },
]

export default function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav
      className="mx-3 mb-3 flex items-stretch border border-ink-200 bg-white/95 backdrop-blur-md flex-shrink-0 rounded-2xl shadow-md overflow-hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      {TABS.map(({ path, label, Icon }) => {
        const active = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[62px] transition-colors relative',
              active ? 'text-primary bg-primary-50/70' : 'text-ink-400 hover:text-ink-700 hover:bg-ink-50'
            )}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={cn('transition-transform', active ? 'w-6 h-6 scale-110' : 'w-[22px] h-[22px]')} strokeWidth={active ? 2.4 : 2} />
            <span className={cn('text-[11px]', active ? 'font-extrabold' : 'font-semibold')}>{label}</span>
            {active && <span className="absolute top-0 h-0.5 w-7 rounded-full bg-primary" />}
          </button>
        )
      })}
    </nav>
  )
}
