import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, ChevronRight, HeartHandshake, LogOut, MapPin, Pencil, Phone,
  RotateCcw, Settings, ShieldCheck, Star, UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { useAuth } from '../hooks/useAuth'
import { getMonthlyStats } from '../services/tripStore'
import TabBar from '../components/TabBar'
import { cn } from '@/lib/utils'
import { isAdminEmail } from '../lib/admin'

const WALK_CHIP = {
  older: 'bg-success-50 text-success-600 border-success/20',
  wheelchair: 'bg-primary-50 text-primary border-primary/20',
  visual: 'bg-warning-50 text-warning border-warning/20',
  stroller: 'bg-walk-stroller-soft text-walk-stroller border-walk-stroller/20',
  injured: 'bg-danger-50 text-danger border-danger/20',
}

export default function MyInfo() {
  const navigate = useNavigate()
  const { state, updateUser } = useAppState()
  const { user, signOut } = useAuth()
  const walk = WALK_STATES[state.user.walkState] || WALK_STATES.older
  const stats = useMemo(() => getMonthlyStats(), [])

  const connectedFamily = state.family.filter((f) => f.status === 'connected')
  const pendingFamily = state.family.filter((f) => f.status !== 'connected')
  const sosCount = state.emergencyContacts.length + state.family.filter((f) => f.receiveSOS).length

  const changeName = () => {
    const name = prompt('이름을 입력하세요', state.user.name)
    if (name && name.trim()) updateUser({ name: name.trim() })
  }

  const resetApp = () => {
    if (confirm('앱에 저장된 이동 기록과 설정을 모두 초기화할까요?')) {
      localStorage.clear()
      window.location.href = '/'
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('로그아웃했어요')
      navigate('/login', { replace: true })
    } catch {
      toast.error('로그아웃에 실패했어요')
    }
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-5 pb-6">
          <section className="bg-white border border-ink-200 rounded-xl p-5 shadow-sm mb-4">
            <div className="flex items-start gap-4">
              <button
                onClick={changeName}
                className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 text-primary grid place-items-center text-2xl font-extrabold flex-shrink-0"
                aria-label="이름 수정"
              >
                {state.user.name[0]}
              </button>
              <div className="flex-1 min-w-0">
                <button
                  onClick={changeName}
                  className="flex items-center gap-1.5 text-xl font-extrabold text-ink-900 max-w-full"
                >
                  <span className="truncate">{state.user.name} 님</span>
                  <Pencil className="w-4 h-4 text-ink-400 flex-shrink-0" />
                </button>
                <div className="text-sm text-ink-500 font-semibold truncate mt-1">
                  {user?.email || '로그인 계정 없음'}
                </div>
                <button
                  onClick={() => navigate('/walk-state')}
                  className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold mt-3', WALK_CHIP[walk.id])}
                >
                  {walk.emoji} {walk.name}
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2 mb-4">
            <MetricCard value={`${stats.count}회`} label="이번 달 외출" />
            <MetricCard value={`${stats.totalKm}km`} label="이번 달 이동" />
          </section>

          <section className="bg-white border border-ink-200 rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-extrabold text-ink-900">안심 상태</div>
              <span className={cn(
                'text-xs font-bold rounded-full px-2.5 py-1',
                sosCount > 0 ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning'
              )}>
                {sosCount > 0 ? '준비됨' : '설정 필요'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatusTile Icon={HeartHandshake} value={`${connectedFamily.length}명`} label="가족" />
              <StatusTile Icon={Bell} value={`${pendingFamily.length}건`} label="초대 대기" />
              <StatusTile Icon={Phone} value={`${sosCount}명`} label="SOS" />
            </div>
          </section>

          <SectionLabel>내 이동 설정</SectionLabel>
          <div className="space-y-2.5 mb-5">
            <ActionRow
              Icon={MapPin}
              tone="primary"
              title="자주 가는 곳"
              desc={`${state.favorites.length}곳 등록됨`}
              onClick={() => navigate('/favorites')}
            />
            <ActionRow
              Icon={HeartHandshake}
              tone="success"
              title="보호자 가족"
              desc={`${connectedFamily.length}명 연결 · ${pendingFamily.length}건 대기`}
              onClick={() => navigate('/family')}
            />
            <ActionRow
              Icon={Phone}
              tone="danger"
              title="긴급 연락처"
              desc={state.emergencyContacts.length === 0 ? '등록된 연락처 없음' : `${state.emergencyContacts.length}명 등록됨`}
              onClick={() => navigate('/emergency')}
            />
            <ActionRow
              Icon={Settings}
              tone="neutral"
              title="화면·계정 설정"
              desc="글씨 크기, 관리자 메뉴, 로그아웃"
              onClick={() => navigate('/settings')}
            />
          </div>

          {user && isAdminEmail(user.email) && (
            <>
              <SectionLabel>관리자</SectionLabel>
              <ActionRow
                Icon={ShieldCheck}
                tone="neutral"
                title="관리자 페이지"
                desc="제보와 운영 현황 확인"
                onClick={() => navigate('/admin')}
              />
            </>
          )}

          <SectionLabel>계정</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSignOut}
              className="bg-white border border-ink-200 rounded-xl p-4 text-left shadow-sm active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5 text-ink-500 mb-2" />
              <div className="text-sm font-extrabold text-ink-900">로그아웃</div>
            </button>
            <button
              onClick={resetApp}
              className="bg-white border border-ink-200 rounded-xl p-4 text-left shadow-sm active:scale-[0.98]"
            >
              <RotateCcw className="w-5 h-5 text-ink-500 mb-2" />
              <div className="text-sm font-extrabold text-ink-900">초기화</div>
            </button>
          </div>

          <div className="text-center text-xs text-ink-400 font-semibold mt-6">편한길 v1.0.0</div>
        </div>
      </div>
      <TabBar />
    </>
  )
}

function MetricCard({ value, label }) {
  return (
    <div className="bg-white border border-ink-200 rounded-xl p-4 shadow-sm">
      <div className="text-2xl font-extrabold text-primary leading-none">{value}</div>
      <div className="text-xs font-bold text-ink-500 mt-2">{label}</div>
    </div>
  )
}

function StatusTile({ Icon, value, label }) {
  return (
    <div className="bg-ink-50 border border-ink-200/80 rounded-lg p-3">
      <Icon className="w-4 h-4 text-primary mb-2" />
      <div className="text-base font-extrabold text-ink-900 leading-none">{value}</div>
      <div className="text-[11px] font-bold text-ink-500 mt-1.5">{label}</div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="text-[13px] font-bold text-ink-500 mt-5 mb-2.5 px-1">
      {children}
    </div>
  )
}

function ActionRow({ Icon, tone, title, desc, onClick }) {
  const tones = {
    primary: 'bg-primary-50 text-primary border-primary-100',
    success: 'bg-success-50 text-success-600 border-success-50',
    danger: 'bg-danger-50 text-danger border-danger/20',
    neutral: 'bg-ink-50 text-ink-700 border-ink-200',
  }
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 p-4 bg-white border border-ink-200 hover:bg-ink-50 rounded-xl min-h-[76px] text-left transition-colors active:scale-[0.99] shadow-sm"
    >
      <div className={cn('w-11 h-11 rounded-lg grid place-items-center flex-shrink-0 border', tones[tone])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[16px] font-extrabold text-ink-900">{title}</div>
        <div className="text-sm text-ink-500 mt-0.5 truncate">{desc}</div>
      </div>
      <ChevronRight className="w-5 h-5 text-ink-400 flex-shrink-0" />
    </button>
  )
}
