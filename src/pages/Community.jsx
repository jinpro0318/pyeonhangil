import { useEffect, useRef, useState } from 'react'
import {
  Armchair, Camera, Database, Plus,
  MapPin, AlertTriangle, TrafficCone, X as XIcon,
} from 'lucide-react'
import { useGPS } from '../hooks/useGPS'
import { useKakaoMap } from '../hooks/useKakaoMap'
import { useAuth } from '../hooks/useAuth'
import {
  HAZARD_TYPES, FACILITY_TYPES,
  addReport, getActiveReports, reportToPoi,
} from '../services/reportsStore'
import { uploadReportPhoto } from '../lib/uploadPhoto'
import TabBar from '../components/TabBar'
import { Button } from '../components/ui/button'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '../components/ui/sheet'
import { IconBadge, reportIcon } from '@/lib/catalog'
import { cn } from '@/lib/utils'

const CATEGORY_META = {
  hazard:   { label: '길 위험 제보',   color: 'warning', types: HAZARD_TYPES,   defaultType: 'construction' },
  facility: { label: '편의시설 알리기', color: 'success', types: FACILITY_TYPES, defaultType: 'rest' },
}

export default function Community() {
  const mapRef = useRef(null)
  const fileInputRef = useRef(null)
  const { position, start } = useGPS({ enableStayDetection: false })
  const { user } = useAuth()

  const [reports, setReports] = useState(getActiveReports())
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState('hazard')
  const [form, setForm] = useState({ type: 'construction', description: '' })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { start() }, [start])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  const refresh = () => setReports(getActiveReports())

  const { isReady, error } = useKakaoMap(mapRef, {
    pois: reports.map(reportToPoi),
    center: position, myLocation: position, level: 5,
  })

  const openSheet = (cat) => {
    setCategory(cat)
    setForm({ type: CATEGORY_META[cat].defaultType, description: '' })
    setPhotoFile(null)
    setPhotoPreview(null)
    setShowForm(true)
  }

  const closeSheet = () => {
    setShowForm(false)
    setPhotoFile(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
  }

  const handlePhotoPick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    const loc = position
    if (!loc?.lat) { setToast('GPS 위치를 확인할 수 없어요. 잠시 후 다시 시도해주세요.'); return }
    if (!photoFile) { setToast('사진을 먼저 촬영해주세요'); return }
    if (!user) { setToast('사진 업로드는 로그인 후 가능해요'); return }

    setUploading(true)
    try {
      const tempId = `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const photoUrl = await uploadReportPhoto(photoFile, tempId)
      addReport({
        lat: loc.lat,
        lng: loc.lng,
        type: form.type,
        category,
        description: form.description,
        photoUrl,
      })
      setToast(`${CATEGORY_META[category].label} 등록 완료`)
      closeSheet()
      refresh()
    } catch (e) {
      console.error(e)
      setToast(`업로드 실패: ${e.message || '잠시 후 다시 시도해주세요'}`)
    } finally {
      setUploading(false)
    }
  }

  const currentCategoryMeta = CATEGORY_META[category]
  const currentTypes = currentCategoryMeta.types

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden relative bg-white">
        <div className="min-h-[64px] px-5 flex flex-col justify-center">
          <h2 className="text-xl font-extrabold tracking-normal">커뮤니티</h2>
          <p className="text-xs text-ink-500 font-semibold mt-0.5">
            현장에서 찍은 사진으로 길 정보를 더해요
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24 space-y-4 mt-1">
          {/* 안내 — 상단 */}
          <div className="bg-white border border-success-50 rounded-xl p-3.5 flex items-start gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-success-50 text-success-600 grid place-items-center flex-shrink-0 border border-success-50">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-ink-900">제보는 즉시 지도에 반영돼요</div>
              <div className="text-xs text-ink-500 font-semibold mt-1 leading-relaxed break-keep">
                길 위험은 경로 추천 화면에서 경고로 표시되고, 편의시설은 모두의 지도에 마커로 추가됩니다.
              </div>
            </div>
          </div>

          {/* 실시간 제보 지도 — 중간 */}
          <div>
            <SectionLabel>실시간 제보 지도</SectionLabel>
            <div ref={mapRef} className="h-72 bg-ink-50 rounded-xl relative overflow-hidden border border-ink-200 shadow-sm">
              {!isReady && !error && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-ink-500 font-semibold">
                  <MapPin className="w-4 h-4" /> 지도 불러오는 중…
                </div>
              )}
              {error && (
                <div className="absolute inset-0 grid place-items-center text-sm text-ink-500 font-semibold">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* 제보하기 — 하단 */}
          <div>
            <SectionLabel>제보하기</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <ActionTile
                Icon={TrafficCone}
                tone="warning"
                title="길 위험 제보"
                desc="공사·계단·통행불가"
                onClick={() => openSheet('hazard')}
              />
              <ActionTile
                Icon={Armchair}
                tone="success"
                title="편의시설 알리기"
                desc="쉼터·화장실·엘리베이터"
                onClick={() => openSheet('facility')}
              />
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-[170px] z-[60] bg-ink-900 text-white text-sm font-bold px-4 py-2.5 rounded-full shadow-lg animate-fade-in">
            {toast}
          </div>
        )}

        {/* 제보 시트 */}
        <Sheet open={showForm} onOpenChange={(open) => (open ? setShowForm(true) : closeSheet())}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{currentCategoryMeta.label}</SheetTitle>
            </SheetHeader>

            {/* 사진 */}
            <div className="text-sm font-bold text-ink-700 mb-2">현장 사진 *</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoPick}
            />
            {photoPreview ? (
              <div className="relative mb-4 rounded-lg overflow-hidden border border-ink-200">
                <img src={photoPreview} alt="" className="w-full h-44 object-cover" />
                <button
                  onClick={() => {
                    if (photoPreview) URL.revokeObjectURL(photoPreview)
                    setPhotoFile(null); setPhotoPreview(null)
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-ink-900/70 text-white rounded-full grid place-items-center"
                  aria-label="사진 제거"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full mb-4 h-32 bg-ink-50 border-2 border-dashed border-ink-300 rounded-lg flex flex-col items-center justify-center gap-2 text-ink-500 hover:bg-ink-100 active:scale-[0.98]"
              >
                <Camera className="w-8 h-8" />
                <span className="text-sm font-bold">사진 촬영 / 선택</span>
              </button>
            )}

            {/* 유형 선택 */}
            <div className="text-sm font-bold text-ink-700 mb-2">유형 *</div>
            <div className={cn(
              'grid gap-2 mb-4',
              Object.keys(currentTypes).length > 4 ? 'grid-cols-3' : 'grid-cols-2',
            )}>
              {Object.entries(currentTypes).map(([key, meta]) => {
                const active = form.type === key
                const ic = reportIcon(key, category)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: key }))}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all',
                      active ? 'bg-primary-50 border-primary' : 'bg-ink-50 border-transparent'
                    )}
                  >
                    <IconBadge Icon={ic.Icon} tone={ic.tone} size="sm" variant={active ? 'solid' : 'soft'} />
                    <div className="text-xs font-bold">{meta.label}</div>
                  </button>
                )
              })}
            </div>

            {/* 설명 */}
            <div className="text-sm font-bold text-ink-700 mb-2">설명 (선택)</div>
            <textarea
              placeholder={category === 'hazard'
                ? '예) 북쪽 인도에 펜스로 막혀 있어요'
                : '예) 24시간 개방, 휠체어 진입 가능'}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              maxLength={200}
              rows={3}
              className="w-full p-3.5 bg-ink-50 rounded-lg text-base font-medium border border-ink-200 focus:outline-none focus:border-primary placeholder:text-ink-400 resize-none mb-4"
            />

            {/* 위치 — GPS 자동 */}
            <div className="text-sm font-bold text-ink-700 mb-2">위치 (GPS 자동)</div>
            <div className="flex items-center gap-2 p-3 bg-ink-50 rounded-lg text-sm font-semibold text-ink-700 mb-4 tabular-nums border border-ink-200">
              {position?.lat ? (
                <>
                  <MapPin className="w-4 h-4 text-success" />
                  <span>현재 위치: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-warning"><AlertTriangle className="w-4 h-4" /> GPS 위치 확인 중…</span>
              )}
            </div>

            {!user && (
              <div className="text-xs text-warning font-bold bg-warning-50 border border-warning/30 rounded-lg p-3 mb-3">
                사진 업로드는 로그인이 필요해요. 시트 닫고 우측 상단 로그인 버튼을 눌러주세요.
              </div>
            )}

            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <Button variant="secondary" onClick={closeSheet} disabled={uploading}>취소</Button>
              <Button onClick={handleSubmit} disabled={uploading || !photoFile || !position?.lat}>
                {uploading ? '업로드 중…' : '제보 등록'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <button
          onClick={() => openSheet('hazard')}
          aria-label="새 제보 작성"
          className="fixed bottom-[88px] right-4 w-14 h-14 bg-primary text-white rounded-full shadow-fab z-[50] grid place-items-center active:scale-95 hover:bg-primary-600 transition-all"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>
      <TabBar />
    </>
  )
}

function SectionLabel({ children, className }) {
  return (
    <div className={cn('text-[13px] font-bold text-ink-500 tracking-tight mb-2 px-1', className)}>
      {children}
    </div>
  )
}

function ActionTile({ Icon, tone, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white border border-ink-200 rounded-xl p-4 text-left active:scale-[0.98] transition-all hover:border-primary-200 hover:shadow-md min-h-[100px]"
    >
      <IconBadge Icon={Icon} tone={tone} size="sm" className="mb-2" />
      <div className="text-base font-bold text-ink-900">{title}</div>
      <div className="text-xs text-ink-500 font-semibold mt-0.5 leading-snug">{desc}</div>
    </button>
  )
}
