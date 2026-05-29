import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mic, MapPin, ChevronLeft } from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useVoice } from '../hooks/useVoice'
import { useGPS } from '../hooks/useGPS'
import { Input } from '../components/ui/input'

const FALLBACK_DESTINATIONS = [
  { name: '서울대학교병원', address: '서울 종로구 대학로 101', lat: 37.579617, lng: 126.998292, keywords: ['병원', '의원', '아파', '진료'] },
  { name: '종로3가역', address: '서울 종로구 종로', lat: 37.571607, lng: 126.992004, keywords: ['지하철', '역', '전철'] },
  { name: '탑골공원', address: '서울 종로구 종로 99', lat: 37.571191, lng: 126.988401, keywords: ['공원', '산책', '쉬'] },
  { name: '광화문역', address: '서울 종로구 세종대로', lat: 37.571607, lng: 126.976620, keywords: ['광화문', '시청', '지하철'] },
]

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
  const { position, start: startGPS } = useGPS({ enableStayDetection: false })
  const debounceRef = useRef(null)

  useEffect(() => { startGPS() }, [startGPS])

  useEffect(() => {
    if (mode === 'voice' && isSupported) {
      speak('어디로 가세요?', { onceKey: 'search-voice-prompt' })
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

    let found = await searchKakaoPlaces(query, position)
    if (found.length === 0 && query !== raw) {
      found = await searchKakaoPlaces(raw, position)
    }

    const fallback = fuzzyFallback(query).concat(fuzzyFallback(raw))
    const list = found.length > 0 ? found : (fallback.length > 0 ? fallback : [FALLBACK_DESTINATIONS[0]])

    setResults(list.slice(0, 8))
    setIsSearching(false)

    if (mode === 'voice') {
      const first = list[0]
      if (first) {
        speak(`${first.name}을 찾았어요. 맞으면 아래 결과를 눌러주세요`, {
          onceKey: `voice-search-result:${first.name}`,
        })
      }
    }
  }

  const goTo = (dest) => {
    navigate('/route', { state: { destination: { ...dest, emoji: '📍' } } })
  }

  return (
    <div className="flex-1 flex flex-col px-[22px] pb-6 overflow-hidden bg-background">
      <div className="min-h-[64px] flex items-center gap-3 px-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로"
          className="w-10 h-10 rounded-lg bg-white border border-ink-200 grid place-items-center text-ink-700 active:scale-95 shadow-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-extrabold tracking-normal">
          {mode === 'voice' ? '목적지를 말씀해 주세요' : '갈 수 있는 길 찾기'}
        </h2>
      </div>

      {mode === 'voice' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 음성 파형 */}
          <div className="flex items-end justify-center gap-1.5 h-20 mb-6 mt-8">
            {[0, 1, 2, 3, 4, 3, 2, 1].map((h, i) => (
              <div
                key={i}
                className="w-2 bg-primary rounded-full animate-voice-pulse"
                style={{
                  height: `${20 + h * 8}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          <div className="bg-white border border-primary-100 rounded-xl px-6 py-5 w-full text-center mb-6 shadow-sm">
            <div className="text-xs font-bold text-primary-700 mb-1 inline-flex items-center gap-1 justify-center">
              {isListening ? <><Mic className="w-3.5 h-3.5" /> 듣고 있어요</> : '듣는 중이에요'}
            </div>
            <div className="text-lg font-bold text-ink-900">
              {transcript || (isSearching ? '찾는 중…' : '"서울대병원까지 편한 길"')}
            </div>
          </div>

          <button
            onClick={start}
            className="w-20 h-20 bg-primary text-white rounded-2xl grid place-items-center shadow-primary active:scale-95 mx-auto"
            aria-label="다시 듣기"
          >
            <Mic className="w-8 h-8" strokeWidth={2.5} />
          </button>
          <p className="mt-4 text-sm text-ink-500 font-semibold text-center">다시 말씀하시려면 눌러주세요</p>

          {(hasSearched || results.length > 0) && (
            <div className="mt-6 flex-1 overflow-y-auto no-scrollbar">
              <div className="text-[13px] font-bold text-ink-500 mb-2 px-1">
                {isSearching ? '찾는 중...' : '맞는 목적지를 선택해 주세요'}
              </div>
              <SearchResults items={results} onPick={goTo} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <Input
            type="text"
            placeholder="목적지를 입력하세요"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch(text)}
            autoFocus
          />
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="text-[13px] font-bold text-ink-500 mb-2 px-1">
              {hasSearched
                ? isSearching
                  ? '찾는 중...'
                  : results.length === 0
                  ? '결과가 없어요'
                  : '검색 결과'
                : '편한길 예시 목적지'}
            </div>
            <SearchResults items={hasSearched ? results : FALLBACK_DESTINATIONS} onPick={goTo} />
          </div>
        </div>
      )}
    </div>
  )
}

function SearchResults({ items, onPick }) {
  if (!items.length) return null
  return (
    <div className="space-y-2">
      {items.map((d, i) => (
        <button
          key={`${d.name}-${i}`}
          onClick={() => onPick(d)}
          className="w-full flex items-center gap-3 p-4 bg-white border border-ink-200 hover:bg-ink-50 rounded-xl text-left active:scale-[0.98] transition-all shadow-sm"
        >
          <div className="w-11 h-11 rounded-lg bg-primary-50 text-primary grid place-items-center flex-shrink-0 border border-primary-100">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold truncate">{d.name}</div>
            <div className="text-sm text-ink-500 truncate mt-0.5">{d.address}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
