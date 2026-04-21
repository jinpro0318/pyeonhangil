import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 편한길 음성 안내 훅
 * - Web Speech API 사용 (한국어)
 * - 안내 말씀을 큐에 넣고 순차 재생
 */
export function useVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const queueRef = useRef([])
  const currentRef = useRef(null)

  useEffect(() => {
    setIsSupported('speechSynthesis' in window)
  }, [])

  const speak = useCallback((text, options = {}) => {
    if (!('speechSynthesis' in window)) return
    if (!text) return

    const u = new SpeechSynthesisUtterance(text)
    u.lang = options.lang || 'ko-KR'
    u.rate = options.rate ?? 0.95 // 조금 천천히
    u.pitch = options.pitch ?? 1
    u.volume = options.volume ?? 1

    u.onstart = () => setIsSpeaking(true)
    u.onend = () => {
      setIsSpeaking(false)
      currentRef.current = null
      const next = queueRef.current.shift()
      if (next) speak(next.text, next.options)
    }
    u.onerror = () => {
      setIsSpeaking(false)
      currentRef.current = null
    }

    if (window.speechSynthesis.speaking && !options.immediate) {
      queueRef.current.push({ text, options })
      return
    }

    if (options.immediate) {
      window.speechSynthesis.cancel()
      queueRef.current = []
    }

    currentRef.current = u
    window.speechSynthesis.speak(u)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    queueRef.current = []
    setIsSpeaking(false)
  }, [])

  // 페이지 이동 시 자동 정리
  useEffect(() => {
    return () => stop()
  }, [stop])

  return { speak, stop, isSpeaking, isSupported }
}
