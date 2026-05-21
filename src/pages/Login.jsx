import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '../hooks/useAuth'
import { useAppState } from '../hooks/useAppState'
import { toast } from 'sonner'
import { isAdminEmail } from '../lib/admin'

const ERROR_MESSAGES = {
  'auth/invalid-email': '올바른 이메일 주소를 입력해 주세요',
  'auth/user-not-found': '가입되지 않은 계정이에요',
  'auth/wrong-password': '비밀번호가 일치하지 않아요',
  'auth/invalid-credential': '이메일 또는 비밀번호를 확인해 주세요',
  'auth/email-already-in-use': '이미 가입된 이메일이에요',
  'auth/weak-password': '비밀번호는 6자 이상이어야 해요',
  'auth/network-request-failed': '네트워크 연결을 확인해 주세요',
  'auth/too-many-requests': '잠시 후 다시 시도해 주세요',
  'app/firebase-not-configured': '배포 환경에 Firebase 환경변수를 설정해 주세요',
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp, isFirebaseConfigured } = useAuth()
  const { updateUser } = useAppState()

  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isSignUp = mode === 'signup'
  const from = location.state?.from || '/home'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    if (!email.trim() || !password) {
      toast.error('이메일과 비밀번호를 입력해 주세요')
      return
    }
    if (isSignUp && !name.trim()) {
      toast.error('이름을 입력해 주세요')
      return
    }
    setSubmitting(true)
    try {
      if (isSignUp) {
        const cred = await signUp(email.trim(), password, name.trim())
        updateUser({ name: cred.user.displayName || name.trim() })
        toast.success('가입을 환영합니다')
      } else {
        const cred = await signIn(email.trim(), password)
        if (cred.user.displayName) updateUser({ name: cred.user.displayName })
        toast.success('다시 만나서 반가워요')
        if (isAdminEmail(cred.user.email)) {
          navigate('/admin', { replace: true })
          return
        }
      }
      localStorage.setItem('pyeonhangil_onboarded', '1')
      navigate(from || '/home', { replace: true })
    } catch (err) {
      const msg = ERROR_MESSAGES[err.code] || '로그인에 실패했어요. 다시 시도해 주세요'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto px-7 pt-12 pb-8 flex flex-col">
        <div className="grid place-items-center mb-6">
          <img
            src="/pyeonhangil_icon_cropped_20260521.png"
            alt="편한길"
            width="120" height="120"
            className="object-contain drop-shadow-xl"
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">
            편한길에 오신 것을{'\n'}환영합니다.
          </h1>
          <p className="text-base text-ink-500 font-semibold whitespace-pre-line">
            {isSignUp
              ? '이메일로 간단하게 시작하세요'
              : '이메일과 비밀번호로 로그인해 주세요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {!isFirebaseConfigured && (
            <div className="rounded-xl border border-warning/30 bg-warning-50 px-4 py-3 text-sm font-semibold leading-relaxed text-warning">
              Firebase 환경변수가 없어 로그인 기능을 불러오지 못했어요. Vercel 프로젝트 설정에 Firebase 값을 추가해 주세요.
            </div>
          )}
          {isSignUp && (
            <Field icon={<UserIcon className="w-5 h-5" />}>
              <Input
                type="text"
                autoComplete="name"
                placeholder="이름 (예: 홍길동)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-12"
              />
            </Field>
          )}
          <Field icon={<Mail className="w-5 h-5" />}>
            <Input
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12"
            />
          </Field>
          <Field icon={<Lock className="w-5 h-5" />}>
            <Input
              type={showPw ? 'text' : 'password'}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              placeholder={isSignUp ? '비밀번호 (6자 이상)' : '비밀번호'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-ink-400 hover:text-ink-700"
            >
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </Field>

          <Button
            type="submit"
            size="xl"
            disabled={submitting}
            className="mt-3"
          >
            {submitting ? '잠시만요...' : isSignUp ? '가입하고 시작하기' : '로그인'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
            className="text-sm font-bold text-primary hover:underline"
          >
            {isSignUp ? '이미 계정이 있어요. 로그인할게요' : '처음이세요? 가입하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ icon, children }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
        {icon}
      </div>
      {children}
    </div>
  )
}
