/**
 * 편한길 진동 패턴 사전
 * - 짧은 진동 1회: 좌회전
 * - 짧은 진동 2회: 우회전
 * - 긴 진동 1회: 정지/대기
 * - 짧고 빠른 4회: 위험/주의
 * - 길고 강한 3회: 도착/완료
 * - 길게+짧게+길게: SOS
 */
export const HAPTIC_PATTERNS = {
  turnLeft: [120],
  turnRight: [120, 80, 120],
  stop: [400],
  warning: [60, 40, 60, 40, 60, 40, 60],
  arrived: [300, 100, 300, 100, 300],
  sos: [400, 100, 100, 100, 400],
  tap: [30],
  doubleTap: [30, 50, 30],
}

export function useHaptics() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

  const vibrate = (pattern) => {
    if (!isSupported) return false
    let p = pattern
    if (typeof pattern === 'string') p = HAPTIC_PATTERNS[pattern]
    if (!p) return false
    try {
      return navigator.vibrate(p)
    } catch {
      return false
    }
  }

  const stop = () => {
    if (isSupported) navigator.vibrate(0)
  }

  return { vibrate, stop, isSupported }
}
