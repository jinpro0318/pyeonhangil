import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Star } from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import PageHeader from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { FAVORITE_ICONS, favoriteIcon, IconBadge } from '@/lib/catalog'
import { cn } from '@/lib/utils'

async function searchKakaoPlaces(query) {
  if (!query) return []
  const params = new URLSearchParams({ query, x: '126.978', y: '37.566', radius: '20000' })
  try {
    const r = await fetch(`/api/local?${params.toString()}`)
    if (!r.ok) return []
    const data = await r.json()
    return (data.pois || []).map((p) => ({
      name: p.name, address: p.address || '', lat: p.lat, lng: p.lng,
    }))
  } catch { return [] }
}

export default function Favorites() {
  const navigate = useNavigate()
  const { state, addFavorite, updateFavorite, removeFavorite } = useAppState()
  const [showAdd, setShowAdd] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftAddr, setDraftAddr] = useState('')
  const [draftIcon, setDraftIcon] = useState('star')
  const [saving, setSaving] = useState(false)

  const canSave = draftName.trim() || draftAddr.trim()

  const handleSave = async () => {
    const name = draftName.trim()
    const address = draftAddr.trim()
    if (!name && !address) return
    setSaving(true)
    // 주소(없으면 이름)로 좌표를 찾아 길안내가 가능하도록 함
    let lat, lng
    try {
      const list = await searchKakaoPlaces(address || name)
      if (list[0]) { lat = list[0].lat; lng = list[0].lng }
    } finally {
      setSaving(false)
    }
    addFavorite({
      icon: draftIcon,
      name: name || address,
      address: address || name,
      lat,
      lng,
    })
    resetForm()
  }

  const resetForm = () => {
    setShowAdd(false); setDraftName(''); setDraftAddr(''); setDraftIcon('star')
  }

  const handleRemove = (id, name) => {
    if (confirm(`'${name}'을(를) 자주 가는 곳에서 삭제할까요?`)) removeFavorite(id)
  }
  const handleRename = (id, current) => {
    const v = prompt('이름을 바꿔주세요', current)
    if (v && v.trim()) updateFavorite(id, { name: v.trim() })
  }
  const handleIcon = (fav) => {
    const cur = favoriteIcon(fav)
    const idx = FAVORITE_ICONS.findIndex((o) => o.key === cur.key)
    const next = FAVORITE_ICONS[(idx + 1) % FAVORITE_ICONS.length]
    updateFavorite(fav.id, { icon: next.key })
  }
  const goRoute = (fav) => navigate('/route', { state: { destination: fav } })

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <PageHeader
        title="자주 가는 곳"
        action={!showAdd ? { label: '+ 추가', onClick: () => setShowAdd(true) } : null}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-8">
        {showAdd && (
          <div className="bg-ink-50 rounded-2xl p-4 space-y-4">
            <div>
              <div className="text-sm font-bold text-ink-700 mb-2">아이콘</div>
              <div className="grid grid-cols-6 gap-2">
                {FAVORITE_ICONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setDraftIcon(opt.key)}
                    aria-label={opt.label}
                    className={cn(
                      'h-11 rounded-xl bg-white grid place-items-center border-2 transition-all',
                      draftIcon === opt.key ? 'border-primary bg-primary-50' : 'border-transparent'
                    )}
                  >
                    <IconBadge Icon={opt.Icon} tone={opt.tone} size="sm" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-ink-700 mb-2">이름</div>
              <Input
                placeholder="예: 우리 동네 병원"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <div className="text-sm font-bold text-ink-700 mb-2">주소</div>
              <Input
                placeholder="예: 서울 종로구 대학로 101"
                value={draftAddr}
                onChange={(e) => setDraftAddr(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              disabled={saving || !canSave}
              onClick={handleSave}
            >
              {saving ? '저장 중...' : '저장'}
            </Button>
            <Button variant="secondary" className="w-full" onClick={resetForm}>
              취소
            </Button>
          </div>
        )}

        {!showAdd && (
          <>
            <div className="p-3.5 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 flex-shrink-0" />
              즐겨찾기는 홈 화면에서 한 번에 갈 수 있어요
            </div>

            {state.favorites.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center text-ink-500">
                <Star className="w-12 h-12 mb-3 opacity-50" />
                <div className="text-2xl font-extrabold text-ink-700 mb-1.5">등록된 곳이 없어요</div>
                <div className="text-sm leading-relaxed">
                  자주 가는 병원·집·마트 등을 등록하면<br />
                  홈에서 한 번에 갈 수 있어요
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {state.favorites.map((f) => {
                  const ic = favoriteIcon(f)
                  return (
                  <div key={f.id} className="flex items-center gap-2 p-2.5 bg-white border border-black/[0.04] rounded-2xl min-h-[72px] shadow-card">
                    <button
                      onClick={() => handleIcon(f)}
                      aria-label="이모지 변경"
                      className="w-12 h-12 rounded-2xl bg-ink-50 grid place-items-center flex-shrink-0 hover:bg-ink-100"
                    >
                      <IconBadge Icon={ic.Icon} tone={ic.tone} size="md" className="bg-transparent" />
                    </button>
                    <button
                      onClick={() => goRoute(f)}
                      className="flex-1 text-left min-w-0 px-1"
                    >
                      <div className="text-base font-bold truncate">{f.name}</div>
                      <div className="text-xs text-ink-500 truncate mt-0.5">{f.address}</div>
                    </button>
                    <button
                      onClick={() => handleRename(f.id, f.name)}
                      aria-label="이름 변경"
                      className="w-9 h-9 rounded-lg grid place-items-center text-ink-500 hover:bg-ink-200 flex-shrink-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(f.id, f.name)}
                      aria-label="삭제"
                      className="w-9 h-9 rounded-lg grid place-items-center text-ink-400 hover:bg-ink-200 hover:text-danger flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
