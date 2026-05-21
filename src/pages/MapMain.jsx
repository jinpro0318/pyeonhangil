import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Database, Mic, MapPin, Search, ShieldCheck, X } from 'lucide-react'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useGPS } from '../hooks/useGPS'
import { POI_TYPES } from '../data/pois'
import { fetchPois } from '../services/poiApi'
import TabBar from '../components/TabBar'
import SOSButton from '../components/SOSButton'
import PoiDetailCard from '../components/PoiDetailCard'
import { Button } from '../components/ui/button'
import { cn } from '@/lib/utils'

const FILTERS = ['rest', 'toilet', 'elev', 'cross', 'hospital', 'pharmacy', 'subway', 'public']

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

  useEffect(() => { start() }, [start])

  const fetchKey = useMemo(
    () => `${activeFilter || 'all'}|${JSON.stringify(quantize(position))}`,
    [activeFilter, position]
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const types = activeFilter ? [activeFilter] : FILTERS
    fetchPois({ center: position, types, radius: 1500 })
      .then((list) => { if (!cancelled) setPois(list) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
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

  return (
    <>
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <div ref={mapRef} className="map-container absolute inset-0 bg-ink-50 touch-none">
          {!isReady && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-500 text-sm font-semibold">
              <div className="w-9 h-9 border-4 border-ink-200 border-t-primary rounded-full animate-spin" />
              지도를 불러오는 중...
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-white">
              <div className="text-4xl">🗺️</div>
              <div className="text-lg font-extrabold">지도를 불러올 수 없어요</div>
              <div className="text-sm text-ink-500">{error}</div>
              <Button onClick={() => window.location.reload()} className="mt-2">
                다시 시도
              </Button>
            </div>
          )}
        </div>

        {/* 검색바 */}
        <div className="absolute top-3.5 left-14 right-3.5 bg-white rounded-xl p-2 pl-3 flex items-center gap-2.5 shadow-md border border-ink-200 z-20">
          <button
            onClick={() => navigate('/search?mode=text')}
            className="flex-1 flex items-center gap-2.5 py-2.5 text-[15px] text-ink-500 font-semibold text-left"
          >
            <Search className="w-[18px] h-[18px]" />
            <span>어디를 찾으세요?</span>
          </button>
          <button
            onClick={() => navigate('/search?mode=voice')}
            aria-label="음성으로 검색"
            className="w-10 h-10 bg-primary text-white rounded-lg grid place-items-center active:scale-95 shadow-primary"
          >
            <Mic className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="absolute top-[76px] left-3.5 right-3.5 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-md border border-ink-200 z-20">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary grid place-items-center flex-shrink-0 border border-primary-100">
              <Database className="w-[18px] h-[18px]" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-extrabold text-ink-900">
                공공데이터와 제보를 한 지도에서 확인
              </div>
              <div className="text-[11px] font-semibold text-ink-500 mt-0.5 break-keep">
                쉼터, 화장실, 엘리베이터, 횡단보도 정보를 근처 기준으로 모아 보여줍니다.
              </div>
            </div>
          </div>
        </div>

        {/* 내 위치 버튼 */}
        {isReady && (
          <button
            onClick={handleRecenter}
            aria-label="내 위치로 이동"
            className="absolute right-3.5 bottom-[210px] w-12 h-12 bg-white rounded-xl shadow-md border border-ink-200 z-20 grid place-items-center active:scale-95"
          >
            <MapPin className="w-[22px] h-[22px] text-primary" />
          </button>
        )}

        {/* 필터 카드 */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-white rounded-xl p-4 shadow-lg border border-ink-200 z-20">
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[13px] font-bold text-ink-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-success-600" />
              {activeFilter ? POI_TYPES[activeFilter]?.label + '만 보기' : '이동 편의시설 찾기'}
            </div>
            {loading ? (
              <Pill>불러오는 중...</Pill>
            ) : pois.length > 0 ? (
              <Pill>{pois.length}곳 찾음</Pill>
            ) : activeFilter ? (
              <Pill tone="warning">근처에 없어요</Pill>
            ) : null}
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4">
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="px-3 py-2.5 bg-primary text-white rounded-lg flex flex-col items-center gap-0.5 text-[11px] font-bold flex-shrink-0 min-w-[64px] active:scale-95"
              >
                <X className="w-[18px] h-[18px]" />
                <span>전체</span>
              </button>
            )}
            {FILTERS.map((t) => {
              const type = POI_TYPES[t]
              if (!type) return null
              const active = activeFilter === t
              return (
                <button
                  key={t}
                  onClick={() => setActiveFilter(active ? null : t)}
                  className={cn(
                    'px-3 py-2.5 rounded-lg flex flex-col items-center gap-0.5 text-[11px] font-bold flex-shrink-0 min-w-[64px] transition-all active:scale-95 border',
                    active ? 'text-white border-transparent shadow-sm' : 'bg-white border-ink-200 text-ink-700 hover:bg-ink-50'
                  )}
                  style={active ? { background: type.color } : {}}
                >
                  <span className="text-lg">{type.emoji}</span>
                  <span>{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {selectedPoi && (
          <PoiDetailCard poi={selectedPoi} onClose={() => setSelectedPoi(null)} />
        )}

        <SOSButton bottom={250} />
      </div>
      <TabBar />
    </>
  )
}

function Pill({ children, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary-50 text-primary-700',
    warning: 'bg-warning-50 text-warning',
  }
  return (
    <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full', tones[tone])}>
      {children}
    </span>
  )
}
