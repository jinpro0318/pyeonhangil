import { useLocation, useNavigate } from 'react-router-dom'

export default function AppBrand() {
  const location = useLocation()
  const navigate = useNavigate()

  if (location.pathname !== '/home') return null

  const handleClick = () => {
    if (location.pathname !== '/home') navigate('/home')
  }

  return (
    <button
      onClick={handleClick}
      aria-label="편한길 홈으로 이동"
      className="absolute top-2 left-2 z-[200] grid place-items-center transition-transform hover:scale-105 active:scale-95 bg-transparent border-0 p-0"
    >
      <img
        src="/pyeonhangil_icon_clean_edge_20260521.png"
        alt="편한길"
        className="w-12 h-12 object-contain"
      />
    </button>
  )
}
