import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Footprints, Armchair, Users, TriangleAlert } from 'lucide-react'
import { Button } from '../components/ui/button'
import { IconBadge } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    // 1단계 — 어떤 서비스 (환영 단계는 스플래시가 대신함)
    badge: '어떤 서비스인가요?',
    title: '교통약자를 위한\n배리어프리 길안내',
    sub: '교통약자에게 필요한 이동 정보를\n확인할 수 있어요',
  },
  {
    // 2단계 — 편한길은 이렇게
    badge: '편한길은 이렇게 달라요',
    title: '공공데이터로\n더 안전한 길을 연결합니다',
    sub: '교통약자 맞춤 경로 추천부터\n실시간 안전 정보까지 한 번에 안내해요',
    cards: [
      { Icon: Footprints,    label: '계단·경사 피한 경로 추천', tone: 'primary' },
      { Icon: Armchair,      label: '쉼터·엘리베이터 위치 안내', tone: 'success' },
      { Icon: Users,         label: '가족 안심 위치 공유',       tone: 'violet' },
      { Icon: TriangleAlert, label: '실시간 위험 구간 제보',     tone: 'warning' },
    ],
  },
]

// 단계별 테마 — 전 단계를 인디고/블루 쿨톤으로 통일하고 배경만 은은하게 변주
const STEP_THEME = [
  {
    bg:      'bg-primary-50',
    badge:   'bg-primary text-white border-primary',
    dot:     'bg-primary',
    variant: 'default',
  },
  {
    bg:      'bg-indigo-50',
    badge:   'bg-primary text-white border-primary',
    dot:     'bg-primary',
    variant: 'default',
  },
]

export default function Intro() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const touchStartX = useRef(null)
  const current = STEPS[step]
  const theme = STEP_THEME[step]

  const goHome = () => {
    localStorage.setItem('pyeonhangil_onboarded', '1')
    navigate('/home', { replace: true })
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
    else goHome()
  }

  const handlePrev = () => {
    setStep((prev) => Math.max(0, prev - 1))
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const diff = touchStartX.current - endX
    touchStartX.current = null
    if (Math.abs(diff) < 48) return
    if (diff > 0) handleNext()
    else handlePrev()
  }

  return (
    <div
      className={cn('flex-1 flex flex-col px-6 py-6 transition-colors duration-500', theme.bg)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="min-h-[64px] flex items-center">
        <button
          onClick={goHome}
          className="ml-auto text-sm font-bold text-ink-500 py-2 px-3 rounded-lg hover:bg-white border border-transparent hover:border-ink-200"
        >
          건너뛰기 ›
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {current.badge && (
          <div className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-extrabold shadow-sm self-start mb-5 transition-colors duration-500', theme.badge)}>
            {current.badge}
          </div>
        )}

        <h1 className="text-2xl leading-[1.18] font-extrabold tracking-normal whitespace-pre-line mb-4">
          {current.title}
        </h1>

        <p className="text-sm text-ink-500 leading-relaxed break-keep whitespace-pre-line">
          {current.sub}
        </p>

        {current.cards && (
          <div className="mt-8 grid grid-cols-2 gap-2.5">
            {current.cards.map(({ Icon, label, tone }) => (
              <div
                key={label}
                className="flex flex-col gap-2.5 bg-white border border-black/[0.04] rounded-xl px-4 py-4 shadow-card"
              >
                <IconBadge Icon={Icon} tone={tone} size="sm" />
                <span className="text-base font-bold text-ink-800 leading-snug break-keep">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-500',
                i === step ? cn('w-8', theme.dot) : 'w-1.5 bg-ink-200'
              )}
            />
          ))}
        </div>
        <Button size="xl" variant={theme.variant} className="w-full" onClick={handleNext}>
          {step < STEPS.length - 1 ? '다음으로 넘기기' : '편한길 시작하기'}
        </Button>
      </div>
    </div>
  )
}
