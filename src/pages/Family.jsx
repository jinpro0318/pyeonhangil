import { useState } from 'react'
import { Check, Clock, LifeBuoy, Link as LinkIcon, X as XIcon, UserPlus, UsersRound, MessageCircle } from 'lucide-react'
import { useAppState } from '../hooks/useAppState'
import TabBar from '../components/TabBar'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { shareInviteKakao } from '@/lib/kakaoShare'
import { cn } from '@/lib/utils'
import { IconBadge } from '@/lib/catalog'

const RELATIONS = ['딸', '아들', '배우자', '형제', '자매', '친구', '기타']

function makeInviteLink(token) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pyeonhangil.app'
  return `${origin}/?invite=${token}`
}

function makeToken() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function formatAge(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const day = Math.floor(diff / 86400000)
  if (day === 0) return '오늘'
  if (day === 1) return '어제'
  return `${day}일 전`
}

export default function Family() {
  const { state, addFamily, updateFamily, removeFamily } = useAppState()
  const [showInvite, setShowInvite] = useState(false)
  const [draft, setDraft] = useState({ name: '', relation: '딸' })
  const [lastLink, setLastLink] = useState(null)

  const handleInvite = () => {
    const name = draft.name.trim()
    if (!name) { alert('이름을 입력해주세요'); return }
    const token = makeToken()
    addFamily({
      name, relation: draft.relation,
      status: 'pending', inviteToken: token, invitedAt: Date.now(),
    })
    setLastLink({ name, link: makeInviteLink(token) })
    setDraft({ name: '', relation: '딸' })
    setShowInvite(false)
  }

  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link)
      alert('초대 링크를 복사했어요. 가족에게 보내주세요')
    } catch {
      prompt('링크를 복사해서 가족에게 보내주세요', link)
    }
  }

  const sendKakao = async () => {
    if (!lastLink) return
    try {
      await shareInviteKakao({
        link: lastLink.link,
        inviteeName: lastLink.name,
        inviterName: state.user?.name,
      })
    } catch {
      await copyLink(lastLink.link)
      alert('카카오톡 공유는 실제 배포 환경(카카오 키·도메인 등록)에서 동작해요.\n우선 링크를 복사했어요.')
    }
  }

  const handleRemove = (id, name) => {
    if (confirm(`${name}님을 가족에서 삭제할까요?`)) removeFamily(id)
  }
  const toggleSOS = (id, current) => updateFamily(id, { receiveSOS: !current })

  const family = state.family

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="min-h-[64px] px-[22px] flex items-center">
          <h2 className="text-2xl font-extrabold tracking-normal">우리 가족</h2>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 space-y-3">
          <div className="bg-white border border-primary-100 text-ink-900 rounded-xl p-5 flex gap-3.5 items-center shadow-sm">
            <div className="w-[52px] h-[52px] bg-primary-50 text-primary rounded-lg grid place-items-center flex-shrink-0 border border-primary-100">
              <Check className="w-7 h-7" strokeWidth={3} />
            </div>
            <div>
              <div className="text-sm text-primary font-semibold">안심 공유</div>
              <div className="text-[17px] font-extrabold mt-0.5">
                연결된 가족에게 자동으로 알려드려요
              </div>
            </div>
          </div>

          {showInvite && (
            <div className="bg-white border border-ink-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div>
                <div className="text-sm font-bold text-ink-700 mb-2">이름</div>
                <Input
                  placeholder="예: 김민수"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div>
                <div className="text-sm font-bold text-ink-700 mb-2">관계</div>
                <div className="flex flex-wrap gap-2">
                  {RELATIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setDraft({ ...draft, relation: r })}
                      className={cn(
                        'px-3.5 py-2.5 rounded-full text-sm font-bold border min-h-[40px]',
                        draft.relation === r
                          ? 'bg-primary-50 border-primary text-primary-700'
                          : 'bg-white border-ink-200 text-ink-700'
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-[1fr_2fr] gap-2 pt-1">
                <Button
                  variant="secondary"
                  onClick={() => { setShowInvite(false); setDraft({ name: '', relation: '딸' }) }}
                >
                  취소
                </Button>
                <Button onClick={handleInvite}>
                  <UserPlus className="w-4 h-4" /> 초대 링크 만들기
                </Button>
              </div>
            </div>
          )}

          <div className="text-[13px] font-bold text-ink-500 mt-3 px-1">
            내 가족 ({family.length}명)
          </div>

          {family.length === 0 && (
            <div className="py-10 flex flex-col items-center text-center text-ink-500">
              <IconBadge Icon={UsersRound} tone="primary" size="2xl" className="mb-3 opacity-90" />
              <div className="text-[17px] font-bold text-ink-700 mb-1">아직 연결된 가족이 없어요</div>
              <div className="text-sm leading-relaxed">
                가족을 초대하면 외출·도착·SOS 때<br />자동으로 알림이 가요
              </div>
            </div>
          )}

          {family.map((f) => {
            const connected = f.status === 'connected'
            return (
              <div
                key={f.id}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl min-h-[76px] border shadow-sm',
                  connected ? 'bg-white border-ink-200' : 'bg-warning-50 border-warning/20'
                )}
              >
                <div
                  className={cn(
                    'w-11 h-11 rounded-lg grid place-items-center font-bold flex-shrink-0 border border-current/10',
                    connected ? 'bg-success-50 text-success-600' : 'bg-white text-warning'
                  )}
                >
                  {f.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[17px] font-bold truncate">
                    {f.relation ? `${f.relation} ${f.name}` : f.name}
                  </div>
                  <div
                    className={cn(
                      'text-sm font-bold mt-0.5 flex items-center gap-1',
                      connected ? 'text-success-600' : 'text-warning'
                    )}
                  >
                    {connected ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> 연결됨 · {f.receiveSOS ? '모든 알림' : 'SOS 끔'}
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" /> 초대 대기 · {formatAge(f.invitedAt)}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {connected && (
                    <button
                      onClick={() => toggleSOS(f.id, f.receiveSOS)}
                      aria-label="SOS 알림 토글"
                      className={cn(
                        'w-9 h-9 rounded-lg grid place-items-center',
                        f.receiveSOS ? 'bg-danger-50 text-danger' : 'opacity-40'
                      )}
                    >
                      <LifeBuoy className="w-4 h-4" />
                    </button>
                  )}
                  {!connected && f.inviteToken && (
                    <button
                      onClick={() => setLastLink({ name: f.name, link: makeInviteLink(f.inviteToken) })}
                      aria-label="초대 링크 다시 보내기"
                      className="w-9 h-9 rounded-lg grid place-items-center text-primary hover:bg-primary-50"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(f.id, f.name)}
                    aria-label="가족 삭제"
                    className="w-9 h-9 rounded-lg grid place-items-center text-ink-400 hover:bg-ink-200 hover:text-danger"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {!showInvite && (
            <Button
              variant="secondary"
              size="lg"
              className="w-full mt-3"
              onClick={() => setShowInvite(true)}
            >
              <UserPlus className="w-5 h-5" /> 가족 초대하기
            </Button>
          )}
        </div>
      </div>

      {/* 초대 링크 공유 팝업 — 링크 복사 / 카카오톡 전송 */}
      <Dialog open={!!lastLink} onOpenChange={(open) => { if (!open) setLastLink(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>초대 링크 보내기</DialogTitle>
            <DialogDescription>
              {lastLink?.name ? `${lastLink.name}님께 ` : ''}아래 링크를 보내고, 수락하면 가족으로 연결돼요.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-ink-50 border border-ink-200 p-3 rounded-xl text-[13px] break-all text-ink-700 font-mono select-all">
            {lastLink?.link}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => lastLink && copyLink(lastLink.link)}>
              <LinkIcon className="w-4 h-4" /> 링크 복사
            </Button>
            <Button
              onClick={sendKakao}
              className="bg-[#FEE500] text-[#191600] hover:bg-[#F2D900] shadow-none"
            >
              <MessageCircle className="w-4 h-4" /> 카카오톡
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TabBar />
    </>
  )
}
