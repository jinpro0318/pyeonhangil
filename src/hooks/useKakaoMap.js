import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 편한길 카카오맵 훅
 * - SDK 동적 로드 (싱글톤)
 * - 지도 생성 + 내 위치 + POI 마커 관리
 * - 에러를 사용자 친화 메시지로 변환
 */

let sdkPromise = null

function loadKakaoSDK() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('브라우저 환경이 아니에요'))
  }
  if (window.kakao?.maps?.LatLng) {
    return Promise.resolve(window.kakao)
  }
  if (sdkPromise) return sdkPromise

  const key = import.meta.env.VITE_KAKAO_JS_KEY

  if (!key || key.includes('여기에') || key === 'undefined') {
    return Promise.reject(
      new Error(
        '카카오 JavaScript 키가 설정되지 않았어요. ' +
          '로컬은 .env, 배포는 Vercel 환경변수에 VITE_KAKAO_JS_KEY를 등록해주세요.'
      )
    )
  }

  sdkPromise = new Promise((resolve, reject) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''

    // 도메인 미등록을 빠르게 감지: 카카오는 JSON 에러를 응답하므로
    // 사전에 fetch로 한 번 확인하고, 정상이면 SDK 스크립트를 로드한다.
    fetch(`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`)
      .then((res) => res.text())
      .then((body) => {
        if (body.includes('AccessDeniedError') || body.includes('domain mismatched')) {
          sdkPromise = null
          reject(
            new Error(
              `카카오 콘솔에 현재 도메인이 등록되어 있지 않아요.\n` +
                `→ developers.kakao.com → 내 앱 → 앱 설정 → 플랫폼 → Web 에 다음을 등록해주세요:\n` +
                `${origin}`
            )
          )
          return
        }
        if (body.includes('errorType')) {
          sdkPromise = null
          reject(new Error(`카카오 SDK 응답 오류: ${body.slice(0, 200)}`))
          return
        }

        const script = document.createElement('script')
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`
        script.async = true
        script.onload = () => {
          if (!window.kakao || !window.kakao.maps) {
            sdkPromise = null
            reject(new Error('카카오맵 SDK 초기화에 실패했어요.'))
            return
          }
          window.kakao.maps.load(() => resolve(window.kakao))
        }
        script.onerror = () => {
          sdkPromise = null
          reject(new Error('카카오맵 SDK 파일을 불러오지 못했어요. 광고 차단기를 확인해주세요.'))
        }
        document.head.appendChild(script)
      })
      .catch((e) => {
        sdkPromise = null
        reject(new Error(`카카오 서버에 연결할 수 없어요: ${e.message}`))
      })

    // 안전망: 10초 내 응답 없으면 에러
    setTimeout(() => {
      if (!window.kakao?.maps?.LatLng) {
        sdkPromise = null
        reject(new Error('카카오맵 응답이 너무 오래 걸려요. 새로고침해주세요.'))
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
}

const MARKER_ICONS = {
  rest: '🪑',
  cross: '🚸',
  toilet: '🚻',
  elev: '🛗',
  ramp: '📐',
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
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
      <span>${escapeHtml(poi.name)}</span>
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
    myLocation = null,
  } = options

  const mapRef = useRef(null)
  const myLocOverlayRef = useRef(null)
  const poiOverlaysRef = useRef([])

  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

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
            content: createMyLocationContent(),
            xAnchor: 0.5,
            yAnchor: 0.5,
            zIndex: 10,
          })
          overlay.setMap(mapInstance)
          myLocOverlayRef.current = overlay
        }

        setIsReady(true)
      })
      .catch((e) => {
        if (cancelled) return
        console.error('[KakaoMap]', e)
        setError(e.message)
      })

    return () => {
      cancelled = true
      if (myLocOverlayRef.current) myLocOverlayRef.current.setMap(null)
      poiOverlaysRef.current.forEach((o) => o.setMap(null))
      poiOverlaysRef.current = []
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

    pois.forEach((poi) => {
      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(poi.lat, poi.lng),
        content: createMarkerContent(poi),
        xAnchor: 0.5,
        yAnchor: 0.5,
      })
      overlay.setMap(map)
      poiOverlaysRef.current.push(overlay)
    })
  }, [pois, isReady])

  // 내 위치 이동
  useEffect(() => {
    if (!isReady || !myLocation || !window.kakao) return
    const map = mapRef.current
    const pos = new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng)
    if (myLocOverlayRef.current) myLocOverlayRef.current.setPosition(pos)
    map.setCenter(pos)
  }, [myLocation, isReady])

  const setCenter = useCallback((lat, lng) => {
    const map = mapRef.current
    if (!map || !window.kakao) return
    map.setCenter(new window.kakao.maps.LatLng(lat, lng))
  }, [])

  const relayout = useCallback(() => {
    mapRef.current?.relayout()
  }, [])

  return { map: mapRef.current, isReady, error, setCenter, relayout }
}
