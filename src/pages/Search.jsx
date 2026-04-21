import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useVoice } from '../hooks/useVoice'
import './Search.css'

const SAMPLE_DESTINATIONS = [
  { name: '서울대학교병원', address: '서울 종로구 대학로 101' },
  { name: '종로3가역', address: '서울 종로구 종로' },
  { name: '탑골공원', address: '서울 종로구 종로 99' },
  { name: '광화문역', address: '서울 종로구 세종대로' },
]

export default function Search() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const mode = params.get('mode') || 'voice'
  const [text, setText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { speak } = useVoice()
  const { isListening, transcript, start, isSupported } = useSpeechRecognition()

  useEffect(() => {
    if (mode === 'voice' && isSupported) {
      speak('어디로 가세요?')
      setTimeout(() => start(), 1000)
    }
  }, [mode, isSupported, speak, start])

  useEffect(() => {
    if (transcript) {
      setText(transcript)
      // 자동 검색
      setTimeout(() => handleSearch(transcript), 500)
    }
    // eslint-disable-next-line
  }, [transcript])

  const handleSearch = (query) => {
    const q = (query || text).trim()
    if (!q) return
    setIsSearching(true)
    // 샘플: 첫 결과로 이동
    const match =
      SAMPLE_DESTINATIONS.find((d) => d.name.includes(q)) || SAMPLE_DESTINATIONS[0]
    setTimeout(() => {
      navigate('/route', {
        state: {
          destination: {
            name: match.name,
            address: match.address,
            emoji: '📍',
          },
        },
      })
    }, 500)
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <button className="search-back" onClick={() => navigate(-1)}>
          ‹
        </button>
        <h2>
          {mode === 'voice' ? '말씀해 주세요' : '어디로 가세요?'}
        </h2>
      </div>

      {mode === 'voice' ? (
        <div className="search-voice">
          <div className="search-wave">
            {[0, 1, 2, 3, 4, 3, 2, 1].map((h, i) => (
              <div
                key={i}
                className="wave-bar"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  '--peak': `${20 + h * 8}px`,
                }}
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

          <button className="search-mic-btn" onClick={start}>
            🎙
          </button>
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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            autoFocus
          />
          <div className="search-suggestions">
            <div className="list-label">이런 곳은 어떠세요?</div>
            {SAMPLE_DESTINATIONS.map((d, i) => (
              <button
                key={i}
                className="action-card"
                onClick={() => handleSearch(d.name)}
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
