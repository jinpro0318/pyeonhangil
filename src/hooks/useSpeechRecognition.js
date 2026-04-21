import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 편한길 음성 인식 훅
 * - Web Speech API (Chrome/Edge 지원)
 * - "다시 말해줘", "힘들어" 같은 명령 처리
 */
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SR)

    if (SR) {
      const rec = new SR()
      rec.lang = 'ko-KR'
      rec.continuous = false
      rec.interimResults = false

      rec.onstart = () => setIsListening(true)
      rec.onend = () => setIsListening(false)
      rec.onerror = (e) => {
        setError(e.error || 'unknown')
        setIsListening(false)
      }
      rec.onresult = (e) => {
        const text = e.results[0][0].transcript
        setTranscript(text)
      }

      recognitionRef.current = rec
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {}
      }
    }
  }, [])

  const start = useCallback(() => {
    setError(null)
    setTranscript('')
    try {
      recognitionRef.current?.start()
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop()
    } catch {}
  }, [])

  return {
    isListening,
    transcript,
    isSupported,
    error,
    start,
    stop,
  }
}
