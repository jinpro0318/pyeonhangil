import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, AlertTriangle, Check, X as XIcon,
  Armchair, Bus, Database, Footprints, ShieldCheck, Train,
} from 'lucide-react'
import { useAppState, WALK_STATES } from '../hooks/useAppState'
import { useVoice } from '../hooks/useVoice'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useGPS } from '../hooks/useGPS'
import { fetchRoute } from '../services/routeApi'
import { fetchPoisInBbox } from '../services/poiApi'
import { bboxFromCoords, formatDistance, estimateMinutes, minDistanceToPolyline } from '../utils/geo'
import { POI_TYPES } from '../data/pois'
import { getActiveReports, reportToPoi, REPORT_TYPES } from '../services/reportsStore'
import PoiDetailCard from '../components/PoiDetailCard'
import { Button } from '../components/ui/button'
import { cn } from '@/lib/utils'

const SERVICE_TYPES = ['rest', 'toilet', 'elev', 'ramp', 'cross']
const ROUTE_RADIUS_METERS = 50

async function kakaoSuggest(query, center) {
  if (!query || query.trim().length < 1) return []
  const params = new URLSearchParams({ query })
  if (center?.lat) {
    params.set('x', String(center.lng))
    params.set('y', String(center.lat))
    params.set('radius', '10000')
  } else {
    params.set('x', '126.978')
    params.set('y', '37.566')
    params.set('radius', '20000')
  }
  try {
    const r = await fetch(`/api/local?${params.toString()}`)
    if (!r.ok) return []
    const data = await r.json()
    return (data.pois || []).slice(0, 6).map((p) => ({
      name: p.name, address: p.address || '', lat: p.lat, lng: p.lng,
    }))
  } catch { return [] }
}

const WALK_CHIP = {
  older: 'bg-success-50 text-success-600',
  wheelchair: 'bg-primary-50 text-primary',
  visual: 'bg-warning-50 text-warning',
  stroller: 'bg-walk-stroller-soft text-walk-stroller',
  injured: 'bg-danger-50 text-danger',
}

export default function RouteSuggest() {
  const location = useLocation()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const { state, setDestination, setActiveRoute } = useAppState()
  const { speak } = useVoice()
  const { position, hasPosition, error: gpsError, start } = useGPS({ enableStayDetection: false })

  const initialDestination = location.state?.destination ||
    state.destination || {
      name: '서울대학교병원',
      address: '서울 종로구 대학로 101',
      lat: 37.579617, lng: 126.998292,
    }
  const walk = WALK_STATES[state.user.walkState] || WALK_STATES.older

  const [route, setRoute] = useState(null)
  const [routePois, setRoutePois] = useState([])
  const [isRouting, setIsRouting] = useState(false)
  const [selectedPoi, setSelectedPoi] = useState(null)
  const [reports, setReports] = useState(getActiveReports())

  const [originText, setOriginText] = useState('')
  const [originPick, setOriginPick] = useState(null)
  const [destText, setDestText] = useState(initialDestination.name || '')
  const [destPick, setDestPick] = useState(initialDestination)
  const [originSug, setOriginSug] = useState([])
  const [destSug, setDestSug] = useState([])
  const [activeField, setActiveField] = useState(null)
  const originDebRef = useRef(null)
  const destDebRef = useRef(null)

  const origin = originPick || (hasPosition ? position : null)
  const destination = destPick || initialDestination

  useEffect(() => {
    start()
    if (!origin?.lat || !destination?.lat) return
    setIsRouting(true)
    fetchRoute(
      { lat: origin.lat, lng: origin.lng },
      { lat: destination.lat, lng: destination.lng },
      { mode: 'walk' }
    )
      .then((r) => setRoute(r))
      .catch(() => setRoute(null))
      .finally(() => setIsRouting(false))
    // eslint-disable-next-line
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng])

  useEffect(() => {
    const onFocus = () => setReports(getActiveReports())
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const nearbyReports = route?.coords?.length
    ? reports.filter((r) => minDistanceToPolyline(r, route.coords) <= ROUTE_RADIUS_METERS)
    : []

  useEffect(() => {
    if (activeField !== 'origin') return
    if (originPick && originText === originPick.name) { setOriginSug([]); return }
    if (originDebRef.current) clearTimeout(originDebRef.current)
    originDebRef.current = setTimeout(async () => {
      setOriginSug(await kakaoSuggest(originText, position))
    }, 250)
    return () => clearTimeout(originDebRef.current)
    // eslint-disable-next-line
  }, [originText, activeField])

  useEffect(() => {
    if (activeField !== 'dest') return
    if (destPick && destText === destPick.name) { setDestSug([]); return }
    if (destDebRef.current) clearTimeout(destDebRef.current)
    destDebRef.current = setTimeout(async () => {
      setDestSug(await kakaoSuggest(destText, position))
    }, 250)
    return () => clearTimeout(destDebRef.current)
    // eslint-disable-next-line
  }, [destText, activeField])

  useEffect(() => {
    if (!route?.coords?.length) return
    const bbox = bboxFromCoords(route.coords, ROUTE_RADIUS_METERS + 10)
    if (!bbox) return
    fetchPoisInBbox({ bbox, types: SERVICE_TYPES }).then((list) => {
      const filtered = list
        .filter((p) => SERVICE_TYPES.includes(p.type))
        .map((p) => ({ ...p, _dToRoute: minDistanceToPolyline(p, route.coords) }))
        .filter((p) => p._dToRoute <= ROUTE_RADIUS_METERS)
        .sort((a, b) => a._dToRoute - b._dToRoute)
      setRoutePois(filtered.slice(0, 40))
    })
  }, [route])

  const polylines = route?.coords?.length > 1
    ? [{ path: route.coords, color: '#3182F6', weight: 7, opacity: 0.85 }] : []

  const startEndPois = []
  if (origin?.lat) {
    startEndPois.push({
      id: 'route_start', type: 'start',
      name: originPick ? originPick.name : '지금 여기',
      lat: origin.lat, lng: origin.lng,
    })
  }
  if (destination?.lat) {
    startEndPois.push({
      id: 'route_end', type: 'end', name: destination.name,
      lat: destination.lat, lng: destination.lng,
    })
  }
  const reportPois = reports.map(reportToPoi)

  const { isReady: isMapReady, error: mapError } = useKakaoMap(mapRef, {
    pois: [...startEndPois, ...routePois.slice(0, 25), ...reportPois],
    polylines, center: position, myLocation: hasPosition ? position : null,
    level: 5, fitBoundsOnPolyline: true,
    onPoiClick: (poi) => { if (poi.type !== 'start') setSelectedPoi(poi) },
  })

  const distanceMeters = route?.distanceMeters || 0
  const minutes = distanceMeters
    ? Math.max(estimateMinutes(distanceMeters, walk.id), Math.round((route?.durationSeconds || 0) / 60))
    : (walk.id === 'wheelchair' ? 30 : walk.id === 'visual' ? 24 : walk.id === 'injured' ? 24 : 20)

  useEffect(() => {
    if (route) {
      speak(`${destination.name}까지 ${minutes}분 걸리는 편한 길을 찾았어요`, {
        onceKey: `route-found:${destination.name}:${Math.round(distanceMeters / 50)}`,
      })
    }
    // eslint-disable-next-line
  }, [route])

  const handleStart = () => {
    setDestination(destination)
    if (route) setActiveRoute(route)
    navigate('/navigation')
  }

  const restCount = routePois.filter((p) => p.type === 'rest').length
  const toiletCount = routePois.filter((p) => p.type === 'toilet').length
  const accessibleCount = routePois.filter((p) => p.type === 'cross').length
  const elevCount = routePois.filter((p) => p.type === 'elev').length
  const rampCount = routePois.filter((p) => p.type === 'ramp').length
  const burdenScore = Math.max(72, Math.min(96, 88 + Math.min(restCount, 3) * 2 + Math.min(elevCount + rampCount, 2) * 2 - nearbyReports.length * 3))

  const LEGEND_ORDER = ['rest', 'toilet', 'elev', 'ramp', 'cross']
  const legend = LEGEND_ORDER
    .map((t) => ({ type: t, count: routePois.filter((p) => p.type === t).length, ...POI_TYPES[t] }))
    .filter((l) => l.count > 0)

  return (
    <div className="flex-1 flex flex-col px-[22px] overflow-hidden bg-background">
      {/* 헤더 */}
      <div className="min-h-[64px] flex items-center gap-3 pl-[64px] pr-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로"
          className="w-10 h-10 rounded-lg bg-white border border-ink-200 grid place-items-center text-ink-700 active:scale-95 shadow-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-extrabold tracking-normal">편한 길</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
        <div className="bg-white border border-primary-100 rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary grid place-items-center flex-shrink-0 border border-primary-100">
              <Bus className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-extrabold text-ink-900">통합 이동 경로</div>
              <div className="text-xs text-ink-500 font-semibold mt-1 leading-relaxed break-keep">
                걷는 구간과 대중교통 연결을 나누어 고르지 않아도 되도록 한 번에 안내합니다.
              </div>
              <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
                <MoveChip Icon={Footprints}>걷기</MoveChip>
                <MoveChip Icon={Train}>지하철·버스</MoveChip>
                <MoveChip Icon={Armchair}>중간 휴식</MoveChip>
              </div>
            </div>
          </div>
        </div>

        {!origin?.lat && (
          <div className="bg-warning-50 border border-warning/30 rounded-xl p-4 mb-4">
            <div className="text-sm font-extrabold text-ink-900">출발지를 확인하고 있어요</div>
            <div className="text-xs text-ink-500 font-semibold mt-1 leading-relaxed break-keep">
              {gpsError
                ? '위치 권한이 꺼져 있으면 출발지를 직접 입력해 주세요.'
                : 'GPS가 잡히면 자동으로 현재 위치에서 경로를 계산합니다. 급하면 출발지를 직접 입력할 수 있어요.'}
            </div>
          </div>
        )}

        {/* 경로 위 제보 경고 */}
        {nearbyReports.length > 0 && (
          <div className="bg-warning-50 border border-warning/30 rounded-xl p-4 mb-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-ink-900">
                이 경로에 제보 {nearbyReports.length}건이 있어요
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {nearbyReports.slice(0, 3).map((r) => {
                  const meta = REPORT_TYPES[r.type] || REPORT_TYPES.other
                  return (
                    <span key={r.id} className="text-xs font-bold bg-white px-2 py-0.5 rounded-full">
                      {meta.emoji} {meta.label}
                    </span>
                  )
                })}
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigate('/community')}>
              상세
            </Button>
          </div>
        )}

        {/* 지도 */}
        <div ref={mapRef} className="route-map h-[260px] bg-ink-50 rounded-xl overflow-hidden relative mb-4 border border-ink-200 shadow-sm">
          {!isMapReady && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-500 font-semibold">
              🗺️ 지도를 불러오는 중…
            </div>
          )}
          {isMapReady && (!route || isRouting) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-ink-500 font-semibold">
              🗺️ 편한 길을 그리고 있어요…
            </div>
          )}
          {mapError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center bg-white">
              <div className="text-base font-bold">🗺️ 지도를 불러올 수 없어요</div>
              <div className="text-xs text-ink-500">{mapError}</div>
            </div>
          )}
        </div>

        {/* 경로 주변 시설 범례 */}
        {legend.length > 0 && (
          <div className="bg-white border border-ink-200 rounded-xl p-4 mb-4 shadow-sm">
            <div className="text-[13px] font-bold text-ink-500 mb-2">경로 주변 시설</div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {legend.map((l) => (
                <div key={l.type} className="flex items-center gap-1.5 bg-white border border-ink-200 px-2.5 py-1.5 rounded-full flex-shrink-0">
                  <span
                    className="w-5 h-5 rounded-full grid place-items-center text-[11px] flex-shrink-0"
                    style={{ background: l.color + '22', color: l.color }}
                  >
                    {l.emoji}
                  </span>
                  <span className="text-sm font-bold">{l.label}</span>
                  <span className="text-xs text-ink-500 font-semibold">{l.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mb-4">
          <RouteSignal
            Icon={ShieldCheck}
            value={`${burdenScore}점`}
            label="이동 가능성"
            tone="primary"
          />
          <RouteSignal
            Icon={Armchair}
            value={`${restCount + toiletCount}곳`}
            label="쉬어갈 곳"
            tone="success"
          />
          <RouteSignal
            Icon={Database}
            value={`${routePois.length + nearbyReports.length}건`}
            label="연결 정보"
            tone="warning"
          />
        </div>

        {/* 출발/도착 입력 */}
        <div className="bg-white border border-ink-200 rounded-xl p-4 mb-4 relative shadow-sm">
          {/* 출발 */}
          <RouteField
            dot="bg-success"
            placeholder="출발 — 비우면 현재 위치"
            value={originText}
            onChange={(v) => { setOriginText(v); setOriginPick(null) }}
            onFocus={() => setActiveField('origin')}
            onBlur={() => setTimeout(() => setActiveField(null), 200)}
            onClear={() => { setOriginText(''); setOriginPick(null); setOriginSug([]) }}
            suggestions={activeField === 'origin' ? originSug : []}
            onPick={(s) => {
              setOriginPick(s); setOriginText(s.name)
              setOriginSug([]); setActiveField(null)
            }}
          />
          <div className="ml-[7px] my-2 w-px h-4 bg-ink-300" />
          {/* 도착 */}
          <RouteField
            dot="bg-primary"
            placeholder="도착지를 입력하세요"
            value={destText}
            strong
            onChange={(v) => { setDestText(v); setDestPick(null) }}
            onFocus={() => setActiveField('dest')}
            onBlur={() => setTimeout(() => setActiveField(null), 200)}
            onClear={() => { setDestText(''); setDestPick(null); setDestSug([]) }}
            suggestions={activeField === 'dest' ? destSug : []}
            onPick={(s) => {
              setDestPick(s); setDestText(s.name)
              setDestSug([]); setActiveField(null)
            }}
          />
          {destination?.address && destPick && (
            <div className="text-xs text-ink-500 ml-6 mt-1">{destination.address}</div>
          )}
        </div>

        {/* 추천 경로 카드 */}
        <div className="bg-white border border-primary/20 rounded-xl p-5 mb-4 shadow-md">
          <span className="inline-block text-[11px] font-extrabold text-primary bg-primary-50 px-2.5 py-1 rounded-full mb-2">
            이동 부담 기준 추천
          </span>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-5xl font-extrabold tracking-tighter text-primary">{minutes}</span>
            <span className="text-2xl font-bold text-primary">분</span>
            {distanceMeters > 0 && (
              <span className="ml-2 text-sm text-ink-500 font-bold">· {formatDistance(distanceMeters)}</span>
            )}
          </div>
          <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold mt-1', WALK_CHIP[walk.id])}>
            {walk.emoji} {walk.name} · 교통약자 유형 맞춤
          </span>
          <div className="mt-4 space-y-2 text-sm">
            <Feature>
              {route?.source === 'tmap' && '걷는 구간은 실제 한국 보행자 도로를 기준으로 안내'}
              {route?.source === 'osrm-foot' && '걷는 구간은 실제 보행 경로를 기준으로 안내'}
              {route?.source === 'kakao-driving' && '큰길 기준으로 이동 흐름을 먼저 확인'}
              {(!route || route.source === 'straight' || route.source === 'client-straight') && '현재 위치와 목적지를 기준으로 이동 흐름 예상'}
            </Feature>
            <Feature>도보와 대중교통을 한 흐름으로 보고 이동 부담이 낮은 길을 우선 안내</Feature>
            <Feature>쉴 곳 {restCount}곳 · 화장실 {toiletCount}곳을 경로 위에서 확인</Feature>
            {(elevCount > 0 || rampCount > 0 || accessibleCount > 0) && (
              <Feature>
                {[
                  elevCount > 0 && `엘리베이터 ${elevCount}곳`,
                  rampCount > 0 && `경사로 ${rampCount}곳`,
                  accessibleCount > 0 && `장애인 편의시설 ${accessibleCount}곳`,
                ].filter(Boolean).join(' · ')}
              </Feature>
            )}
            <Feature>공공데이터와 사용자 제보를 함께 반영</Feature>
            <Feature>실시간 GPS와 음성으로 안내</Feature>
          </div>
        </div>
      </div>

      <div className="pt-2 pb-6 flex-shrink-0">
        <Button size="xl" className="w-full" onClick={handleStart}>
          이 길로 갈게요
        </Button>
      </div>

      {selectedPoi && <PoiDetailCard poi={selectedPoi} onClose={() => setSelectedPoi(null)} />}
    </div>
  )
}

function Feature({ children }) {
  return (
    <div className="flex items-start gap-2 text-ink-700">
      <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" strokeWidth={2.5} />
      <span>{children}</span>
    </div>
  )
}

function MoveChip({ Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 border border-ink-200 px-2.5 py-1 text-xs font-bold text-ink-700 flex-shrink-0">
      <Icon className="w-3.5 h-3.5 text-primary" />
      {children}
    </span>
  )
}

function RouteSignal({ Icon, value, label, tone }) {
  const tones = {
    primary: 'bg-primary-50 text-primary',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning',
  }
  return (
    <div className="bg-white border border-ink-200 rounded-xl p-3 min-h-[92px] shadow-sm">
      <div className={cn('w-9 h-9 rounded-lg grid place-items-center mb-2 border border-current/10', tones[tone])}>
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div className="text-lg font-extrabold text-ink-900 leading-none">{value}</div>
      <div className="text-[11px] font-bold text-ink-500 mt-1.5">{label}</div>
    </div>
  )
}

function RouteField({ dot, placeholder, value, strong, onChange, onFocus, onBlur, onClear, suggestions, onPick }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <div className={cn('w-[14px] h-[14px] rounded-full flex-shrink-0', dot)} />
        <input
          type="text"
          className={cn(
            'flex-1 min-h-[48px] px-3 bg-ink-50 rounded-lg text-base font-medium border border-ink-200 focus:outline-none focus:border-primary placeholder:text-ink-400',
            strong && 'font-bold'
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          enterKeyHint="search"
        />
        {value && (
          <button
            type="button"
            aria-label="지우기"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClear}
            className="absolute right-2.5 w-8 h-8 rounded-md grid place-items-center text-ink-400 hover:bg-ink-100"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-30 left-7 right-0 top-[52px] bg-white border border-ink-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={`${s.name}-${s.lat}-${i}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(s)}
              className="flex flex-col px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-ink-50 last:border-b-0"
            >
              <b className="text-[15px] font-bold">{s.name}</b>
              {s.address && <span className="text-xs text-ink-500 mt-0.5">{s.address}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
