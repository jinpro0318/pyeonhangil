import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Armchair, MapPin, Play, Mic } from 'lucide-react'
import { useVoice } from '../hooks/useVoice'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { useGPS } from '../hooks/useGPS'
import { haversine } from '../utils/geo'
import { Button } from '../components/ui/button'

const WALK_SPEED_M_PER_MIN = {
  older: 42,
  wheelchair: 30,
  visual: 36,
  stroller: 42,
  injured: 34,
}

function estimateMinutesLeft(route, position, walkId) {
  if (!route || !route.coords || route.coords.length < 2 || !position) return null
  let nearestIdx = 0
  let nearestDist = Infinity
  for (let i = 0; i < route.coords.length; i++) {
    const d = haversine(position, route.coords[i])
    if (d < nearestDist) { nearestDist = d; nearestIdx = i }
  }
  let remain = 0
  for (let i = nearestIdx; i < route.coords.length - 1; i++) {
    remain += haversine(route.coords[i], route.coords[i + 1])
  }
  const speed = WALK_SPEED_M_PER_MIN[walkId] || WALK_SPEED_M_PER_MIN.older
  return Math.max(1, Math.round(remain / speed))
}

export default function Resting() {
  const navigate = useNavigate()
  const { speak } = useVoice()
  const { state } = useAppState()
  const { position, start } = useGPS({ enableStayDetection: false })
  const [restTime, setRestTime] = useState(3)

  useEffect(() => {
    start()
    speak('쉬고 계시네요. 충분히 쉬시고 천천히 일어나서 걸어가세요', {
      onceKey: 'resting-enter',
    })
    const interval = setInterval(() => setRestTime((t) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [speak, start])

  const minutesLeft = useMemo(
    () => estimateMinutesLeft(state.activeRoute, position, state.user.walkState),
    [state.activeRoute, position, state.user.walkState]
  )

  const walk = WALK_STATES[state.user.walkState] || WALK_STATES.older

  const handleResume = () => {
    speak('다시 안내를 시작할게요', { immediate: true })
    navigate('/navigation')
  }

  return (
    <div className="flex-1 bg-success-50 flex flex-col px-5 pt-12 pb-6">
      <div className="flex justify-center mb-4">
        <div className="gps-indicator">
          <div className="gps-dot" />
          <MapPin className="w-3 h-3" /> 같은 곳 · {restTime}분 정지
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-28 h-28 bg-white rounded-full grid place-items-center mb-5 shadow-md">
          <Armchair className="w-14 h-14 text-success-600" strokeWidth={2} />
        </div>

        <div className="text-xs font-bold text-success-600 bg-white px-3 py-1.5 rounded-full mb-3">
          📍 GPS로 인식했어요
        </div>
        <h1 className="text-3xl font-extrabold tracking-tighter text-ink-900 mb-3">
          쉬고 계시네요
        </h1>
        <p className="text-base text-ink-700 font-semibold leading-relaxed">
          충분히 쉬시고<br />천천히 일어나서 걸어가세요
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 flex items-center gap-3 mb-3 shadow-sm">
        <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary grid place-items-center flex-shrink-0">
          <Play className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-bold text-ink-900">다시 걸으시면 자동 재개</div>
          <div className="text-xs text-ink-500 mt-0.5 leading-snug">
            아무것도 누르지 마세요. GPS가 이동을 감지하면 바로 안내해요
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-ink-500 font-semibold mb-4 flex items-center justify-center gap-1.5">
        <Mic className="w-4 h-4 text-primary" />
        "이제 가자"라고 말씀하시면 바로 안내 재개돼요
      </div>

      <div className="bg-white rounded-2xl p-5 flex text-center mb-5 shadow-sm">
        <div className="flex-1">
          <div className="text-2xl font-extrabold tracking-tighter text-success-600">{restTime}분</div>
          <div className="text-xs text-ink-500 mt-0.5">쉬신 시간</div>
        </div>
        <div className="w-px bg-ink-100" />
        <div className="flex-1">
          <div className="text-2xl font-extrabold tracking-tighter text-primary">
            {minutesLeft != null ? `${minutesLeft}분` : '—'}
          </div>
          <div className="text-xs text-ink-500 mt-0.5">
            {minutesLeft != null ? `더 가시면 도착 · ${walk.name}` : '경로 없음'}
          </div>
        </div>
      </div>

      <Button size="xl" className="w-full" onClick={handleResume}>
        지금 다시 출발
      </Button>
    </div>
  )
}
