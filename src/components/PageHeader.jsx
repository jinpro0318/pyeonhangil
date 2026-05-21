import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function PageHeader({ title, backTo, onBack, action, transparent = false }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) return onBack()
    if (backTo) return navigate(backTo)
    navigate(-1)
  }

  return (
    <header
      className={`flex items-center gap-2 px-4 min-h-[64px] flex-shrink-0 ${
        transparent ? 'bg-transparent' : 'bg-white border-b border-ink-100'
      }`}
    >
      <button
        onClick={handleBack}
        aria-label="뒤로 가기"
        className="w-10 h-10 rounded-lg grid place-items-center text-ink-700 hover:bg-ink-100 active:bg-ink-200 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="flex-1 text-lg font-bold tracking-normal">{title}</div>
      {action && (
        <button
          onClick={action.onClick}
          aria-label={action.label}
          className="text-[15px] font-bold text-primary px-3 py-2 rounded-lg min-h-[44px] hover:bg-primary-50"
        >
          {action.label}
        </button>
      )}
    </header>
  )
}
