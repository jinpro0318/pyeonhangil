import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, MapPin, Bell, AlertTriangle } from 'lucide-react'
import { useVoice } from '../hooks/useVoice'
import { useHaptics } from '../hooks/useHaptics'
import { useAppState } from '../hooks/useAppState'
import { endTrip, getActiveTrip } from '../services/tripStore'
import { formatDistance } from '../utils/geo'
import { Button } from '../components/ui/button'

export default function Arrived() {
  const navigate = useNavigate()
  const { speak } = useVoice()
  const { vibrate } = useHaptics()
  const { state } = useAppState()
  const destination = state.destination?.name || '목적지'

  const finished = useMemo(() => {
    const active = getActiveTrip()
    if (!active) return null
    const distance = state.activeRoute?.distanceMeters || active.distance || 0
    return endTrip(distance)
    // eslint-disable-next-line
  }, [])

  const durationMin = finished?.startTs && finished?.endTs
    ? Math.max(1, Math.round((finished.endTs - finished.startTs) / 60000))
    : null

  const distance = finished?.distance || state.activeRoute?.distanceMeters || 0
  const primaryFamily = state.family.find((f) => f.status === 'connected' && f.receiveSOS)

  useEffect(() => {
    vibrate('arrived')
  }, [vibrate])

  useEffect(() => {
    if (primaryFamily) {
      speak(`도착했어요. 수고 많으셨어요. ${primaryFamily.name}님에게도 자동으로 알려드렸어요`, {
        onceKey: `arrived:${destination}:${primaryFamily.id || primaryFamily.name}`,
      })
    } else {
      speak('도착했어요. 수고 많으셨어요', {
        onceKey: `arrived:${destination}`,
      })
    }
  }, [speak, primaryFamily, destination])

  return (
    <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-6 bg-gradient-to-b from-primary-50 to-white">
      <div className="gps-indicator mb-6">
        <div className="gps-dot" />
        <MapPin className="w-3 h-3" /> GPS로 도착 자동 감지
      </div>

      {/* 큰 체크 애니메이션 */}
      <div className="w-28 h-28 rounded-full bg-primary grid place-items-center mb-5 shadow-primary animate-check-pop">
        <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2} />
      </div>

      <div className="text-2xl font-extrabold tracking-tighter text-ink-900 mb-2">도착했어요!</div>
      <div className="text-sm text-ink-500 mb-7">{destination}</div>

      <div className="w-full bg-white rounded-3xl p-5 shadow-card border border-black/[0.04] mb-4">
        <div className="text-xs font-bold text-ink-500 text-center mb-3">수고 많으셨어요</div>
        <div className="flex">
          <div className="flex-1 text-center">
            <div className="text-3xl font-extrabold tracking-tighter text-primary">
              {durationMin != null ? `${durationMin}분` : '—'}
            </div>
            <div className="text-xs text-ink-500 mt-0.5">소요</div>
          </div>
          <div className="w-px bg-ink-100" />
          <div className="flex-1 text-center">
            <div className="text-3xl font-extrabold tracking-tighter text-success-600">
              {distance ? formatDistance(distance) : '—'}
            </div>
            <div className="text-xs text-ink-500 mt-0.5">이동했어요</div>
          </div>
        </div>
      </div>

      {primaryFamily ? (
        <div className="w-full bg-success-50 border border-success/30 rounded-2xl p-4 flex items-center gap-3 mb-5 shadow-sm">
          <div className="w-11 h-11 rounded-full bg-success text-white grid place-items-center flex-shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-ink-900">
              {primaryFamily.name}님에게 자동으로 알렸어요
            </div>
            <div className="text-sm text-ink-500 mt-0.5">"무사히 도착하셨어요"</div>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white border border-black/[0.04] rounded-2xl p-4 flex items-center gap-3 mb-5 shadow-card">
          <div className="w-11 h-11 rounded-full bg-ink-400 text-white grid place-items-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-ink-900">가족 알림이 꺼져 있어요</div>
            <div className="text-sm text-ink-500 mt-0.5">가족 탭에서 SOS 알림을 켜주세요</div>
          </div>
        </div>
      )}

      <div className="w-full grid grid-cols-2 gap-3 mt-auto">
        <Button variant="secondary" onClick={() => navigate('/home')}>
          홈으로
        </Button>
        <Button size="lg" onClick={() => navigate('/search?mode=voice')}>
          돌아가는 길도 편하게
        </Button>
      </div>
    </div>
  )
}
