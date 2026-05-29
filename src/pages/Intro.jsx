import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Armchair, Database, ShieldCheck, Users, TrainFront, Timer } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Stairs } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    badge: '어떤 앱이에요?',
    title: '버스·지하철·걷는 길까지\n한 번에 편하게 안내해요',
    sub: '버스·지하철 환승부터 걷는 구간의 엘리베이터, 쉬어갈 곳, 화장실, 안전한 횡단보도까지 — 가시는 길 전체를 함께 모아서 알려드려요',
  },
  {
    badge: '왜 필요할까요',
    title: '지름길이라도\n갈 수 없으면 소용없잖아요',
    sub: '계단이 많은 길, 신호가 짧은 길, 환승이 복잡한 역, 쉬어갈 곳이 없는 길은 가시기 어려우니까요. 그 부분을 먼저 살펴드릴게요',
    chips: [
      { Icon: Stairs, label: '계단' },
      { Icon: TrainFront, label: '복잡한 환승' },
      { Icon: Timer, label: '짧은 신호' },
      { Icon: Armchair, label: '쉴 곳 부족' },
    ],
  },
  {
    badge: '이렇게 도와드려요',
    title: '',
    features: [
      { Icon: Database, color: 'bg-primary-50 text-primary', t: '쉬어갈 곳 알려드려요', s: '정류장·역과 걷는 길의 쉼터·화장실·엘리베이터를 함께 보여드려요' },
      { Icon: ShieldCheck, color: 'bg-danger-50 text-danger', t: '편한 길로 안내해요', s: '걷는 구간은 계단·경사를 피하고, 긴 거리는 대중교통으로 나눠 편하게 안내해요' },
      { Icon: Users, color: 'bg-success-50 text-success-600', t: '가족이 알 수 있어요', s: '도착했을 때, 잠시 쉬실 때 가족에게 자동으로 알려드려요' },
      { Icon: Armchair, color: 'bg-warning-50 text-warning', t: '함께 만드는 길 정보', s: '다른 분이 알려주신 공사·장애물 정보가 실시간으로 반영돼요' },
    ],
  },
]

// 단계별 테마 — 배경은 결이 다른 톤으로 분리, 뱃지/버튼은 의미색 유지
// 1단계 환영: 따뜻한 크림 + 파랑 강조
// 2단계 문제: 차분한 라벤더 + 주황 강조 (대비)
// 3단계 해결: 산뜻한 민트 + 초록 강조 (조화)
const STEP_THEME = [
  {
    bg:      'bg-amber-50',
    badge:   'bg-primary text-white border-primary',
    dot:     'bg-primary',
    variant: 'default',
  },
  {
    bg:      'bg-violet-50',
    badge:   'bg-warning text-white border-warning',
    dot:     'bg-warning',
    variant: 'warning',
  },
  {
    bg:      'bg-teal-50',
    badge:   'bg-success-600 text-white border-success-600',
    dot:     'bg-success-600',
    variant: 'success',
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
        {!current.features ? (
          <div>
            <div className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold shadow-sm mb-5 transition-colors duration-500', theme.badge)}>
              {current.badge}
            </div>
            <h1 className="text-[32px] leading-[1.18] font-extrabold tracking-normal whitespace-pre-line mb-4">
              {current.title}
            </h1>
            <p className="text-base text-ink-500 font-semibold leading-relaxed break-keep">
              {current.sub}
            </p>
            {current.chips && (
              <div className="mt-8 grid grid-cols-2 gap-2">
                {current.chips.map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-white border border-ink-200 rounded-lg px-3 py-3 text-sm font-extrabold text-ink-700 shadow-sm">
                    <Icon className="w-4 h-4 flex-shrink-0 text-ink-500" />
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold shadow-sm self-start mb-6 transition-colors duration-500', theme.badge)}>
              {current.badge}
            </div>
            <div className="space-y-2.5">
              {current.features.map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white border border-ink-200 rounded-xl min-h-[76px] shadow-sm">
                  <div className={cn('w-12 h-12 rounded-lg grid place-items-center flex-shrink-0 border border-current/10', f.color)}>
                    <f.Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[17px] font-bold">{f.t}</div>
                    <div className="text-sm text-ink-500 mt-0.5">{f.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
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
          {step < STEPS.length - 1 ? '다음으로 넘기기' : '이제 시작해 볼게요'}
        </Button>
      </div>
    </div>
  )
}
