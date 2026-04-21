import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 편한길 카카오맵 훅
 * - SDK 동적 로드 (싱글톤)
 * - 지도 + 내 위치 + POI 마커 + 폴리라인(경로) 관리
 * - 마커 클릭 콜백 + 자동 bounds fitting
 */

let sdkPromise = null

function loadKakaoSDK() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('브라우저 환경이 아니에요'))
  }
  if (window.kakao?.maps?.LatLng) return Promise.resolve(window.kakao)
  if (sdkPromise) return sdkPromise

  const key = import.meta.env.VITE_KAKAO_JS_KEY
  if (!key || key.includes('여기에') || key === 'undefined') {
    return Promise.reject(
      new Error(
        '카카오 JavaScript 키가 설정되지 않았어요. .env 또는 Vercel 환경변수에 VITE_KAKAO_JS_KEY를 등록해주세요.'
      )
    )
  }

  sdkPromise = new Promise((resolve, reject) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    let settled = false
    const finish = (fn, payload) => {
      if (settled) return
      settled = true
      fn(payload)
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`
    script.async = true
    script.onload = () => {
      if (!window.kakao || !window.kakao.maps) {
        sdkPromise = null
        finish(reject, new Error(
          `카카오 콘솔에 도메인이 등록되지 않았거나 SDK 초기화 실패.\n` +
            `→ developers.kakao.com → 앱 설정 → 플랫폼 → Web 에 등록: ${origin}`
        ))
        return
      }
      window.kakao.maps.load(() => finish(resolve, window.kakao))
    }
    script.onerror = () => {
      sdkPromise = null
      finish(reject, new Error('카카오맵 SDK 로드 실패. 광고차단 또는 네트워크 확인.'))
    }
    document.head.appendChild(script)

    setTimeout(() => {
      if (!window.kakao?.maps?.LatLng) {
        sdkPromise = null
        finish(reject, new Error(
          `카카오맵 응답 지연. 도메인 등록을 확인해주세요: ${origin}`
        ))
      }
    }, 10000)
  })

  return sdkPromise
}

const MARKER_COLORS = {
  rest: '#22C55E',
  cross: '#F04452',
  toilet: '#3182F6',
  elev: '#A855F7',
  ramp: '#F59E0B',
  start: '#22C55E',
  end: '#3182F6',
}
const MARKER_ICONS = {
  rest: '🪑',
  cross: '🚸',
  toilet: '🚻',
  elev: '🛗',
  ramp: '📐',
  start: '🟢',
  end: '🏁',
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

function poiMarkerHtml(poi) {
  const color = MARKER_COLORS[poi.type] || '#3182F6'
  const icon = MARKER_ICONS[poi.type] || '📍'
  return `
    <div data-poi-id="${escapeHtml(poi.id)}" style="
      display:flex; align-items:center; gap:5px;
      background:${color}; color:white;
      padding:6px 11px; border-radius:100px;
      font-size:12px; font-weight:700;
      box-shadow:0 2px 8px rgba(0,0,0,0.15);
      white-space:nowrap;
      font-family:Pretendard,-apple-system,sans-serif;
      letter-spacing:-0.02em; cursor:pointer;
      border:2px solid white;
    ">
      <span style="font-size:14px;">${icon}</span>
      <span>${escapeHtml(poi.name)}</span>
    </div>
  `
}

function myLocationHtml() {
  return `
    <div style="position:relative;">
      <div style="
        width:22px; height:22px;
        background:#3182F6; border:4px solid white;
        border-radius:50%;
        box-shadow:0 0 0 6px rgba(49,130,246,0.25);
      "></div>
    </div>
  `
}

export function useKakaoMap(containerRef, options = {}) {
  const {
    center = { lat: 37.5704, lng: 126.9927 },
    level = 3,
    pois = [],
    polylines = [],
    showMyLocation = true,
    draggable = true,
    myLocation = null,
    onPoiClick = null,
    fitBoundsOnPolyline = true,
  } = options

  const mapRef = useRef(null)
  const myLocOverlayRef = useRef(null)
  const poiOverlaysRef = useRef([])
  const polylineRefs = useRef([])
  const onPoiClickRef = useRef(onPoiClick)
  const poiByIdRef = useRef(new Map())

  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  // 콜백은 ref로 추적 (재렌더링 시 마커 재생성 방지)
  useEffect(() => {
    onPoiClickRef.current = onPoiClick
  }, [onPoiClick])

  // 지도 1회 생성
  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    loadKakaoSDK()
      .then((kakao) => {
        if (cancelled || !containerRef.current) return

        const mapInstance = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level,
          draggable,
        })
        mapRef.current = mapInstance

        if (showMyLocation) {
          const overlay = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(center.lat, center.lng),
            content: myLocationHtml(),
            xAnchor: 0.5,
            yAnchor: 0.5,
            zIndex: 10,
          })
          overlay.setMap(mapInstance)
          myLocOverlayRef.current = overlay
        }

        // 컨테이너 이벤트 위임 — 마커 클릭
        const handler = (e) => {
          const target = e.target.closest('[data-poi-id]')
          if (!target) return
          const id = target.getAttribute('data-poi-id')
          const poi = poiByIdRef.current.get(id)
          if (poi && onPoiClickRef.current) onPoiClickRef.current(poi)
        }
        containerRef.current.addEventListener('click', handler)
        // cleanup용
        mapInstance.__clickHandler = handler

        setIsReady(true)
      })
      .catch((e) => {
        if (cancelled) return
        console.error('[KakaoMap]', e)
        setError(e.message)
      })

    return () => {
      cancelled = true
      const node = containerRef.current
      const handler = mapRef.current?.__clickHandler
      if (node && handler) node.removeEventListener('click', handler)
      if (myLocOverlayRef.current) myLocOverlayRef.current.setMap(null)
      poiOverlaysRef.current.forEach((o) => o.setMap(null))
      polylineRefs.current.forEach((p) => p.setMap(null))
      poiOverlaysRef.current = []
      polylineRefs.current = []
      poiByIdRef.current = new Map()
      myLocOverlayRef.current = null
      mapRef.current = null
      setIsReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // POI 마커 동기화
  useEffect(() => {
    const map = mapRef.current
    if (!map || !window.kakao) return

    poiOverlaysRef.current.forEach((o) => o.setMap(null))
    poiOverlaysRef.current = []
    poiByIdRef.current = new Map()

    pois.forEach((poi) => {
      poiByIdRef.current.set(poi.id, poi)
      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(poi.lat, poi.lng),
        content: poiMarkerHtml(poi),
        xAnchor: 0.5,
        yAnchor: 0.5,
      })
      overlay.setMap(map)
      poiOverlaysRef.current.push(overlay)
    })
  }, [pois, isReady])

  // 폴리라인(경로) 동기화
  useEffect(() => {
    const map = mapRef.current
    if (!map || !window.kakao) return

    polylineRefs.current.forEach((p) => p.setMap(null))
    polylineRefs.current = []

    if (!polylines || polylines.length === 0) return

    polylines.forEach((line) => {
      if (!line.path || line.path.length < 2) return
      const path = line.path.map((p) => new window.kakao.maps.LatLng(p.lat, p.lng))
      const polyline = new window.kakao.maps.Polyline({
        path,
        strokeWeight: line.weight || 6,
        strokeColor: line.color || '#3182F6',
        strokeOpacity: line.opacity ?? 0.85,
        strokeStyle: line.style || 'solid',
      })
      polyline.setMap(map)
      polylineRefs.current.push(polyline)
    })

    // 경로 전체가 보이도록 자동 줌
    if (fitBoundsOnPolyline) {
      const bounds = new window.kakao.maps.LatLngBounds()
      polylines.forEach((line) =>
        line.path?.forEach((p) =>
          bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng))
        )
      )
      if (!bounds.isEmpty()) map.setBounds(bounds, 40, 40, 40, 40)
    }
  }, [polylines, isReady, fitBoundsOnPolyline])

  // 내 위치 이동 (지도 센터는 따라가지 않음 — 사용자 조작 보존)
  useEffect(() => {
    if (!isReady || !myLocation || !window.kakao) return
    if (myLocOverlayRef.current) {
      myLocOverlayRef.current.setPosition(
        new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng)
      )
    }
  }, [myLocation, isReady])

  const setCenter = useCallback((lat, lng) => {
    const map = mapRef.current
    if (!map || !window.kakao) return
    map.setCenter(new window.kakao.maps.LatLng(lat, lng))
  }, [])

  const setBounds = useCallback((coords, padding = 40) => {
    const map = mapRef.current
    if (!map || !window.kakao || !coords?.length) return
    const bounds = new window.kakao.maps.LatLngBounds()
    coords.forEach((p) => bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng)))
    map.setBounds(bounds, padding, padding, padding, padding)
  }, [])

  const relayout = useCallback(() => {
    mapRef.current?.relayout()
  }, [])

  return { map: mapRef.current, isReady, error, setCenter, setBounds, relayout }
}
