import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Mic, MapPin, Map, Search, ShieldCheck, X } from 'lucide-react'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useGPS } from '../hooks/useGPS'
import { POI_TYPES } from '../data/pois'
import { fetchPois } from '../services/poiApi'
import { getActiveFacilities, reportToPoi } from '../services/reportsStore'
import TabBar from '../components/TabBar'
import SOSButton from '../components/SOSButton'
import PoiDetailCard from '../components/PoiDetailCard'
import { Button } from '../components/ui/button'
import { poiIcon, TONES } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const FILTERS = ['rest', 'toilet', 'elev', 'cross', 'hospital', 'pharmacy', 'subway', 'public']
const GPS_DECIDED_KEY = 'pyeonhangil_gps_decided'

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
  const [userFacilities, setUserFacilities] = useState(() => getActiveFacilities())

  // 지도 진입 시 위치 권한 허용 여부를 팝업으로 확인 (한 번 결정하면 다시 안 뜸)
  const [showGpsAsk, setShowGpsAsk] = useState(() => {
    try { return localStorage.getItem(GPS_DECIDED_KEY) !== '1' } catch { return true }
  })
  useEffect(() => {
    let decided = false
    try { decided = localStorage.getItem(GPS_DECIDED_KEY) === '1' } catch {}
    if (decided) start()
  }, [start])

  const decideGps = (allow) => {
    try { localStorage.setItem(GPS_DECIDED_KEY, '1') } catch {}
    setShowGpsAsk(false)
    if (allow) start()
  }

  // 다른 화면에서 편의시설 제보가 추가되면 포커스 복귀 시 갱신
  useEffect(() => {
    const onFocus = () => setUserFacilities(getActiveFacilities())
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

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

  // 사용자 제보 편의시설을 서버 POI 와 합침 (필터 적용)
  const mergedPois = useMemo(() => {
    const facilityPois = userFacilities
      .map(reportToPoi)
      .filter((p) => !activeFilter || p.type === activeFilter)
    return [...pois, ...facilityPois]
  }, [pois, userFacilities, activeFilter])

  const { isReady, error, setCenter } = useKakaoMap(mapRef, {
    pois: mergedPois,
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
        <div ref={mapRef} className="map-container absolute inset-0 bg-ink-50">
          {!isReady && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-500 text-sm font-semibold">
              <div className="w-9 h-9 border-4 border-ink-200 border-t-primary rounded-full animate-spin" />
              지도를 불러오는 중...
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-white">
              <Map className="w-10 h-10 text-ink-400" />
              <div className="text-lg font-extrabold">지도를 불러올 수 없어요</div>
              <div className="text-sm text-ink-500">{error}</div>
              <Button onClick={() => window.location.reload()} className="mt-2">
                다시 시도
              </Button>
            </div>
          )}
        </div>

        {/* 검색바 */}
        <div className="absolute top-3.5 left-3.5 right-3.5 bg-white rounded-xl p-2 flex items-center gap-2 shadow-card border border-black/[0.04] z-20">
          <button
            onClick={() => navigate('/search?mode=text')}
            className="app-searchbar flex-1 text-[15px] font-semibold text-left"
          >
            <Search className="w-[18px] h-[18px] flex-shrink-0" />
            <span>어디를 찾으세요?</span>
          </button>
          <button
            onClick={() => navigate('/search?mode=voice')}
            aria-label="음성으로 검색"
            className="w-12 h-12 min-h-[48px] bg-primary text-white rounded-[12px] grid place-items-center active:scale-95 shadow-primary flex-shrink-0"
          >
            <Mic className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* 내 위치 버튼 */}
        {isReady && (
          <button
            onClick={handleRecenter}
            aria-label="내 위치로 이동"
            className="absolute right-3.5 bottom-[210px] w-14 h-14 min-h-[56px] bg-primary rounded-full shadow-md z-20 grid place-items-center active:scale-95"
          >
            <MapPin className="w-[22px] h-[22px] text-white" />
          </button>
        )}

        {/* 필터 카드 */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-white rounded-xl p-4 shadow-card border border-black/[0.04] z-20">
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[13px] font-bold text-ink-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-success-600" />
              {activeFilter ? POI_TYPES[activeFilter]?.label + '만 보기' : '이동 편의시설 찾기'}
            </div>
            {loading ? (
              <Pill>불러오는 중...</Pill>
            ) : mergedPois.length > 0 ? (
              <Pill>{mergedPois.length}곳 찾음</Pill>
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
              const { Icon, tone } = poiIcon(t)
              return (
                <button
                  key={t}
                  onClick={() => setActiveFilter(active ? null : t)}
                  className={cn(
                    'px-3 py-2.5 rounded-lg flex flex-col items-center gap-0.5 text-[11px] font-bold flex-shrink-0 min-w-[64px] transition-all active:scale-95 border',
                    active ? cn(TONES[tone].solid, 'border-transparent shadow-sm') : 'bg-white border-ink-200 text-ink-700 hover:bg-ink-50'
                  )}
                >
                  <Icon className={cn('w-[18px] h-[18px]', active ? 'text-white' : TONES[tone].line)} strokeWidth={2.2} />
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

      {showGpsAsk && (
        <div className="absolute inset-0 z-[210] bg-ink-900/45 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-[320px] bg-white rounded-[20px] shadow-xl p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary grid place-items-center mx-auto mb-4">
              <MapPin className="w-8 h-8" strokeWidth={2.2} />
            </div>
            <h2 className="text-lg font-extrabold text-ink-900 mb-2">위치 사용을 허용할까요?</h2>
            <p className="text-sm text-ink-500 leading-relaxed mb-5">
              현재 위치를 알아야 지도에서 가까운 쉼터·화장실·엘리베이터와 편한 길을 안내해 드릴 수 있어요.
            </p>
            <div className="flex flex-col gap-2">
              <Button className="w-full" onClick={() => decideGps(true)}>위치 사용 허용</Button>
              <Button variant="secondary" className="w-full" onClick={() => decideGps(false)}>나중에 할게요</Button>
            </div>
          </div>
        </div>
      )}
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
