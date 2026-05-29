import { useState } from 'react'
import { Phone, Trash2, Plus } from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import PageHeader from '../components/PageHeader'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { cn } from '@/lib/utils'
import { IconBadge } from '@/lib/catalog'

const RELATIONS = ['딸', '아들', '배우자', '형제', '자매', '친구', '이웃', '기타']

function formatPhone(raw) {
  const v = (raw || '').replace(/\D/g, '')
  if (v.length < 4) return v
  if (v.length < 8) return `${v.slice(0, 3)}-${v.slice(3)}`
  if (v.length <= 11) return `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`
  return v
}

export default function EmergencyContacts() {
  const { state, addEmergencyContact, removeEmergencyContact } = useAppState()
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState({ name: '', relation: '딸', phone: '' })

  const handleSave = () => {
    const name = draft.name.trim()
    const phone = draft.phone.replace(/\D/g, '')
    if (!name || phone.length < 9) {
      alert('이름과 전화번호를 확인해주세요')
      return
    }
    addEmergencyContact({ name, relation: draft.relation, phone })
    setDraft({ name: '', relation: '딸', phone: '' })
    setShowForm(false)
  }

  const handleCall = (phone) => {
    if (confirm(`${formatPhone(phone)}에 전화 거시겠어요?`)) {
      window.location.href = `tel:${phone}`
    }
  }

  const handleRemove = (id, name) => {
    if (confirm(`${name}님을 긴급 연락처에서 삭제할까요?`)) {
      removeEmergencyContact(id)
    }
  }

  const contacts = state.emergencyContacts

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <PageHeader
        title="긴급 연락처"
        action={!showForm ? { label: '+ 추가', onClick: () => setShowForm(true) } : null}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-8">
        <div className="p-4 bg-danger-50 border border-danger/20 text-danger rounded-2xl text-sm font-semibold leading-relaxed mb-4">
          🆘 SOS 버튼을 누르면 첫 번째 연락처에게 자동으로 위치가 전송돼요
        </div>

        {showForm && (
          <div className="bg-white border border-black/[0.04] shadow-card rounded-2xl p-4 mb-4 space-y-3">
            <Field label="이름">
              <Input
                placeholder="예: 김영수"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </Field>
            <Field label="관계">
              <div className="flex flex-wrap gap-2">
                {RELATIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setDraft({ ...draft, relation: r })}
                    className={cn(
                      'px-3.5 py-2.5 rounded-full text-sm font-bold border-[1.5px] min-h-[40px]',
                      draft.relation === r
                        ? 'bg-primary-50 border-primary text-primary-700'
                        : 'bg-white border-ink-200 text-ink-700'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="전화번호">
              <Input
                inputMode="tel"
                placeholder="010-0000-0000"
                value={formatPhone(draft.phone)}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-[1fr_2fr] gap-2 pt-1">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false)
                  setDraft({ name: '', relation: '딸', phone: '' })
                }}
              >
                취소
              </Button>
              <Button onClick={handleSave}>저장</Button>
            </div>
          </div>
        )}

        {!showForm && contacts.length === 0 && (
          <div className="py-12 flex flex-col items-center text-center text-ink-500">
            <IconBadge Icon={Phone} tone="danger" size="2xl" className="mb-3 opacity-90" />
            <div className="text-[17px] font-bold text-ink-700 mb-1.5">등록된 연락처가 없어요</div>
            <div className="text-sm leading-relaxed">
              긴급 상황 때 빠르게 도움받을 수 있도록<br />
              가족이나 친구를 등록해주세요
            </div>
            <Button className="mt-5 max-w-[220px]" onClick={() => setShowForm(true)}>
              <Plus className="w-5 h-5" /> 연락처 추가하기
            </Button>
          </div>
        )}

        {!showForm && contacts.length > 0 && (
          <>
            <div className="text-[13px] font-bold text-ink-500 mb-2 px-1">내 긴급 연락처</div>
            <div className="space-y-2.5">
              {contacts.map((c, idx) => (
                <div key={c.id} className="flex items-center gap-3 p-3.5 bg-white border border-black/[0.04] shadow-card rounded-2xl min-h-[76px]">
                  <div className="w-9 h-9 rounded-full bg-primary text-white grid place-items-center font-bold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[17px] font-bold truncate">
                      {c.name} <span className="text-sm text-ink-500 font-medium">({c.relation})</span>
                    </div>
                    <div className="text-sm text-ink-500 mt-0.5 tabular-nums">{formatPhone(c.phone)}</div>
                  </div>
                  <button
                    onClick={() => handleCall(c.phone)}
                    aria-label="전화 걸기"
                    className="w-11 h-11 rounded-xl bg-success text-white grid place-items-center flex-shrink-0 active:scale-95"
                  >
                    <Phone className="w-[18px] h-[18px]" />
                  </button>
                  <button
                    onClick={() => handleRemove(c.id, c.name)}
                    aria-label="삭제"
                    className="w-9 h-9 rounded-lg grid place-items-center text-ink-400 hover:bg-ink-200 hover:text-danger flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-sm font-bold text-ink-700 mb-2">{label}</div>
      {children}
    </div>
  )
}
