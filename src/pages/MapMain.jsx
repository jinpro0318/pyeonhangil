import { useRef, useState } from 'react'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { SAMPLE_POIS, POI_TYPES } from '../data/pois'
import TabBar from '../components/TabBar'
import SOSButton from '../components/SOSButton'
import './MapMain.css'

const FILTERS = ['rest', 'toilet', 'cross', 'elev']

export default function MapMain() {
  const mapRef = useRef(null)
  const [activeFilter, setActiveFilter] = useState(null)

  const filteredPois = activeFilter
    ? SAMPLE_POIS.filter((p) => p.type === activeFilter)
    : SAMPLE_POIS

  const { isReady, error } = useKakaoMap(mapRef, { pois: filteredPois })

  return (
    <>
      <div className="map-page">
        <div className="map-container" ref={mapRef}>
          {!isReady && !error && (
            <div className="map-loading">
              🗺️ 지도를 불러오는 중...
            </div>
          )}
          {error && (
            <div className="map-error">
              <div className="map-error-icon">🗺️</div>
              <div className="map-error-title">카카오맵 연동 영역</div>
              <div className="map-error-msg">
                JavaScript 키 등록 후 표시됩니다
              </div>
            </div>
          )}
        </div>

        <div className="map-search-bar">
          <div className="map-search-input">
            <span className="map-search-icon">🔍</span>
            <span>어디를 찾으세요?</span>
          </div>
          <button className="map-voice-btn">🎙</button>
        </div>

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
