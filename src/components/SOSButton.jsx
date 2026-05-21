import { useNavigate } from 'react-router-dom'
import { LifeBuoy } from 'lucide-react'

export default function SOSButton({ bottom = 90 }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/sos')}
      aria-label="긴급 SOS"
      className="fixed right-4 z-[150] w-14 h-14 rounded-full bg-danger text-white shadow-danger flex flex-col items-center justify-center gap-0 font-extrabold text-[11px] tracking-tight active:scale-95 transition-transform hover:bg-danger-600"
      style={{ bottom: `${bottom}px` }}
    >
      <LifeBuoy className="w-5 h-5 mb-0.5" strokeWidth={2.5} />
      <span>SOS</span>
    </button>
  )
}
