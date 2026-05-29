import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LifeBuoy } from 'lucide-react'
import { toast } from 'sonner'
import { useAppState } from '../hooks/useAppState'
import { useGPS } from '../hooks/useGPS'

const HOLD_MS = 1500

export default function SOSButton({ bottom = 90 }) {
  const navigate = useNavigate()
  const { state } = useAppState()
  const { position, hasPosition } = useGPS({ enableStayDetection: false })
  const [holding, setHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef(null)
  const startedAtRef = useRef(0)
  const firedRef = useRef(false)

  const primaryContact =
    state.emergencyContacts[0] ||
    state.family.find((f) => f.status === 'connected' && f.receiveSOS) ||
    null

  const sendAutoSOS = () => {
    if (firedRef.current) return
    firedRef.current = true

    if ('vibrate' in navigator) navigator.vibrate([200, 80, 200, 80, 400])

    const locText = hasPosition
      ? `위도 ${position.lat.toFixed(5)}, 경도 ${position.lng.toFixed(5)}`
      : '위치를 확인 중'
    const mapsLink = hasPosition
      ? `https://map.kakao.com/link/map/내 위치,${position.lat},${position.lng}`
      : ''
    const msg = `[편한길 긴급] ${state.user.name}님이 SOS를 보냈어요. ${locText}. ${mapsLink}`

    if (primaryContact?.phone) {
      const clean = primaryContact.phone.replace(/\D/g, '')
      window.location.href = `sms:${clean}?&body=${encodeURIComponent(msg)}`
      toast.success(`${primaryContact.name}님에게 위치 전송 화면을 열었어요`)
    } else {
      toast.error('등록된 긴급 연락처가 없어요. 119 또는 가족 연락 화면으로 이동합니다.')
      navigate('/sos')
    }
  }

  const beginHold = () => {
    firedRef.current = false
    setHolding(true)
    startedAtRef.current = Date.now()
    if ('vibrate' in navigator) navigator.vibrate(30)

    const tick = () => {
      const elapsed = Date.now() - startedAtRef.current
      const p = Math.min(1, elapsed / HOLD_MS)
      setProgress(p)
      if (p >= 1) {
        sendAutoSOS()
        endHold()
        return
      }
      timerRef.current = requestAnimationFrame(tick)
    }
    timerRef.current = requestAnimationFrame(tick)
  }

  const endHold = (e) => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current)
    const wasHolding = holding
    const elapsed = Date.now() - startedAtRef.current
    setHolding(false)
    setProgress(0)

    if (wasHolding && elapsed < 400 && !firedRef.current) {
      if (e) e.preventDefault()
      navigate('/sos')
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current)
    }
  }, [])

  return (
    <>
      {holding && (
        <div
          className="fixed right-4 z-[151] bg-ink-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg pointer-events-none"
          style={{ bottom: `${bottom + 64}px` }}
          role="status"
          aria-live="assertive"
        >
          꾹 누르면 자동 전송 · {Math.ceil((1 - progress) * 1.5)}초
        </div>
      )}

      <button
        onPointerDown={beginHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="긴급 SOS. 짧게 누르면 선택 화면, 길게 누르면 가족에게 위치 자동 전송"
        className="fixed right-4 z-[150] w-16 h-16 rounded-full bg-danger text-white shadow-danger flex flex-col items-center justify-center gap-0 font-extrabold text-[11px] tracking-tight active:scale-95 transition-transform hover:bg-danger-600 touch-none select-none"
        style={{
          bottom: `${bottom}px`,
          background: holding
            ? `conic-gradient(#FFE0E0 ${progress * 360}deg, #DC2626 0deg)`
            : undefined,
        }}
      >
        <div className="bg-danger w-[52px] h-[52px] rounded-full flex flex-col items-center justify-center">
          <LifeBuoy className="w-5 h-5 mb-0.5" strokeWidth={2.5} />
          <span>SOS</span>
        </div>
      </button>
    </>
  )
}
