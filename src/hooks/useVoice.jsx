import { useCallback, useEffect, useRef, useState } from 'react'

const spokenOnce = new Set()
const recentSpeech = new Map()

function getPreferredKoreanVoice() {
  if (!('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices?.() || []
  const koreanVoices = voices.filter((v) => /^ko(-|_)?KR/i.test(v.lang) || /한국|Korean|Yuna|Narae|Sora/i.test(v.name))
  if (koreanVoices.length === 0) return null

  const preferredNames = [
    'Yuna', 'Narae', 'Sora', 'Google 한국', 'Google Korean', 'Siri',
  ]
  return koreanVoices.find((voice) =>
    preferredNames.some((name) => voice.name.toLowerCase().includes(name.toLowerCase()))
  ) || koreanVoices[0]
}

function shouldSkipSpeech(text, options) {
  if (options.immediate && !options.onceKey) return false

  const onceKey = options.onceKey
  if (onceKey) {
    if (spokenOnce.has(onceKey)) return true
    spokenOnce.add(onceKey)
  }

  const now = Date.now()
  const dedupeKey = options.dedupeKey || text
  const dedupeMs = options.dedupeMs ?? 12000
  const lastAt = recentSpeech.get(dedupeKey) || 0
  if (now - lastAt < dedupeMs) return true
  recentSpeech.set(dedupeKey, now)
  return false
}

/**
 * 편한길 음성 안내 훅
 * - Web Speech API 사용 (한국어)
 * - 같은 자동 안내가 반복 재생되지 않도록 중복 방지
 * - 기기에서 제공하는 한국어 음성 중 부드러운 음성을 우선 사용
 */
export function useVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const queueRef = useRef([])
  const currentRef = useRef(null)
  const voiceRef = useRef(null)

  useEffect(() => {
    setIsSupported('speechSynthesis' in window)
    if (!('speechSynthesis' in window)) return

    const loadVoice = () => {
      voiceRef.current = getPreferredKoreanVoice()
    }
    loadVoice()
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoice)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoice)
  }, [])

  const speak = useCallback((text, options = {}) => {
    if (!('speechSynthesis' in window)) return
    if (!text) return
    if (shouldSkipSpeech(text, options)) return

    const u = new SpeechSynthesisUtterance(text)
    u.lang = options.lang || 'ko-KR'
    u.voice = options.voice || voiceRef.current || getPreferredKoreanVoice()
    u.rate = options.rate ?? 0.86
    u.pitch = options.pitch ?? 0.98
    u.volume = options.volume ?? 0.92

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
      const queued = queueRef.current.some((item) =>
        (item.options.dedupeKey || item.text) === (options.dedupeKey || text)
      )
      if (queued) return
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

  useEffect(() => {
    return () => stop()
  }, [stop])

  return { speak, stop, isSpeaking, isSupported }
}

/**
 * 페이지 진입 시 자동 음성 안내
 * - options.force 가 true 일 때만 발음 (기본은 무음)
 */
export function useAutoAnnounce(text, options = {}) {
  const { speak } = useVoice()

  useEffect(() => {
    if (!text) return
    if (!options.force) return
    const t = setTimeout(() => {
      speak(text, {
        onceKey: `auto-announce:${text.slice(0, 30)}`,
        rate: 0.9,
      })
    }, 100)
    return () => clearTimeout(t)
    // eslint-disable-next-line
  }, [text])
}

/**
 * ARIA Live Region — 화면 리더기가 즉시 읽도록 강제
 */
export function AnnounceLive({ text, level = 'polite' }) {
  return (
    <div
      role="status"
      aria-live={level}
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: 1, height: 1,
        padding: 0, margin: -1,
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {text}
    </div>
  )
}
