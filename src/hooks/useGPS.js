import { useCallback, useEffect, useRef, useState } from 'react'
import { haversine } from '../utils/geo'

/**
 * 편한길 GPS 훅
 * - 현재 위치 추적
 * - 걸음 속도 측정 (m/초)
 * - 체류 감지 (같은 곳에 N초 이상 → 자동 쉼 인식)
 */

const SEOUL_DEFAULT = { lat: 37.5704, lng: 126.9927 } // 종로

export function useGPS(options = {}) {
  const {
    stayThresholdSeconds = 180, // 3분 체류 → 쉬는 중
    stayRadiusMeters = 10,
    enableStayDetection = true,
  } = options

  const [position, setPosition] = useState(SEOUL_DEFAULT)
  const [speed, setSpeed] = useState(0) // m/초
  const [isStaying, setIsStaying] = useState(false)
  const [stayDuration, setStayDuration] = useState(0) // 초
  const [error, setError] = useState(null)
  const [isTracking, setIsTracking] = useState(false)

  const watchIdRef = useRef(null)
  const historyRef = useRef([]) // { lat, lng, ts } 최근 이력
  const stayStartRef = useRef(null)
  const stayTimerRef = useRef(null)

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 기기는 위치 서비스를 지원하지 않아요')
      return
    }

    setIsTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now()
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ts: now,
        }

        // 최근 10개만 유지
        historyRef.current.push(next)
        if (historyRef.current.length > 10) historyRef.current.shift()

        setPosition({ lat: next.lat, lng: next.lng })

        // 속도 계산 (최근 3개 좌표 평균)
        const hist = historyRef.current
        if (hist.length >= 2) {
          const recent = hist.slice(-3)
          let totalDist = 0
          let totalTime = 0
          for (let i = 1; i < recent.length; i++) {
            totalDist += haversine(recent[i - 1], recent[i])
            totalTime += (recent[i].ts - recent[i - 1].ts) / 1000
          }
          const spd = totalTime > 0 ? totalDist / totalTime : 0
          setSpeed(spd)
        }

        // 체류 감지
        if (enableStayDetection && hist.length >= 2) {
          const recent = hist.slice(-3)
          const allClose = recent.every(
            (p) => haversine(p, next) < stayRadiusMeters
          )

          if (allClose) {
            if (!stayStartRef.current) {
              stayStartRef.current = now
            }
            const duration = Math.floor((now - stayStartRef.current) / 1000)
            setStayDuration(duration)
            if (duration >= stayThresholdSeconds && !isStaying) {
              setIsStaying(true)
            }
          } else {
            if (stayStartRef.current) {
              stayStartRef.current = null
              setStayDuration(0)
              setIsStaying(false)
            }
          }
        }
      },
      (err) => {
        setError(err.message || '위치를 가져올 수 없어요')
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    )
  }, [enableStayDetection, stayRadiusMeters, stayThresholdSeconds, isStaying])

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (stayTimerRef.current) {
      clearInterval(stayTimerRef.current)
      stayTimerRef.current = null
    }
    setIsTracking(false)
    stayStartRef.current = null
    setStayDuration(0)
    setIsStaying(false)
    historyRef.current = []
  }, [])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return {
    position,
    speed,
    speedMeterPerMin: Math.round(speed * 60),
    isStaying,
    stayDuration,
    error,
    isTracking,
    start,
    stop,
  }
}
