import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Bell, Mic, Check } from 'lucide-react'
import { Button } from '../components/ui/button'
import { cn } from '@/lib/utils'

export default function Permissions() {
  const navigate = useNavigate()
  const [perms, setPerms] = useState({ location: false, notify: false, voice: false })

  const requestLocation = async () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      () => setPerms((p) => ({ ...p, location: true })),
      () => setPerms((p) => ({ ...p, location: true }))
    )
  }

  const requestNotify = async () => {
    if (!('Notification' in window)) {
      setPerms((p) => ({ ...p, notify: true })); return
    }
    await Notification.requestPermission()
    setPerms((p) => ({ ...p, notify: true }))
  }

  const requestVoice = () => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('편한길입니다')
      u.lang = 'ko-KR'; u.volume = 0.5
      window.speechSynthesis.speak(u)
    }
    setPerms((p) => ({ ...p, voice: true }))
  }

  const allGranted = Object.values(perms).every(Boolean)

  const handleNext = () => {
    localStorage.setItem('pyeonhangil_onboarded', '1')
    navigate('/home', { replace: true })
  }

  const items = [
    { key: 'location', Icon: MapPin, iconBg: 'bg-primary-50 text-primary', title: '내 위치 알기', desc: '어디 계신지 확인해요', action: requestLocation },
    { key: 'notify', Icon: Bell, iconBg: 'bg-warning-50 text-warning', title: '알림 받기', desc: '쉴 곳을 알려드려요', action: requestNotify },
    { key: 'voice', Icon: Mic, iconBg: 'bg-success-50 text-success-600', title: '말로 안내 듣기', desc: '화면 안 봐도 들려드려요', action: requestVoice },
  ]

  return (
    <div className="flex-1 flex flex-col px-6 pt-10 pb-6 pl-6 bg-background">
      <div className="pl-[64px] mb-8">
        <h1 className="text-3xl font-extrabold tracking-normal mb-2">준비가 거의 됐어요</h1>
        <p className="text-base text-ink-500 font-semibold">편한 길 안내를 위해 아래 세 가지가 필요해요</p>
      </div>

      <div className="flex-1 space-y-3">
        {items.map((it) => {
          const granted = perms[it.key]
          return (
            <div
              key={it.key}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl min-h-[80px] transition-all border shadow-sm',
                granted ? 'bg-success-50 border-success/30' : 'bg-white border-ink-200'
              )}
            >
              <div className={cn('w-12 h-12 rounded-lg grid place-items-center flex-shrink-0 border border-current/10', it.iconBg)}>
                <it.Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-bold">{it.title}</div>
                <div className="text-sm text-ink-500 mt-0.5">{it.desc}</div>
              </div>
              {granted ? (
                <div className="flex items-center gap-1 text-success-600 font-bold text-sm">
                  <Check className="w-4 h-4" strokeWidth={3} /> 허용됨
                </div>
              ) : (
                <Button size="sm" onClick={it.action}>허용</Button>
              )}
            </div>
          )
        })}
      </div>

      <Button
        size="xl"
        variant={allGranted ? 'default' : 'secondary'}
        className="w-full mt-6"
        onClick={handleNext}
      >
        {allGranted ? '다음' : '건너뛰고 시작'}
      </Button>
    </div>
  )
}
