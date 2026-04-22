import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useVoice } from '../hooks/useVoice'
import { useGPS } from '../hooks/useGPS'
import './Search.css'

const FALLBACK_DESTINATIONS = [
  { name: '서울대학교병원', address: '서울 종로구 대학로 101', lat: 37.579617, lng: 126.998292, keywords: ['병원', '의원', '아파', '진료'] },
  { name: '종로3가역', address: '서울 종로구 종로', lat: 37.571607, lng: 126.992004, keywords: ['지하철', '역', '전철'] },
  { name: '탑골공원', address: '서울 종로구 종로 99', lat: 37.571191, lng: 126.988401, keywords: ['공원', '산책', '쉬'] },
  { name: '광화문역', address: '서울 종로구 세종대로', lat: 37.571607, lng: 126.976620, keywords: ['광화문', '시청', '지하철'] },
]

// 음성 입력에서 불필요한 조사·어미 제거 → 핵심 키워드만 추출
// "병원 가고 싶어요" → "병원"
function extractKeyword(raw) {
  if (!raw) return ''
  return raw
    .replace(/(에|으로|로|까지|에서)?\s*(가고\s*싶어요|가고\s*싶다|가줘|가자|가요|가|데려다\s*줘|찾아줘|알려줘|보여줘)\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function fuzzyFallback(query) {
  if (!query) return []
  const q = query.toLowerCase()
  return FALLBACK_DESTINATIONS.filter((d) => {
    if (d.name.includes(query) || query.includes(d.name.slice(0, 2))) return true
    return (d.keywords || []).some((k) => q.includes(k))
  })
}

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
    const raw = q.trim()
    if (!raw) return
    const query = extractKeyword(raw) || raw
    setIsSearching(true)
    setHasSearched(true)

    // 1) 카카오 로컬 API 시도 (실패하거나 0건이면 키워드만으로 재시도)
    let found = await searchKakaoPlaces(query, position)
    if (found.length === 0 && query !== raw) {
      found = await searchKakaoPlaces(raw, position)
    }

    // 2) fuzzy 폴백 → 여전히 없으면 최소 1건(서울대병원)은 보장
    const fallback = fuzzyFallback(query).concat(fuzzyFallback(raw))
    const list = found.length > 0
      ? found
      : (fallback.length > 0 ? fallback : [FALLBACK_DESTINATIONS[0]])

    setResults(list.slice(0, 8))
    setIsSearching(false)

    // 음성 모드도 API가 실패할 수 있으므로 결과가 보장되어야 다음 페이지로 넘어감
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
