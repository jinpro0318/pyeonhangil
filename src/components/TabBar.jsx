import { useNavigate, useLocation } from 'react-router-dom'
import './TabBar.css'

const TABS = [
  { path: '/home', label: '홈', icon: '🏠' },
  { path: '/map', label: '지도', icon: '🗺️' },
  { path: '/community', label: '커뮤니티', icon: '💬' },
  { path: '/family', label: '가족', icon: '👨‍👩‍👧' },
  { path: '/my', label: '내 정보', icon: '👤' },
]

export default function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="tabbar">
      {TABS.map((tab) => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            className={`tab ${active ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <div className="tab-icon">{tab.icon}</div>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
