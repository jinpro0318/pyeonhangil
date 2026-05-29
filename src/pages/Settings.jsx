import { Check, LogOut, ShieldCheck, Type, Lightbulb } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppState, FONT_SIZES } from '../hooks/useAppState'
import { useAuth } from '../hooks/useAuth'
import PageHeader from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { isAdminEmail } from '../lib/admin'

export default function Settings() {
  const navigate = useNavigate()
  const { state, updateUser } = useAppState()
  const { user, signOut } = useAuth()
  const current = state.user.fontSize

  const choose = (id) => {
    updateUser({ fontSize: id })
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
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <PageHeader title="화면 설정" />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-8">
        <div className="text-[13px] font-bold text-ink-500 mb-2 px-1">글씨 크기</div>

        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 text-center mb-6 shadow-card">
          <div className="text-xs font-bold text-primary-700 mb-2 flex items-center justify-center gap-1.5">
            <Type className="w-3.5 h-3.5" /> 미리 보기
          </div>
          <div className="text-xl font-extrabold text-ink-900 mb-1">편한길에 오신 걸 환영해요</div>
          <div className="text-[15px] text-ink-700">지금 글씨가 잘 보이세요?</div>
        </div>

        <div className="space-y-2.5">
          {Object.values(FONT_SIZES).map((f) => {
            const active = current === f.id
            return (
              <button
                key={f.id}
                onClick={() => choose(f.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl min-h-[76px] border transition-all',
                  active
                    ? 'bg-primary-50 border-primary shadow-card'
                    : 'bg-white border-black/[0.04] shadow-card hover:bg-ink-50'
                )}
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-lg grid place-items-center font-bold flex-shrink-0 border',
                    active ? 'bg-white text-primary border-primary-100' : 'bg-white text-ink-900 border-ink-200'
                  )}
                  style={{ fontSize: `${16 * f.scale}px` }}
                >
                  가
                </div>
                <div className="flex-1 text-left">
                  <div className="text-base font-bold">{f.label}</div>
                  <div className="text-sm text-ink-500 mt-0.5">
                    {f.scale === 1 ? '기본 크기' : `${Math.round(f.scale * 100)}% 크기`}
                  </div>
                </div>
                {active && <Check className="w-6 h-6 text-primary" strokeWidth={2.5} />}
              </button>
            )
          })}
        </div>

        <div className="mt-6 p-3.5 bg-accent-50 border border-accent-100 rounded-xl text-sm text-ink-700 leading-relaxed flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-accent-600 shrink-0" /> 이 설정은 모든 화면에 바로 적용돼요
        </div>

        {user && (
          <div className="mt-8">
            <div className="text-[13px] font-bold text-ink-500 mb-2 px-1">계정</div>
            <div className="bg-white border border-black/[0.04] rounded-xl p-4 shadow-card">
              <div className="text-sm text-ink-500 font-semibold mb-0.5">로그인 계정</div>
              <div className="text-base font-bold text-ink-900 truncate mb-4">{user.email}</div>
              {isAdminEmail(user.email) && (
                <Button className="w-full mb-2" onClick={() => navigate('/admin')}>
                  <ShieldCheck className="w-5 h-5" />
                  관리자 페이지
                </Button>
              )}
              <Button variant="secondary" className="w-full" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
                로그아웃
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
