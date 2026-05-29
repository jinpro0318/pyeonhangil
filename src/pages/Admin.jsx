import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, BarChart3, CheckCircle2, Database, LogOut, MapPin,
  ShieldCheck, Trash2, UserRound,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { getActiveReports, removeReport, REPORT_TYPES } from '../services/reportsStore'
import { IconBadge, reportIcon, hazardIcon, TONES } from '@/lib/catalog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function formatAgo(ts) {
  const diff = Math.max(0, Date.now() - ts)
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

function envReady(key) {
  return Boolean(import.meta.env[key])
}

export default function Admin() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [reports, setReports] = useState(() => getActiveReports())
  const [serverStatus, setServerStatus] = useState(null)
  const reportSummary = useMemo(() => {
    return Object.entries(REPORT_TYPES).map(([type, meta]) => ({
      type,
      ...meta,
      count: reports.filter((r) => r.type === type).length,
    }))
  }, [reports])
  const topRisk = reportSummary.reduce((top, item) => (item.count > top.count ? item : top), { count: 0 })
  const staleReports = reports.filter((r) => Date.now() - r.timestamp > 48 * 3600 * 1000).length

  useEffect(() => {
    let cancelled = false
    fetch('/api/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (!cancelled) setServerStatus(data?.services || null) })
      .catch(() => { if (!cancelled) setServerStatus(null) })
    return () => { cancelled = true }
  }, [])

  const apiStatus = [
    { label: 'Kakao Maps', ready: serverStatus?.kakaoMaps ?? envReady('VITE_KAKAO_JS_KEY'), scope: '클라이언트' },
    { label: 'Firebase Auth', ready: serverStatus?.firebaseAuth ?? (envReady('VITE_FIREBASE_API_KEY') && envReady('VITE_FIREBASE_AUTH_DOMAIN')), scope: '클라이언트' },
    { label: 'Tmap 보행자 경로', ready: serverStatus?.tmap ?? false, scope: '서버' },
    { label: '공공데이터포털', ready: serverStatus?.dataGoKr ?? false, scope: '서버' },
  ]
  const readyApis = apiStatus.filter((s) => s.ready).length

  const handleRemoveReport = (report) => {
    if (!confirm('이 제보를 운영 목록에서 삭제할까요?')) return
    removeReport(report.id)
    setReports(getActiveReports())
    toast.success('제보를 삭제했어요')
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success('관리자 계정에서 로그아웃했어요')
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <PageHeader title="관리자" backTo="/home" />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-8">
        <div className="bg-primary text-white rounded-xl p-4 mb-4 shadow-primary">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-lg bg-white/10 grid place-items-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white/65 mb-1">ADMIN CONSOLE</div>
              <div className="text-lg font-extrabold">편한길 운영 관리</div>
              <div className="text-xs text-white/65 mt-1 truncate">{user?.email}</div>
            </div>
          </div>
        </div>

        <Button variant="secondary" className="w-full mb-4" onClick={() => navigate('/home')}>
          <UserRound className="w-4 h-4" /> 일반 사용자 화면으로 이동
        </Button>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatCard Icon={AlertTriangle} label="활성 길 제보" value={`${reports.length}건`} tone="warning" />
          <StatCard Icon={BarChart3} label="주요 위험 유형" value={topRisk.count ? topRisk.label : '없음'} tone="danger" />
          <StatCard Icon={Database} label="API 연결" value={`${readyApis}/${apiStatus.length}`} tone="primary" />
          <StatCard Icon={CheckCircle2} label="48시간 경과 제보" value={`${staleReports}건`} tone="success" />
        </div>

        <SectionTitle>위험 유형 분포</SectionTitle>
        <div className="bg-white border border-ink-200 rounded-xl p-4 shadow-sm mb-5">
          <div className="space-y-3">
            {reportSummary.map((item) => {
              const ic = hazardIcon(item.type)
              return (
              <div key={item.type}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 text-sm font-bold text-ink-700">
                    <IconBadge Icon={ic.Icon} tone={ic.tone} size="xs" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-xs font-extrabold text-ink-500">{item.count}건</span>
                </div>
                <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', (TONES[ic.tone] || TONES.primary).dot)}
                    style={{
                      width: `${reports.length ? Math.max(6, (item.count / reports.length) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
              )
            })}
          </div>
        </div>

        <SectionTitle>제보 검토 목록</SectionTitle>
        <div className="space-y-2.5 mb-5">
          {reports.length === 0 ? (
            <EmptyState text="검토할 활성 제보가 없습니다" />
          ) : reports.map((r) => {
            const meta = REPORT_TYPES[r.type] || REPORT_TYPES.other
            const ic = reportIcon(r.type, r.category || 'hazard')
            return (
              <div key={r.id} className="bg-white border border-ink-200 rounded-xl p-4 shadow-sm">
                <div className="flex gap-3">
                  <IconBadge Icon={ic.Icon} tone={ic.tone} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-extrabold text-ink-900">{meta.label}</div>
                      <button
                        onClick={() => handleRemoveReport(r)}
                        aria-label="제보 삭제"
                        className="w-8 h-8 rounded-md grid place-items-center text-ink-400 hover:bg-danger-50 hover:text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {r.description && (
                      <div className="text-sm text-ink-700 mt-1 leading-relaxed">{r.description}</div>
                    )}
                    <div className="text-xs text-ink-400 mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {r.lat.toFixed(4)}, {r.lng.toFixed(4)} · {formatAgo(r.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Button variant="secondary" className="w-full" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" /> 관리자 로그아웃
        </Button>
      </div>
    </div>
  )
}

function StatCard({ Icon, label, value, tone }) {
  return (
    <div className="bg-white border border-ink-200 rounded-xl p-4 shadow-sm">
      <IconBadge Icon={Icon} tone={tone} size="sm" className="mb-3" />
      <div className="text-xl font-extrabold text-ink-900 leading-tight break-keep">{value}</div>
      <div className="text-xs font-bold text-ink-500 mt-2">{label}</div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <div className="text-[13px] font-bold text-ink-500 mb-2 px-1">{children}</div>
}

function EmptyState({ text }) {
  return (
    <div className="bg-white border border-ink-200 rounded-xl p-6 text-center text-sm font-bold text-ink-400 shadow-sm">
      {text}
    </div>
  )
}
