import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BellRing, Keyboard, MapPinned, Mic, Plus, Route, Users,
} from 'lucide-react'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { useGPS } from '../hooks/useGPS'
import TabBar from '../components/TabBar'
import SOSButton from '../components/SOSButton'
import { QUICK_DESTINATIONS } from '../data/pois'
import { Card } from '../components/ui/card'
import { cn } from '@/lib/utils'

const WALK_CHIP = {
  older: 'bg-success-50 text-success-600 border-success/20',
  wheelchair: 'bg-primary-50 text-primary border-primary/20',
  visual: 'bg-warning-50 text-warning border-warning/20',
  stroller: 'bg-walk-stroller-soft text-walk-stroller',
  injured: 'bg-danger-50 text-danger border-danger/20',
}

export default function Home() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const { hasPosition, error: gpsError, start } = useGPS({ enableStayDetection: false })
  const walk = WALK_STATES[state.user.walkState] || WALK_STATES.older

  useEffect(() => { start() }, [start])

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 사용자 상태 */}
        <div className="min-h-[82px] pl-[64px] pr-[22px] pt-2 pb-3 flex items-center flex-shrink-0 bg-background">
          <div className="min-w-0 flex-1">
            <div className="text-sm text-ink-700 font-extrabold truncate">
              {state.user.name}님의 안전한 이동을 도와드려요
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button
                type="button"
                onClick={() => navigate('/walk-state')}
                className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-transform active:scale-95', WALK_CHIP[walk.id])}
              >
                <span>{walk.emoji}</span>
                {walk.name}
              </button>
              <div className="gps-indicator">
                <div className="gps-dot" /> {hasPosition ? 'GPS 켜짐' : gpsError ? '위치 확인 필요' : 'GPS 확인 중'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-[22px] pb-24">
          {/* 검색 영역 */}
          <div className="grid grid-cols-[2fr_1fr] gap-3 mb-6">
            <button
              onClick={() => navigate('/search?mode=voice')}
              className="bg-primary text-white rounded-xl p-5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform shadow-primary"
            >
              <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/10 grid place-items-center flex-shrink-0">
                <Mic className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold opacity-80">말씀하시면 들어요</div>
                <div className="text-base font-extrabold truncate">어디로 가세요?</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/search?mode=text')}
              className="bg-white border border-ink-200 rounded-xl p-5 flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform shadow-sm"
            >
              <Keyboard className="w-6 h-6 text-ink-700" />
              <div className="text-sm font-bold text-ink-700">글자로</div>
            </button>
          </div>

          <SectionLabel>오늘의 편한길 흐름</SectionLabel>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <ActionCard
              Icon={Route}
              tone="primary"
              title="편한 경로 찾기"
              desc="목적지를 먼저 입력해요"
              onClick={() => navigate('/search?mode=text')}
            />
            <ActionCard
              Icon={MapPinned}
              tone="success"
              title="근처 시설 보기"
              desc="쉼터·화장실·엘리베이터"
              onClick={() => navigate('/map')}
            />
            <ActionCard
              Icon={BellRing}
              tone="warning"
              title="길 제보하기"
              desc="공사·장애물 공유"
              onClick={() => navigate('/community')}
            />
            <ActionCard
              Icon={Users}
              tone="danger"
              title="가족 안심"
              desc="위치와 도착 상태 공유"
              onClick={() => navigate('/family')}
            />
          </div>

          {/* 자주 가시는 곳 */}
          <SectionLabel>자주 가시는 곳</SectionLabel>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {state.favorites.map((f) => (
              <Card
                key={f.id}
                onClick={() => navigate('/route', { state: { destination: f } })}
                className="p-4 cursor-pointer active:scale-[0.98] transition-transform hover:border-primary-200"
              >
                <div className="text-3xl mb-2">{f.emoji}</div>
                <div className="text-base font-bold leading-tight truncate">{f.name}</div>
                <div className="text-xs text-ink-500 truncate mt-0.5">{f.address}</div>
              </Card>
            ))}
            <button
              onClick={() => navigate('/favorites')}
              aria-label="자주 가는 곳 편집"
              className="border-2 border-dashed border-ink-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-ink-400 active:scale-[0.98] transition-transform hover:border-primary hover:text-primary min-h-[100px]"
            >
              <Plus className="w-6 h-6" />
              <div className="text-sm font-bold">편집</div>
            </button>
          </div>

          {/* 급할 때 바로 찾기 */}
          <SectionLabel>급할 때 바로 찾기</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_DESTINATIONS.map((q) => {
              return (
                <button
                  key={q.id}
                  onClick={() => navigate('/map', { state: { filter: q.type } })}
                  className="bg-white border border-ink-200 hover:bg-ink-50 rounded-xl py-4 flex flex-col items-center gap-1.5 active:scale-95 transition-transform shadow-sm"
                >
                  <div className="text-2xl">{q.emoji}</div>
                  <div className="text-sm font-bold text-ink-700">{q.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        <SOSButton bottom={90} />
      </div>
      <TabBar />
    </>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="text-[13px] font-bold text-ink-500 tracking-tight mt-2 mb-3 px-1">
      {children}
    </div>
  )
}

function ActionCard({ Icon, tone, title, desc, onClick }) {
  const tones = {
    primary: 'bg-primary-50 text-primary',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning',
    danger: 'bg-danger-50 text-danger',
  }
  return (
    <button
      onClick={onClick}
      className="bg-white border border-ink-200 rounded-xl p-4 text-left active:scale-[0.98] transition-all hover:border-primary-200 hover:shadow-md min-h-[118px]"
    >
      <div className={cn('w-10 h-10 rounded-lg grid place-items-center mb-3 border border-current/10', tones[tone])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-[15px] font-extrabold text-ink-900">{title}</div>
      <div className="text-xs text-ink-500 font-semibold mt-1 leading-snug">{desc}</div>
    </button>
  )
}
