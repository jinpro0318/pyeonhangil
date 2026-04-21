import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './hooks/useAppState'

// 온보딩
import Splash from './pages/Splash'
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

export default function App() {
  return (
    <AppProvider>
      <div className="app-shell">
        <Routes>
          {/* 온보딩 */}
          <Route path="/" element={<Splash />} />
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

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </AppProvider>
  )
}
