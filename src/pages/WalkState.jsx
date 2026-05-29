import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, MapPin } from 'lucide-react'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { Button } from '../components/ui/button'
import { IconBadge, walkIcon } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const WALK_BG = {
  older: 'bg-success-50 border-success/40',
  wheelchair: 'bg-primary-50 border-primary/30',
  visual: 'bg-warning-50 border-warning/40',
  stroller: 'bg-walk-stroller-soft border-walk-stroller/40',
  injured: 'bg-danger-50 border-danger/30',
}

export default function WalkState() {
  const navigate = useNavigate()
  const { state, updateUser } = useAppState()
  const [selected, setSelected] = useState(WALK_STATES[state.user.walkState]?.id || 'older')

  const handleComplete = () => {
    updateUser({ walkState: selected })
    navigate('/home')
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-10 pb-6 bg-background">
      <div className="pl-[64px] mb-6">
        <div className="app-chip mb-3">
          마지막 단계
        </div>
        <h1 className="text-3xl font-extrabold tracking-normal mb-2">
          어떤 이동 지원이<br />필요하신가요?
        </h1>
        <p className="text-base text-ink-500 font-semibold leading-relaxed">
          교통약자 유형에 맞춰<br />걷는 길과 대중교통을 함께 안내해요
        </p>
      </div>

      <div className="space-y-3 flex-1">
        {Object.values(WALK_STATES).map((opt) => {
          const sel = selected === opt.id
          const { Icon, tone } = walkIcon(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              aria-pressed={sel}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left active:scale-[0.99]',
                sel ? `${WALK_BG[opt.id]} shadow-md` : 'bg-white border-ink-200/70 shadow-sm'
              )}
            >
              <IconBadge Icon={Icon} tone={tone} variant={sel ? 'solid' : 'soft'} size="lg" />
              <div className="flex-1">
                <div className="text-[17px] font-extrabold">{opt.name}</div>
                <div className="text-sm text-ink-500 mt-0.5 leading-snug">{opt.desc}</div>
              </div>
              <div className={cn('w-7 h-7 rounded-full grid place-items-center flex-shrink-0 transition-colors', sel ? 'bg-primary text-white' : 'border-2 border-ink-200')}>
                {sel && <Check className="w-4 h-4" strokeWidth={3} />}
              </div>
            </button>
          )
        })}
      </div>

      <div className="p-3.5 bg-white border border-primary-100 rounded-xl text-sm text-primary-700 font-semibold mt-5 mb-4 leading-relaxed flex items-start gap-2 shadow-sm">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>선택한 유형에 따라 <strong>엘리베이터·쉼터·횡단보도</strong> 우선순위가 달라져요</span>
      </div>

      <Button size="xl" className="w-full" onClick={handleComplete}>
        시작하기
      </Button>
    </div>
  )
}
