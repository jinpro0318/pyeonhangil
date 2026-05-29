import { useNavigate } from 'react-router-dom'
import { Phone, Users, Armchair, AlertTriangle } from 'lucide-react'
import { useAppState } from '../hooks/useAppState'

function formatPhone(raw) {
  const v = (raw || '').replace(/\D/g, '')
  if (v.length < 4) return v
  if (v.length < 8) return `${v.slice(0, 3)}-${v.slice(3)}`
  if (v.length <= 11) return `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`
  return v
}

export default function SOS() {
  const navigate = useNavigate()
  const { state } = useAppState()

  const primaryContact =
    state.emergencyContacts[0] ||
    state.family.find((f) => f.status === 'connected' && f.receiveSOS) ||
    null

  const call119 = () => {
    if (confirm('119에 전화하시겠어요?')) window.location.href = 'tel:119'
  }

  const callFamily = () => {
    if (!primaryContact) {
      alert('아직 등록된 긴급 연락처가 없어요. 내 정보 → 긴급 연락처에서 등록해주세요')
      navigate('/emergency')
      return
    }
    if (primaryContact.phone && /\d{9,}/.test(primaryContact.phone.replace(/\D/g, ''))) {
      if (confirm(`${primaryContact.name}님(${formatPhone(primaryContact.phone)})에게 전화하시겠어요?`)) {
        window.location.href = `tel:${primaryContact.phone}`
      }
    } else {
      alert(`${primaryContact.name}님에게 위치가 전송되었어요`)
      navigate(-1)
    }
  }

  const findRest = () => navigate('/map', { state: { filter: 'rest' } })

  const familyLabel = primaryContact
    ? `${primaryContact.name}${primaryContact.relation ? `(${primaryContact.relation})` : ''}${
        primaryContact.phone ? ` · ${formatPhone(primaryContact.phone)}` : ''
      }`
    : '등록된 연락처가 없어요 (눌러서 등록)'

  return (
    <div className="flex-1 bg-danger text-white flex flex-col px-5 pt-14 pb-6 gap-5">
      <div className="text-center">
        <div className="text-[15px] font-bold opacity-90 tracking-widest mb-1.5">긴급 도움</div>
        <h1 className="text-[30px] font-extrabold tracking-tighter leading-tight">
          어떤 도움이<br />필요하세요?
        </h1>
      </div>

      <div className="flex-1 flex flex-col gap-3 justify-center">
        <SosBtn
          Icon={Phone}
          tone="primary"
          title="119 구조 요청"
          sub="바로 전화 걸려요"
          onClick={call119}
        />
        <SosBtn
          Icon={Users}
          tone="outline"
          title="가족에게 연락"
          sub={familyLabel}
          onClick={callFamily}
        />
        <SosBtn
          Icon={Armchair}
          tone="outline"
          title="가장 가까운 쉼터"
          sub="지도에서 한눈에 보기"
          onClick={findRest}
        />
      </div>

      <div className="flex items-center justify-center gap-1.5 text-center text-sm opacity-85 font-semibold">
        {primaryContact ? (
          '가족이 지금 어디 계신지 알 수 있어요'
        ) : (
          <>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> 긴급 연락처를 먼저 등록해주세요
          </>
        )}
      </div>

      <button
        onClick={() => navigate(-1)}
        className="text-white/85 font-bold py-3.5 rounded-2xl border border-white/30 hover:bg-white/10 active:scale-[0.98] transition-all"
      >
        괜찮아요, 취소
      </button>
    </div>
  )
}

function SosBtn({ Icon, tone, title, sub, onClick }) {
  const base = 'w-full flex items-center gap-4 p-5 rounded-2xl text-left active:scale-[0.98] transition-all min-h-[84px]'
  const tones = {
    primary: 'bg-white text-ink-900 shadow-xl',
    outline: 'bg-white/15 border-2 border-white/40 text-white hover:bg-white/20',
  }
  return (
    <button onClick={onClick} className={`${base} ${tones[tone]}`}>
      <div className={`w-14 h-14 rounded-2xl grid place-items-center flex-shrink-0 ${tone === 'primary' ? 'bg-danger-50 text-danger' : 'bg-white/20'}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-lg font-extrabold tracking-tight">{title}</div>
        <div className={`text-sm mt-0.5 truncate ${tone === 'primary' ? 'text-ink-500' : 'opacity-85'}`}>
          {sub}
        </div>
      </div>
    </button>
  )
}
