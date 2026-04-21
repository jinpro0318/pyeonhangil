import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useGPS } from '../hooks/useGPS'
import { POI_TYPES } from '../data/pois'
import { fetchPois } from '../services/poiApi'
import TabBar from '../components/TabBar'
import SOSButton from '../components/SOSButton'
import PoiDetailCard from '../components/PoiDetailCard'
import './MapMain.css'

const FILTERS = ['rest', 'toilet', 'elev', 'hospital', 'pharmacy', 'subway', 'cross']

// 50m 이상 이동했을 때만 다시 fetch
function quantize(p, precision = 3) {
  if (!p) return null
  return { lat: Number(p.lat.toFixed(precision)), lng: Number(p.lng.toFixed(precision)) }
}

export default function MapMain() {
  const navigate = useNavigate()
  const location = useLocation()
  const mapRef = useRef(null)
  const initialFilter = location.state?.filter || null
  const [activeFilter, setActiveFilter] = useState(initialFilter)
  const [pois, setPois] = useState([])
  const [selectedPoi, setSelectedPoi] = useState(null)
  const [loading, setLoading] = useState(false)

  const { position, start, isTracking } = useGPS({ enableStayDetection: false })

  useEffect(() => {
    start()
  }, [start])

  // 필터 또는 (대략적) 위치 변경 시에만 POI 재조회
  const fetchKey = useMemo(
    () => `${activeFilter || 'all'}|${JSON.stringify(quantize(position))}`,
    [activeFilter, position]
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const types = activeFilter ? [activeFilter] : FILTERS
    fetchPois({ center: position, types, radius: 1500 })
      .then((list) => {
        if (!cancelled) setPois(list)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [fetchKey])

  const { isReady, error, setCenter } = useKakaoMap(mapRef, {
    pois,
    center: position,
    myLocation: isTracking ? position : null,
    onPoiClick: (poi) => setSelectedPoi(poi),
  })

  const handleRecenter = () => {
    if (position) setCenter(position.lat, position.lng)
  }

  const handleRetry = () => window.location.reload()

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
                  <li>Vercel 환경변수 <code>VITE_KAKAO_JS_KEY</code> 등록</li>
                  <li>카카오 콘솔 → 앱 설정 → 플랫폼 → Web 에 도메인 등록 (<code>{typeof window !== 'undefined' ? window.location.origin : ''}</code>)</li>
                </ol>
              </div>
              <button className="btn" onClick={handleRetry} style={{ marginTop: 12 }}>다시 시도</button>
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
          >🎙</button>
        </div>

        {isReady && (
          <button
            className="map-recenter-btn"
            onClick={handleRecenter}
            aria-label="내 위치로 이동"
          >📍</button>
        )}

        <div className="map-filter">
          <div className="map-filter-title">
            무엇을 찾으세요?
            {loading && <span className="map-loading-pill">불러오는 중...</span>}
            {!loading && pois.length > 0 && (
              <span className="map-loading-pill">{pois.length}곳 찾음</span>
            )}
          </div>
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

        {selectedPoi && (
          <PoiDetailCard poi={selectedPoi} onClose={() => setSelectedPoi(null)} />
        )}

        <SOSButton bottom={260} />
      </div>
      <TabBar />
    </>
  )
}
