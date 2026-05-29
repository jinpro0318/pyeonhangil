import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Keyboard, Mic, Plus, LogIn } from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import { useAuth } from '../hooks/useAuth'
import TabBar from '../components/TabBar'
import SOSButton from '../components/SOSButton'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { IconBadge, favoriteIcon } from '@/lib/catalog'

const LOGIN_PROMPTED_KEY = 'pyeonhangil_login_prompted'

export default function Home() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const { user, loading } = useAuth()

  // 미로그인 사용자에게는 홈 진입 시 로그인 유도 팝업 (세션당 1회)
  const [showLoginAsk, setShowLoginAsk] = useState(false)
  useEffect(() => {
    if (loading) return
    let prompted = false
    try { prompted = sessionStorage.getItem(LOGIN_PROMPTED_KEY) === '1' } catch {}
    if (!user && !prompted) setShowLoginAsk(true)
  }, [loading, user])

  const dismissLogin = () => {
    try { sessionStorage.setItem(LOGIN_PROMPTED_KEY, '1') } catch {}
    setShowLoginAsk(false)
  }
  const goLogin = () => {
    try { sessionStorage.setItem(LOGIN_PROMPTED_KEY, '1') } catch {}
    navigate('/login', { state: { from: '/home' } })
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* 상단 사용자 상태 (로그인 버튼은 AppBrand 헤더로 이동) */}
        <div className="px-[22px] pt-1 pb-3 flex flex-col gap-2 flex-shrink-0 bg-white">
          <div className="text-sm text-ink-700">
            {state.user.name}님의 안전한 이동을 도와드립니다.
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-[22px] pb-24">
          {/* 검색 영역 */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={() => navigate('/search?mode=voice')}
              className="relative bg-primary text-white rounded-2xl p-5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform shadow-primary min-h-[64px]"
            >
              <span className="absolute top-2.5 right-2.5 text-[10px] font-extrabold tracking-wide text-white bg-pink px-2 py-0.5 rounded-full shadow-pink">
                추천
              </span>
              <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/10 grid place-items-center flex-shrink-0">
                <Mic className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold opacity-80">말씀하시면 들어요</div>
                <div className="text-base font-bold truncate">어디로 가세요?</div>
              </div>
            </button>
            <button
              onClick={() => navigate('/search?mode=text')}
              className="bg-white border border-ink-200 rounded-2xl p-5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform shadow-sm min-h-[64px]"
            >
              <div className="w-12 h-12 rounded-lg bg-ink-50 border border-ink-100 grid place-items-center flex-shrink-0">
                <Keyboard className="w-6 h-6 text-ink-700" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink-500">직접 입력할게요</div>
                <div className="text-base font-bold text-ink-900 truncate">글자로 입력하기</div>
              </div>
            </button>
          </div>

          {/* 자주 가시는 곳 */}
          <SectionLabel>자주 가시는 곳</SectionLabel>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {state.favorites.map((f) => {
              const { Icon, tone } = favoriteIcon(f)
              return (
                <Card
                  key={f.id}
                  onClick={() => navigate('/route', { state: { destination: f } })}
                  className="p-4 cursor-pointer active:scale-[0.98] transition-all hover:border-primary-200 hover:shadow-md"
                >
                  <IconBadge Icon={Icon} tone={tone} size="md" className="mb-2.5" />
                  <div className="text-base font-bold leading-tight truncate">{f.name}</div>
                  <div className="text-xs text-ink-500 truncate mt-0.5">{f.address}</div>
                </Card>
              )
            })}
            <button
              onClick={() => navigate('/favorites')}
              aria-label="자주 가는 곳 편집"
              className="border-2 border-dashed border-ink-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-ink-400 active:scale-[0.98] transition-transform hover:border-primary hover:text-primary min-h-[100px]"
            >
              <Plus className="w-6 h-6" />
              <div className="text-sm font-bold">편집</div>
            </button>
          </div>
        </div>

        <SOSButton bottom={90} />
      </div>
      <TabBar />

      {showLoginAsk && (
        <div className="absolute inset-0 z-[200] bg-ink-900/45 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-[320px] bg-white rounded-[20px] shadow-xl p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary grid place-items-center mx-auto mb-4">
              <LogIn className="w-8 h-8" strokeWidth={2.2} />
            </div>
            <h2 className="text-lg font-extrabold text-ink-900 mb-2">로그인 하시겠습니까?</h2>
            <p className="text-sm text-ink-500 leading-relaxed mb-5">
              로그인하면 즐겨찾기와 가족 안심 알림을 안전하게 이어서 쓸 수 있어요.
            </p>
            <div className="flex flex-col gap-2">
              <Button className="w-full" onClick={goLogin}>로그인 / 회원가입</Button>
              <Button variant="secondary" className="w-full" onClick={dismissLogin}>나중에 할게요</Button>
            </div>
          </div>
        </div>
      )}
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

