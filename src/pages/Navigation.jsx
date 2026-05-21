import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic, Volume2, MapPin, Toilet, Frown, Repeat, ShieldCheck,
} from 'lucide-react'
import { useGPS } from '../hooks/useGPS'
import { useVoice } from '../hooks/useVoice'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { fetchPois, fetchPoisInBbox } from '../services/poiApi'
import { fetchRoute } from '../services/routeApi'
import { startTrip, getActiveTrip } from '../services/tripStore'
import { bboxFromCoords, formatDistance, estimateMinutes, minDistanceToPolyline } from '../utils/geo'
import SOSButton from '../components/SOSButton'
import PoiDetailCard from '../components/PoiDetailCard'
import { Button } from '../components/ui/button'
import { cn } from '@/lib/utils'

const SERVICE_TYPES = ['rest', 'toilet', 'elev', 'ramp', 'cross']
const ROUTE_RADIUS_METERS = 50

const WALK_CHIP = {
  older: 'bg-success-50 text-success-600 border border-success/20',
  wheelchair: 'bg-primary-50 text-primary border border-primary/20',
  visual: 'bg-warning-50 text-warning border border-warning/20',
  stroller: 'bg-walk-stroller-soft text-walk-stroller border border-walk-stroller/20',
  injured: 'bg-danger-50 text-danger border border-danger/20',
}

export default function Navigation() {
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const { state, setActiveRoute } = useAppState()
  const { speak, isSpeaking } = useVoice()
  const { position, speedMeterPerMin, isStaying, isTracking, hasPosition, start } = useGPS({
    stayThresholdSeconds: 180,
  })
  const walk = WALK_STATES[state.user.walkState] || WALK_STATES.older
  const destination = state.destination
  const destName = destination?.name || '병원'

  const [route, setRoute] = useState(state.activeRoute || null)
  const [nearbyPois, setNearbyPois] = useState([])
  const [selectedPoi, setSelectedPoi] = useState(null)

  useEffect(() => {
    start()
    if (destination?.lat && !getActiveTrip()) startTrip(destination)
    if (!state.activeRoute && hasPosition && position && destination?.lat) {
      fetchRoute(position, { lat: destination.lat, lng: destination.lng }).then((r) => {
        setRoute(r); if (r) setActiveRoute(r)
      })
    }
    // eslint-disable-next-line
  }, [hasPosition, position?.lat, destination?.lat])

  useEffect(() => {
    if (route?.coords?.length) {
      const bbox = bboxFromCoords(route.coords, ROUTE_RADIUS_METERS + 10)
      if (!bbox) return
      fetchPoisInBbox({ bbox, types: SERVICE_TYPES }).then((list) => {
        const filtered = list
          .filter((p) => SERVICE_TYPES.includes(p.type))
          .map((p) => ({ ...p, _dToRoute: minDistanceToPolyline(p, route.coords) }))
          .filter((p) => p._dToRoute <= ROUTE_RADIUS_METERS)
          .sort((a, b) => a._dToRoute - b._dToRoute)
        setNearbyPois(filtered.slice(0, 24))
      })
      return
    }
    if (!position) return
    fetchPois({ center: position, types: SERVICE_TYPES, radius: ROUTE_RADIUS_METERS }).then((list) => {
      setNearbyPois(list.filter((p) => SERVICE_TYPES.includes(p.type)).slice(0, 10))
    })
  }, [route, position?.lat])

  useEffect(() => {
    if (isStaying) navigate('/resting')
  }, [isStaying, navigate])

  const distanceMeters = route?.distanceMeters || 0
  const remainingTime = distanceMeters ? estimateMinutes(distanceMeters, walk.id) : 12

  const announcedRef = useRef(false)
  useEffect(() => {
    if (announcedRef.current) return
    if (!route && distanceMeters === 0) return
    announcedRef.current = true
    speak(`${destName}까지 ${remainingTime}분 남았어요. 안전하게 천천히 가세요`, {
      onceKey: `navigation-start:${destName}`,
    })
    // eslint-disable-next-line
  }, [route])

  const handleRepeat = () => speak(`${destName}까지 ${remainingTime}분 남았어요`, { immediate: true })
  const handleArrived = () => navigate('/arrived')

  const polylines = route?.coords?.length > 1
    ? [{ path: route.coords, color: '#3182F6', weight: 7, opacity: 0.85 }] : []

  const destPois = []
  if (destination?.lat) {
    destPois.push({
      id: 'nav_end', type: 'end', name: destName,
      lat: destination.lat, lng: destination.lng,
    })
  }

  const mapPois = useMemo(() => [...destPois, ...nearbyPois], [destPois, nearbyPois])

  const { isReady: mapReady, error: mapError } = useKakaoMap(mapRef, {
    pois: mapPois, polylines, center: position,
    myLocation: hasPosition && isTracking ? position : null,
    level: 4, draggable: true, fitBoundsOnPolyline: true,
    onPoiClick: (poi) => setSelectedPoi(poi),
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* 지도 영역 */}
      <div className="relative h-[36vh] bg-ink-50 nav-map flex-shrink-0 border-b border-ink-200" ref={mapRef}>
        {!mapReady && !mapError && (
          <div className="absolute inset-0 grid place-items-center text-sm text-ink-500 font-semibold">
            🗺️ 지도 불러오는 중...
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 grid place-items-center text-sm text-ink-500 font-semibold">
            지도 표시 실패 · 안내는 계속됩니다
          </div>
        )}

        {/* 상단 상태 */}
        <div className="absolute top-2.5 left-14 right-4 flex gap-2 flex-wrap z-10">
          <div className="voice-indicator">
            <div className="voice-dot" />
            {isSpeaking ? (<><Volume2 className="w-3 h-3" /> 말하는 중</>) : (<><Mic className="w-3 h-3" /> 대기 중</>)}
          </div>
          <div className="gps-indicator">
            <div className="gps-dot" />
            <MapPin className="w-3 h-3" /> {isTracking ? `분당 ${Math.max(speedMeterPerMin, 40)}m` : 'GPS 켜는 중'}
          </div>
        </div>
      </div>

      {/* 안내 본문 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-6 bg-background">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="text-lg font-extrabold tracking-normal">
            {destName}까지 {remainingTime}분 남음
            {distanceMeters > 0 && (
              <span className="ml-1 text-sm text-ink-500 font-bold">· {formatDistance(distanceMeters)}</span>
            )}
          </div>
          <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0', WALK_CHIP[walk.id])}>
            {walk.emoji} {walk.name}
          </span>
        </div>

        {/* 음성 파형 */}
        <div className="flex items-end justify-center gap-1.5 h-14 mb-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-2 bg-primary rounded-full animate-voice-pulse"
              style={{
                height: `${20 + (i % 3) * 10}px`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0.6 + (i % 3) * 0.15,
              }}
            />
          ))}
        </div>

        {/* 큰 거리 표시 */}
        <div className="flex items-end justify-center gap-2 mb-4">
          <div className="text-6xl text-primary font-extrabold tracking-tighter">
            {formatDistance(distanceMeters || 120).replace(/[a-z]/i, '')}
            <span className="text-2xl">m</span>
          </div>
        </div>

        <div className="text-center text-base font-bold mb-1">{destName} 방향</div>
        <div className="text-center text-sm text-ink-500 mb-5">"파란선을 따라가세요"</div>

        {/* 음성 명령 힌트 */}
        <div className="bg-white border border-success-50 rounded-xl p-3.5 mb-4 shadow-sm">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-extrabold text-ink-900">
                경로 주변 편의시설 {nearbyPois.length}곳 확인 중
              </div>
              <div className="text-xs text-ink-500 font-semibold mt-1 break-keep">
                공공데이터와 제보 정보를 함께 보며 쉬어갈 곳과 위험 요소를 안내합니다.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-primary-100 rounded-xl p-3.5 mb-4 shadow-sm">
          <div className="text-xs font-bold text-primary-700 mb-1.5 flex items-center gap-1">
            <Mic className="w-3.5 h-3.5" /> 말씀하셔도 돼요
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['다시 말해줘', '힘들어', '화장실'].map((c) => (
              <span key={c} className="text-xs font-bold bg-white text-primary px-2 py-1 rounded-full">
                "{c}"
              </span>
            ))}
          </div>
        </div>

        {/* 빠른 행동 3개 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <QuickBtn Icon={Frown} label="힘들어요" color="bg-warning-50 text-warning" onClick={() => navigate('/resting')} />
          <QuickBtn Icon={Toilet} label="화장실" color="bg-primary-50 text-primary" onClick={() => navigate('/map', { state: { filter: 'toilet' } })} />
          <QuickBtn Icon={Repeat} label="다시듣기" color="bg-success-50 text-success-600" onClick={handleRepeat} />
        </div>

        <Button variant="secondary" className="w-full" onClick={handleArrived}>
          도착 시뮬레이션
        </Button>
      </div>

      <SOSButton bottom={24} />

      {selectedPoi && <PoiDetailCard poi={selectedPoi} onClose={() => setSelectedPoi(null)} />}
    </div>
  )
}

function QuickBtn({ Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-ink-200 hover:bg-ink-50 rounded-xl py-3.5 flex flex-col items-center gap-1.5 active:scale-95 transition-all shadow-sm"
    >
      <div className={cn('w-10 h-10 rounded-lg grid place-items-center border border-current/10', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-xs font-bold text-ink-700">{label}</div>
    </button>
  )
}
