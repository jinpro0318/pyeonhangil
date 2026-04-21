import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useVoice } from '../hooks/useVoice'
import { useGPS } from '../hooks/useGPS'
import './Search.css'

const FALLBACK_DESTINATIONS = [
  { name: '서울대학교병원', address: '서울 종로구 대학로 101', lat: 37.579617, lng: 126.998292 },
  { name: '종로3가역', address: '서울 종로구 종로', lat: 37.571607, lng: 126.992004 },
  { name: '탑골공원', address: '서울 종로구 종로 99', lat: 37.571191, lng: 126.988401 },
  { name: '광화문역', address: '서울 종로구 세종대로', lat: 37.571607, lng: 126.976620 },
]

async function searchKakaoPlaces(query, center) {
  if (!query) return []
  const params = new URLSearchParams({ query })
  if (center) {
    params.set('x', String(center.lng))
    params.set('y', String(center.lat))
    params.set('radius', '5000')
  } else {
    params.set('x', '126.978')
    params.set('y', '37.566')
    params.set('radius', '20000')
  }
  try {
    const r = await fetch(`/api/local?${params.toString()}`)
    if (!r.ok) return []
    const data = await r.json()
    return (data.pois || []).map((p) => ({
      name: p.name,
      address: p.address || '',
      lat: p.lat,
      lng: p.lng,
    }))
  } catch {
    return []
  }
}

export default function Search() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const mode = params.get('mode') || 'voice'
  const [text, setText] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const { speak } = useVoice()
  const { isListening, transcript, start, isSupported } = useSpeechRecognition()
  const { position } = useGPS({ enableStayDetection: false })
  const debounceRef = useRef(null)

  useEffect(() => {
    if (mode === 'voice' && isSupported) {
      speak('어디로 가세요?')
      setTimeout(() => start(), 1000)
    }
  }, [mode, isSupported, speak, start])

  useEffect(() => {
    if (transcript) {
      setText(transcript)
      setTimeout(() => doSearch(transcript), 300)
    }
    // eslint-disable-next-line
  }, [transcript])

  // 텍스트 모드: 입력 시 디바운스 검색
  useEffect(() => {
    if (mode !== 'text') return
    if (!text.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(text), 350)
    return () => clearTimeout(debounceRef.current)
    // eslint-disable-next-line
  }, [text, mode])

  const doSearch = async (q) => {
    const query = q.trim()
    if (!query) return
    setIsSearching(true)
    setHasSearched(true)
    const found = await searchKakaoPlaces(query, position)
    const list = found.length > 0
      ? found
      : FALLBACK_DESTINATIONS.filter((d) => d.name.includes(query) || query.includes(d.name.slice(0, 2)))
    setResults(list.slice(0, 8))
    setIsSearching(false)

    // 음성 모드: 자동으로 첫 결과로 이동
    if (mode === 'voice' && list[0]) {
      setTimeout(() => goTo(list[0]), 600)
    }
  }

  const goTo = (dest) => {
    navigate('/route', {
      state: {
        destination: { ...dest, emoji: '📍' },
      },
    })
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <button className="search-back" onClick={() => navigate(-1)}>‹</button>
        <h2>{mode === 'voice' ? '말씀해 주세요' : '어디로 가세요?'}</h2>
      </div>

      {mode === 'voice' ? (
        <div className="search-voice">
          <div className="search-wave">
            {[0, 1, 2, 3, 4, 3, 2, 1].map((h, i) => (
              <div
                key={i}
                className="wave-bar"
                style={{ animationDelay: `${i * 0.1}s`, '--peak': `${20 + h * 8}px` }}
              />
            ))}
          </div>

          <div className="search-bubble">
            <div className="search-listening">
              {isListening ? '듣고 있어요' : '듣는 중이에요'}
            </div>
            <div className="search-text">
              {transcript || (isSearching ? '찾는 중…' : '"병원 가고 싶어요"')}
            </div>
          </div>

          <button className="search-mic-btn" onClick={start}>🎙</button>
          <p className="search-retry">다시 말씀하시려면 눌러주세요</p>
        </div>
      ) : (
        <div className="search-text-mode">
          <input
            className="search-input"
            type="text"
            placeholder="어디로 가세요?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch(text)}
            autoFocus
          />
          <div className="search-suggestions">
            <div className="list-label">
              {hasSearched
                ? isSearching
                  ? '찾는 중...'
                  : results.length === 0
                  ? '결과가 없어요'
                  : '검색 결과'
                : '이런 곳은 어떠세요?'}
            </div>
            {(hasSearched ? results : FALLBACK_DESTINATIONS).map((d, i) => (
              <button
                key={`${d.name}-${i}`}
                className="action-card"
                onClick={() => goTo(d)}
              >
                <div className="action-card-icon">📍</div>
                <div className="action-card-text">
                  <div className="t">{d.name}</div>
                  <div className="s">{d.address}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
