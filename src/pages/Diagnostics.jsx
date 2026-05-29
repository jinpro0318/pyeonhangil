import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, CheckCircle2, XCircle, Loader2, AlertTriangle, RefreshCw, ExternalLink,
} from 'lucide-react'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { cn } from '@/lib/utils'

const STATUS = { OK: 'ok', FAIL: 'fail', LOADING: 'loading', WARN: 'warn' }

function Row({ status, label, detail, help }) {
  const tone = {
    [STATUS.OK]:      { Icon: CheckCircle2, color: 'text-success-600', bg: 'bg-success-50' },
    [STATUS.FAIL]:    { Icon: XCircle,      color: 'text-warning',     bg: 'bg-warning-50' },
    [STATUS.LOADING]: { Icon: Loader2,      color: 'text-ink-500',     bg: 'bg-ink-50' },
    [STATUS.WARN]:    { Icon: AlertTriangle, color: 'text-warning',    bg: 'bg-warning-50' },
  }[status]

  return (
    <div className={cn('rounded-xl p-4 border border-black/[0.04] shadow-card', tone.bg)}>
      <div className="flex items-start gap-3">
        <tone.Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', tone.color, status === STATUS.LOADING && 'animate-spin')} />
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-ink-900">{label}</div>
          {detail && <div className="text-xs text-ink-700 mt-0.5 font-semibold break-all">{detail}</div>}
          {help && status !== STATUS.OK && (
            <div className="text-xs text-ink-500 mt-1.5 leading-relaxed">{help}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Diagnostics() {
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const [tick, setTick] = useState(0)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const jsKey = import.meta.env.VITE_KAKAO_JS_KEY
  const jsKeyPresent = Boolean(jsKey) && !String(jsKey).includes('여기에') && jsKey !== 'undefined'

  // 1. 카카오 SDK 로드 + 지도 렌더 시도
  const { isReady: mapReady, error: mapError } = useKakaoMap(mapRef, {
    pois: [], center: { lat: 37.566, lng: 126.978 }, level: 5,
  })

  // 2. /api/status (서버 env 점검)
  const [serverStatus, setServerStatus] = useState({ state: STATUS.LOADING, data: null, error: null })
  useEffect(() => {
    let cancelled = false
    setServerStatus({ state: STATUS.LOADING })
    fetch('/api/status')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const data = await r.json()
        if (!cancelled) setServerStatus({ state: STATUS.OK, data })
      })
      .catch((e) => { if (!cancelled) setServerStatus({ state: STATUS.FAIL, error: e.message }) })
    return () => { cancelled = true }
  }, [tick])

  // 3. /api/local 실제 호출로 REST 키 검증
  const [restStatus, setRestStatus] = useState({ state: STATUS.LOADING, sample: null, error: null })
  useEffect(() => {
    let cancelled = false
    setRestStatus({ state: STATUS.LOADING })
    const params = new URLSearchParams({ query: '쉼터', x: '126.978', y: '37.566', radius: '1000' })
    fetch(`/api/local?${params.toString()}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (!r.ok) {
          throw new Error(data?.error || `HTTP ${r.status}`)
        }
        if (!cancelled) setRestStatus({ state: STATUS.OK, sample: data?.pois?.length || 0 })
      })
      .catch((e) => { if (!cancelled) setRestStatus({ state: STATUS.FAIL, error: String(e.message || e) }) })
    return () => { cancelled = true }
  }, [tick])

  // 4. /api/route 실제 호출로 경로 API 검증 (가벼운 폴백 포함이라 키 없어도 응답함)
  const [routeStatus, setRouteStatus] = useState({ state: STATUS.LOADING, source: null, error: null })
  useEffect(() => {
    let cancelled = false
    setRouteStatus({ state: STATUS.LOADING })
    fetch('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: { lat: 37.566, lng: 126.978 },
        destination: { lat: 37.5704, lng: 126.9927 },
        mode: 'walk',
      }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`)
        if (!cancelled) setRouteStatus({ state: STATUS.OK, source: data?.source || 'unknown' })
      })
      .catch((e) => { if (!cancelled) setRouteStatus({ state: STATUS.FAIL, error: String(e.message || e) }) })
    return () => { cancelled = true }
  }, [tick])

  // 종합 상태
  const sdkState = !jsKeyPresent
    ? STATUS.FAIL
    : mapError ? STATUS.FAIL
    : mapReady ? STATUS.OK
    : STATUS.LOADING

  const services = serverStatus.data?.services
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1')

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <div className="min-h-[64px] px-4 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로"
          className="w-11 h-11 rounded-xl bg-white border border-black/[0.04] grid place-items-center text-ink-700 active:scale-95 shadow-card"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-extrabold flex-1">API 연결 진단</h2>
        <button
          onClick={() => setTick((t) => t + 1)}
          aria-label="다시 확인"
          className="w-11 h-11 rounded-xl bg-white border border-black/[0.04] grid place-items-center text-primary active:scale-95 shadow-card"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 space-y-3">
        {/* 현재 환경 */}
        <div className="bg-white border border-black/[0.04] rounded-xl p-4 shadow-card">
          <div className="text-xs font-extrabold text-ink-500 uppercase tracking-wider mb-2">현재 환경</div>
          <div className="text-base font-bold text-ink-900 break-all">{origin || '(unknown)'}</div>
          <div className="text-xs text-ink-500 mt-1 font-semibold">
            {isLocalhost ? '로컬 개발 환경' : '배포 환경'} · 이 도메인이 카카오 콘솔 Web 플랫폼에 등록되어 있어야 합니다
          </div>
        </div>

        {/* 카카오 JS 키 */}
        <Row
          status={jsKeyPresent ? STATUS.OK : STATUS.FAIL}
          label="① VITE_KAKAO_JS_KEY (클라이언트 키)"
          detail={jsKeyPresent
            ? `${String(jsKey).slice(0, 6)}…${String(jsKey).slice(-4)} (${String(jsKey).length}자)`
            : '미설정 또는 placeholder'}
          help={`.env 파일에 VITE_KAKAO_JS_KEY=실제키 형태로 입력하고 dev 서버를 재시작하세요. developers.kakao.com → 내 앱 → JavaScript 키.`}
        />

        {/* 카카오 SDK 로드 + 지도 렌더 */}
        <Row
          status={sdkState}
          label="② 카카오맵 SDK 로드 + 지도 렌더"
          detail={mapError ? mapError : mapReady ? '지도 정상 렌더 (아래 미리보기 확인)' : '로드 중…'}
          help={mapError && (
            <>
              가장 흔한 원인: 카카오 콘솔에 이 도메인이 등록되지 않음.<br />
              developers.kakao.com → 앱 설정 → 플랫폼 → Web → <b className="font-bold">{origin}</b> 추가
            </>
          )}
        />

        {/* 미니 지도 미리보기 */}
        <div className="bg-white border border-black/[0.04] rounded-xl p-2 shadow-card">
          <div className="text-xs font-extrabold text-ink-500 uppercase tracking-wider px-2 pt-1 pb-2">지도 미리보기 (서울 시청 좌표)</div>
          <div ref={mapRef} className="h-44 bg-ink-50 rounded-lg relative overflow-hidden">
            {!mapReady && !mapError && (
              <div className="absolute inset-0 grid place-items-center text-xs text-ink-500 font-semibold">불러오는 중…</div>
            )}
            {mapError && (
              <div className="absolute inset-0 grid place-items-center text-xs text-warning font-semibold px-4 text-center break-keep">
                지도 로드 실패 — 위 ② 항목의 해결 방법 확인
              </div>
            )}
          </div>
        </div>

        {/* 서버 env 체크 */}
        <Row
          status={serverStatus.state === STATUS.OK ? STATUS.OK : serverStatus.state === STATUS.FAIL ? STATUS.FAIL : STATUS.LOADING}
          label="③ /api/status — 서버 환경변수"
          detail={serverStatus.error || (services && (
            <span className="font-mono text-[11px]">
              kakaoRest:{services.kakaoRest ? '✓' : '✗'} · tmap:{services.tmap ? '✓' : '✗'} · dataGoKr:{services.dataGoKr ? '✓' : '✗'} · firebase:{services.firebaseAuth ? '✓' : '✗'}
            </span>
          ))}
          help={serverStatus.error
            ? '/api/status 가 응답하지 않음. Vercel Serverless 함수가 동작하는지 확인하세요. 로컬에서는 vercel dev 또는 vite dev 가 함께 실행 중이어야 합니다.'
            : '✗ 표시된 키는 Vercel 환경변수 또는 .env.local 에 추가하세요.'}
        />

        {/* REST API 실호출 */}
        <Row
          status={restStatus.state}
          label="④ /api/local — Kakao REST API 실호출 테스트"
          detail={restStatus.state === STATUS.OK
            ? `정상 응답 — '쉼터' 검색 결과 ${restStatus.sample}건`
            : restStatus.error || '요청 중…'}
          help={restStatus.error && `KAKAO_REST_API_KEY 가 서버 환경변수에 등록되어 있는지 확인. .env.local 에 VITE_ 접두사 없이 KAKAO_REST_API_KEY=… 로 설정 후 dev 서버 재시작.`}
        />

        {/* Route API 실호출 */}
        <Row
          status={routeStatus.state}
          label="⑤ /api/route — 도보 경로 폴백 체인"
          detail={routeStatus.state === STATUS.OK
            ? `정상 응답 — source: ${routeStatus.source}`
            : routeStatus.error || '요청 중…'}
          help={routeStatus.state === STATUS.OK
            ? (routeStatus.source === 'straight' || routeStatus.source === 'client-straight')
              ? 'Tmap/OSRM/Kakao 모두 실패해 직선 폴백으로 응답. TMAP_APP_KEY 등록 권장.'
              : null
            : '/api/route 자체 호출 실패. 서버 함수가 동작하지 않을 가능성.'}
        />

        {/* 외부 링크 */}
        <div className="bg-white border border-black/[0.04] rounded-xl p-4 shadow-card">
          <div className="text-xs font-extrabold text-ink-500 uppercase tracking-wider mb-2">바로가기</div>
          <div className="grid grid-cols-1 gap-2">
            <a
              href="https://developers.kakao.com"
              target="_blank" rel="noreferrer"
              className="flex items-center justify-between gap-2 text-sm font-bold text-primary px-3.5 py-3 min-h-[48px] rounded-xl bg-primary-50 hover:bg-primary-100 active:scale-[0.99] transition-all"
            >
              카카오 개발자 콘솔 (도메인 등록 · JS키 발급)
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
            <a
              href="https://www.data.go.kr"
              target="_blank" rel="noreferrer"
              className="flex items-center justify-between gap-2 text-sm font-bold text-primary px-3.5 py-3 min-h-[48px] rounded-xl bg-primary-50 hover:bg-primary-100 active:scale-[0.99] transition-all"
            >
              data.go.kr (공공데이터 키 발급)
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
