import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useGPS } from '../hooks/useGPS'
import { SAMPLE_POIS, POI_TYPES } from '../data/pois'
import TabBar from '../components/TabBar'
import SOSButton from '../components/SOSButton'
import './MapMain.css'

const FILTERS = ['rest', 'toilet', 'cross', 'elev']

export default function MapMain() {
  const navigate = useNavigate()
  const location = useLocation()
  const mapRef = useRef(null)
  const initialFilter = location.state?.filter || null
  const [activeFilter, setActiveFilter] = useState(initialFilter)

  const { position, start, isTracking } = useGPS({ enableStayDetection: false })

  useEffect(() => {
    start()
  }, [start])

  const filteredPois = activeFilter
    ? SAMPLE_POIS.filter((p) => p.type === activeFilter)
    : SAMPLE_POIS

  const { isReady, error, setCenter } = useKakaoMap(mapRef, {
    pois: filteredPois,
    center: position,
    myLocation: isTracking ? position : null,
  })

  const handleRecenter = () => {
    if (position) setCenter(position.lat, position.lng)
  }

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <>
      <div className="map-page">
        <div className="map-container" ref={mapRef}>
          {!isReady && !error && (
            <div className="map-loading">
              <div className="map-loading-spinner" />
              <div>지도를 불러오는 중...</div>
            </div>
          )}
          {error && (
            <div className="map-error">
              <div className="map-error-icon">🗺️</div>
              <div className="map-error-title">지도를 불러올 수 없어요</div>
              <div className="map-error-msg">{error}</div>
              <div className="map-error-help">
                <div className="map-error-help-title">해결 방법</div>
                <ol className="map-error-help-list">
                  <li>Vercel → Settings → Environment Variables에 <code>VITE_KAKAO_JS_KEY</code> 등록</li>
                  <li>카카오 개발자 콘솔 → 앱 설정 → 플랫폼 → Web에 현재 도메인 등록 (<code>{typeof window !== 'undefined' ? window.location.origin : ''}</code>)</li>
                  <li>변경 후 Vercel에서 재배포</li>
                </ol>
              </div>
              <button className="btn" onClick={handleRetry} style={{ marginTop: 12 }}>
                다시 시도
              </button>
            </div>
          )}
        </div>

        <div className="map-search-bar">
          <button
            className="map-search-input"
            onClick={() => navigate('/search?mode=text')}
            aria-label="장소 검색"
          >
            <span className="map-search-icon">🔍</span>
            <span>어디를 찾으세요?</span>
          </button>
          <button
            className="map-voice-btn"
            onClick={() => navigate('/search?mode=voice')}
            aria-label="음성으로 검색"
          >
            🎙
          </button>
        </div>

        {isReady && (
          <button
            className="map-recenter-btn"
            onClick={handleRecenter}
            aria-label="내 위치로 이동"
          >
            📍
          </button>
        )}

        <div className="map-filter">
          <div className="map-filter-title">무엇을 찾으세요?</div>
          <div className="map-filter-btns">
            {FILTERS.map((t) => {
              const type = POI_TYPES[t]
              const active = activeFilter === t
              return (
                <button
                  key={t}
                  className={`map-filter-btn ${active ? 'active' : ''}`}
                  style={active ? { background: type.color, color: 'white' } : {}}
                  onClick={() => setActiveFilter(active ? null : t)}
                >
                  <span className="map-filter-emoji">{type.emoji}</span>
                  <span>{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <SOSButton bottom={260} />
      </div>
      <TabBar />
    </>
  )
}
