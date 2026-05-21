import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider } from './hooks/useAppState'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AppBrand from './components/AppBrand'

// 온보딩
import Splash from './pages/Splash'
import Login from './pages/Login'
import Intro from './pages/Intro'
import Permissions from './pages/Permissions'
import WalkState from './pages/WalkState'

// 메인
import Home from './pages/Home'
import Search from './pages/Search'
import RouteSuggest from './pages/RouteSuggest'
import MapMain from './pages/MapMain'

// 길 안내
import Navigation from './pages/Navigation'
import Resting from './pages/Resting'
import Arrived from './pages/Arrived'
import SOS from './pages/SOS'

// 설정
import Family from './pages/Family'
import MyInfo from './pages/MyInfo'
import Community from './pages/Community'
import Settings from './pages/Settings'
import EmergencyContacts from './pages/EmergencyContacts'
import Favorites from './pages/Favorites'
import Admin from './pages/Admin'
import { isAdminEmail } from './lib/admin'

function RequireAdmin({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!isAdminEmail(user.email)) return <Navigate to="/home" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="app-shell">
          <AppBrand />
          <Routes>
            {/* 온보딩 */}
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/permissions" element={<Permissions />} />
            <Route path="/walk-state" element={<WalkState />} />

            {/* 메인 */}
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/route" element={<RouteSuggest />} />
            <Route path="/map" element={<MapMain />} />

            {/* 길 안내 */}
            <Route path="/navigation" element={<Navigation />} />
            <Route path="/resting" element={<Resting />} />
            <Route path="/arrived" element={<Arrived />} />
            <Route path="/sos" element={<SOS />} />

            {/* 설정 */}
            <Route path="/family" element={<Family />} />
            <Route path="/my" element={<MyInfo />} />
            <Route path="/community" element={<Community />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/emergency" element={<EmergencyContacts />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AppProvider>
    </AuthProvider>
  )
}
