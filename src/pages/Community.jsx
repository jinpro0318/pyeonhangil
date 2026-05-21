import { useEffect, useRef, useState } from 'react'
import {
  Database, Plus, ThumbsUp, Trash2, MapPin, AlertTriangle,
} from 'lucide-react'
import { useGPS } from '../hooks/useGPS'
import { useKakaoMap } from '../hooks/useKakaoMap'
import {
  REPORT_TYPES, addReport, agreeReport, getActiveReports, removeReport, reportToPoi,
} from '../services/reportsStore'
import TabBar from '../components/TabBar'
import { Button } from '../components/ui/button'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '../components/ui/sheet'
import { cn } from '@/lib/utils'

function formatAgo(ts) {
  const diff = Math.max(0, Date.now() - ts)
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

export default function Community() {
  const mapRef = useRef(null)
  const { position, start } = useGPS({ enableStayDetection: false })

  const [reports, setReports] = useState(getActiveReports())
  const [showForm, setShowForm] = useState(false)
  const [pickedLocation, setPickedLocation] = useState(null)
  const [form, setForm] = useState({ type: 'construction', description: '' })

  useEffect(() => { start() }, [start])

  const refresh = () => setReports(getActiveReports())

  const { isReady, error } = useKakaoMap(mapRef, {
    pois: reports.map(reportToPoi),
    center: position, myLocation: position, level: 5,
  })

  const handleSubmit = () => {
    const loc = pickedLocation || position
    if (!loc?.lat) { alert('위치를 확인할 수 없어요. GPS를 켜주세요.'); return }
    addReport({
      lat: loc.lat, lng: loc.lng,
      type: form.type, description: form.description,
    })
    setShowForm(false); setPickedLocation(null)
    setForm({ type: 'construction', description: '' })
    refresh()
  }

  const handleDelete = (id) => {
    if (!confirm('이 제보를 삭제할까요?')) return
    removeReport(id); refresh()
  }
  const handleAgree = (id) => { agreeReport(id); refresh() }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden relative bg-background">
        <div className="min-h-[64px] pl-[64px] pr-5 flex flex-col justify-center">
          <h2 className="text-xl font-extrabold tracking-normal">커뮤니티 제보</h2>
          <p className="text-xs text-ink-500 font-semibold mt-0.5">
            현장 제보로 길 정보를 채워요
          </p>
        </div>

        <div className="px-5 mt-2 flex-shrink-0">
          <div className="bg-white border border-success-50 rounded-xl p-3.5 flex items-start gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-success-50 text-success-600 grid place-items-center flex-shrink-0 border border-success-50">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-ink-900">제보는 다음 경로 추천에 반영돼요</div>
              <div className="text-xs text-ink-500 font-semibold mt-1 leading-relaxed break-keep">
                공사, 계단, 막힌 인도처럼 데이터에 늦게 잡히는 정보를 사용자 참여로 보완합니다.
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 mt-3 mb-3 flex-shrink-0">
          <div ref={mapRef} className="h-44 bg-ink-50 rounded-xl relative overflow-hidden border border-ink-200 shadow-sm">
            {!isReady && !error && (
              <div className="absolute inset-0 grid place-items-center text-sm text-ink-500 font-semibold">
                🗺️ 지도 불러오는 중…
              </div>
            )}
            {error && (
              <div className="absolute inset-0 grid place-items-center text-sm text-ink-500 font-semibold">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24 space-y-2.5">
          {reports.length === 0 ? (
            <div className="py-10 flex flex-col items-center text-center text-ink-500">
              <AlertTriangle className="w-12 h-12 mb-3 opacity-50" />
              <div className="text-[17px] font-bold text-ink-700 mb-1">아직 제보가 없어요</div>
              <div className="text-sm leading-relaxed">
                길에서 본 공사·계단·장애물을 아래 버튼으로 공유해 주세요
              </div>
            </div>
          ) : (
            reports.map((r) => {
              const meta = REPORT_TYPES[r.type] || REPORT_TYPES.other
              return (
                <div key={r.id} className="flex gap-3 p-4 bg-white border border-ink-200 rounded-xl shadow-sm">
                  <div
                    className="w-11 h-11 rounded-lg grid place-items-center text-xl flex-shrink-0 border border-current/10"
                    style={{ background: meta.color + '22', color: meta.color }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold">{meta.label}</div>
                    {r.description && (
                      <div className="text-sm text-ink-700 mt-0.5 leading-relaxed">{r.description}</div>
                    )}
                    <div className="text-xs text-ink-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {r.lat.toFixed(4)}, {r.lng.toFixed(4)} · {formatAgo(r.timestamp)}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAgree(r.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold bg-ink-50 border border-ink-200 px-3 py-1.5 rounded-full text-ink-700 hover:bg-primary-50 hover:text-primary"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> 동의 {r.agrees > 0 ? r.agrees : ''}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-ink-400 px-3 py-1.5 rounded-full hover:bg-ink-100 hover:text-danger"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 삭제
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <button
          onClick={() => setShowForm(true)}
          aria-label="새 제보 작성"
          className="fixed bottom-[88px] right-4 w-14 h-14 bg-primary text-white rounded-2xl shadow-primary z-[50] grid place-items-center active:scale-95 hover:bg-primary-600 transition-all"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>

        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>길 제보하기</SheetTitle>
            </SheetHeader>

            <div className="text-sm font-bold text-ink-700 mb-2">어떤 상황인가요?</div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Object.entries(REPORT_TYPES).map(([key, meta]) => {
                const active = form.type === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: key }))}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all',
                      active ? 'bg-primary-50 border-primary' : 'bg-ink-50 border-transparent'
                    )}
                    style={active ? { borderColor: meta.color, background: meta.color + '15' } : {}}
                  >
                    <div className="text-2xl">{meta.emoji}</div>
                    <div className="text-xs font-bold">{meta.label}</div>
                  </button>
                )
              })}
            </div>

            <div className="text-sm font-bold text-ink-700 mb-2">설명 (선택)</div>
            <textarea
              placeholder="예) 북쪽 인도에 펜스로 막혀 있어요"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              maxLength={200}
              rows={3}
              className="w-full p-3.5 bg-ink-50 rounded-lg text-base font-medium border border-ink-200 focus:outline-none focus:border-primary placeholder:text-ink-400 resize-none mb-4"
            />

            <div className="text-sm font-bold text-ink-700 mb-2">위치</div>
            <div className="flex items-center gap-2 p-3 bg-ink-50 rounded-lg text-sm font-semibold text-ink-700 mb-4 tabular-nums border border-ink-200">
              {pickedLocation ? (
                <>
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="flex-1">{pickedLocation.lat.toFixed(4)}, {pickedLocation.lng.toFixed(4)}</span>
                  <button
                    onClick={() => setPickedLocation(null)}
                    className="text-xs font-bold text-primary"
                  >
                    초기화
                  </button>
                </>
              ) : position?.lat ? (
                <>
                  <MapPin className="w-4 h-4 text-success" />
                  <span>현재 위치: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
                </>
              ) : (
                <span className="text-warning">⚠️ GPS 위치 확인 중…</span>
              )}
            </div>

            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <Button variant="secondary" onClick={() => setShowForm(false)}>취소</Button>
              <Button onClick={handleSubmit}>제보 등록</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <TabBar />
    </>
  )
}
