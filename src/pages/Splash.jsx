import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HeartHandshake } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAppState } from '../hooks/useAppState'
import { IconBadge } from '@/lib/catalog'

export default function Splash() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { acceptInvite } = useAppState()
  const inviteToken = params.get('invite')
  const [invite, setInvite] = useState(null) // { status: 'accepted' | 'unknown', name }

  useEffect(() => {
    const isDemo = params.get('demo') === '1' || params.get('reset') === '1'

    if (isDemo) {
      try {
        localStorage.removeItem('pyeonhangil_state')
        localStorage.removeItem('pyeonhangil_onboarded')
      } catch {}
    }

    if (inviteToken) {
      const member = acceptInvite(inviteToken)
      setInvite(member ? { status: 'accepted', name: member.name } : { status: 'unknown' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  // 가족 초대 수락 화면
  if (inviteToken) {
    const accepted = invite?.status === 'accepted'
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white text-ink-900 animate-fade-in px-8 text-center">
        <IconBadge Icon={HeartHandshake} tone="primary" size="2xl" className="mb-5" />
        <h1 className="text-2xl font-extrabold tracking-normal mb-2">가족 안심 초대</h1>
        <p className="text-sm text-ink-600 leading-relaxed mb-8 break-keep whitespace-pre-line">
          {invite == null
            ? '초대를 확인하고 있어요…'
            : accepted
              ? `${invite.name}님과 가족으로 연결되었어요.\n외출·도착·SOS 알림을 함께 받아요.`
              : '초대 링크를 확인했어요.\n로그인하면 초대한 가족과 연결됩니다.'}
        </p>
        <Button
          size="xl"
          className="w-full max-w-xs"
          onClick={() => navigate(accepted ? '/home' : '/login', { replace: true })}
        >
          {accepted ? '편한길 시작하기' : '로그인하고 연결하기'}
        </Button>
      </div>
    )
  }

  const isDemo = params.get('demo') === '1' || params.get('reset') === '1'
  const handleNext = () => navigate('/intro', { replace: true })

  return (
    <div className="flex-1 relative flex flex-col items-center justify-center bg-gradient-to-b from-white via-white to-primary-50 text-ink-900 animate-fade-in overflow-hidden px-8">
      {isDemo && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-warning text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md"
          role="status"
        >
          데모 모드 · 초기 상태로 시작
        </div>
      )}

      <div className="relative z-10 w-full">
        <div className="mx-auto mb-7 grid place-items-center">
          <img
            src="/pyeonhangil_icon_clean.png"
            alt="편한길 로고"
            width="180" height="180"
            className="object-contain"
          />
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-normal mb-4">편한길</h1>
          <p className="text-sm text-ink-500 leading-relaxed">
            당신의 걸음이 더 안전하고 편안하도록
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 right-8">
        <Button size="xl" className="w-full" onClick={handleNext}>
          다음으로 넘기기
        </Button>
      </div>
    </div>
  )
}
