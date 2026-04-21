import { useNavigate } from 'react-router-dom'
import './SOSButton.css'

export default function SOSButton({ bottom = 90 }) {
  const navigate = useNavigate()
  return (
    <button
      className="sos-fab"
      onClick={() => navigate('/sos')}
      style={{ bottom: `${bottom}px` }}
      aria-label="긴급 SOS"
    >
      SOS
    </button>
  )
}
