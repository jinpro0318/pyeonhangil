import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 편한길 카카오맵 훅
 * - SDK 동적 로드
 * - 지도 생성 및 POI 마커 관리
 */

let sdkPromise = null

function loadKakaoSDK(appKey) {
  if (sdkPromise) return sdkPromise
  if (typeof window !== 'undefined' && window.kakao?.maps) {
    return Promise.resolve(window.kakao)
  }

  sdkPromise = new Promise((resolve, reject) => {
    const key = appKey || window.KAKAO_JS_KEY || import.meta.env.VITE_KAKAO_JS_KEY
    if (!key || key.includes('여기에') || key === '%VITE_KAKAO_JS_KEY%') {
      reject(new Error('카카오 JavaScript 키가 설정되지 않았습니다. .env에 VITE_KAKAO_JS_KEY를 넣어주세요.'))
      return
    }
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`
    script.async = true
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao))
    }
    script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'))
    document.head.appendChild(script)
  })

  return sdkPromise
}

const MARKER_COLORS = {
  rest: '#22C55E',
  cross: '#F04452',
  toilet: '#3182F6',
  elev: '#A855F7',
  ramp: '#F59E0B',
}

const MARKER_ICONS = {
  rest: '🪑',
  cross: '🚸',
  toilet: '🚻',
  elev: '🛗',
  ramp: '📐',
}

function createMarkerContent(poi) {
  const color = MARKER_COLORS[poi.type] || '#3182F6'
  const icon = MARKER_ICONS[poi.type] || '📍'
  return `
    <div style="
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
      <span>${poi.name}</span>
    </div>
  `
}

function createMyLocationContent() {
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
    showMyLocation = true,
    draggable = true,
  } = options

  const [map, setMap] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const overlaysRef = useRef([])

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

        setMap(mapInstance)
        setIsReady(true)

        // 내 위치 마커
        if (showMyLocation) {
          const myLoc = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(center.lat, center.lng),
            content: createMyLocationContent(),
            xAnchor: 0.5,
            yAnchor: 0.5,
            zIndex: 10,
          })
          myLoc.setMap(mapInstance)
          overlaysRef.current.push(myLoc)
        }
      })
      .catch((e) => {
        console.error(e)
        setError(e.message)
      })

    return () => {
      cancelled = true
      overlaysRef.current.forEach((o) => o.setMap(null))
      overlaysRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // POI 마커 업데이트
  useEffect(() => {
    if (!map || !window.kakao) return

    // 기존 POI 마커 제거 (내 위치는 남김)
    overlaysRef.current.slice(1).forEach((o) => o.setMap(null))
    overlaysRef.current = overlaysRef.current.slice(0, 1)

    pois.forEach((poi) => {
      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(poi.lat, poi.lng),
        content: createMarkerContent(poi),
        xAnchor: 0.5,
        yAnchor: 0.5,
      })
      overlay.setMap(map)
      overlaysRef.current.push(overlay)
    })
  }, [map, pois])

  // 센터 업데이트
  const setCenter = useCallback(
    (lat, lng) => {
      if (!map || !window.kakao) return
      map.setCenter(new window.kakao.maps.LatLng(lat, lng))
    },
    [map]
  )

  return { map, isReady, error, setCenter }
}
