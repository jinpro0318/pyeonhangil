import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Armchair, Database, ShieldCheck, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    badge: '교통약자 맞춤 내비게이션',
    title: '흩어진 이동 정보를\n하나의 길로 연결해요',
    sub: '엘리베이터·쉼터·무장애 화장실·횡단보도 정보를 모아 계단과 경사가 적은 길을 안내합니다',
  },
  {
    badge: '왜 필요한가요',
    title: '가까운 길보다\n갈 수 있는 길이 먼저예요',
    sub: '최단거리만 보면 계단, 짧은 신호, 쉴 곳 부족 때문에 외출을 포기하게 됩니다',
  },
  {
    badge: '편한길이 하는 일',
    title: '세 가지를 함께 봅니다',
    features: [
      { Icon: Database, color: 'bg-primary-50 text-primary', t: '공공데이터 통합', s: '흩어진 시설 정보를 경로 위에 모아요' },
      { Icon: ShieldCheck, color: 'bg-danger-50 text-danger', t: '이동 부담 기준', s: '계단·경사·횡단 위험을 먼저 봐요' },
      { Icon: Users, color: 'bg-success-50 text-success-600', t: '가족 안심 공유', s: '위치·도착·휴식 상태를 나눠요' },
      { Icon: Armchair, color: 'bg-warning-50 text-warning', t: '실시간 제보 보완', s: '공사·장애물 정보를 함께 업데이트해요' },
    ],
  },
]

export default function Intro() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
    else navigate('/permissions')
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-6 bg-background">
      <div className="min-h-[64px] flex justify-end items-center pl-[64px]">
        <button
          onClick={() => navigate('/permissions')}
          className="text-sm font-bold text-ink-500 py-2 px-3 rounded-lg hover:bg-white border border-transparent hover:border-ink-200"
        >
          건너뛰기 ›
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {!current.features ? (
          <div>
            <div className="app-chip mb-5">
              {current.badge}
            </div>
            <h1 className="text-[32px] leading-[1.18] font-extrabold tracking-normal whitespace-pre-line mb-4">
              {current.title}
            </h1>
            <p className="text-base text-ink-500 font-semibold leading-relaxed break-keep">
              {current.sub}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-2">
              {['계단 회피', '경사 고려', '중간 쉼터', '보호자 공유'].map((label) => (
                <div key={label} className="bg-white border border-ink-200 rounded-lg px-3 py-3 text-sm font-extrabold text-ink-700 shadow-sm">
                  {label}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="app-chip self-start mb-4">
              {current.badge}
            </div>
            <h1 className="text-[30px] leading-[1.18] font-extrabold tracking-normal mb-6">{current.title}</h1>
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
                'h-1.5 rounded-full transition-all',
                i === step ? 'w-8 bg-primary' : 'w-1.5 bg-ink-200'
              )}
            />
          ))}
        </div>
        <Button size="xl" className="w-full" onClick={handleNext}>
          {step < STEPS.length - 1 ? '다음' : '계속'}
        </Button>
      </div>
    </div>
  )
}
