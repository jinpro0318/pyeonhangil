/**
 * 카카오톡 공유 (Kakao JS SDK)
 * - 지도 SDK(dapi)와 별개인 카카오 JavaScript SDK 를 동적 로드 후 init
 * - 실제 배포 환경에서 VITE_KAKAO_JS_KEY + 카카오 콘솔 도메인/카카오톡공유 설정이 되어 있어야 동작
 * - 키 미설정/도메인 미등록/네트워크 실패 시 throw → 호출부에서 링크 복사로 폴백
 */

const SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'
let loadPromise = null

function loadKakaoSdk() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.Kakao) return Promise.resolve(window.Kakao)
  if (loadPromise) return loadPromise
  loadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SDK_URL
    s.async = true
    s.onload = () => (window.Kakao ? resolve(window.Kakao) : reject(new Error('Kakao SDK undefined')))
    s.onerror = () => { loadPromise = null; reject(new Error('Kakao SDK 로드 실패')) }
    document.head.appendChild(s)
  })
  return loadPromise
}

export function isKakaoShareConfigured() {
  const key = import.meta.env.VITE_KAKAO_JS_KEY
  return Boolean(key && !key.includes('여기에') && key !== 'undefined')
}

/** 카카오톡 친구에게 초대 링크 공유. 성공 시 resolve, 미설정/실패 시 reject. */
export async function shareInviteKakao({ link, inviteeName = '', inviterName = '' }) {
  if (!isKakaoShareConfigured()) throw new Error('KAKAO_KEY_MISSING')
  const Kakao = await loadKakaoSdk()
  if (!Kakao.isInitialized()) Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY)
  await Kakao.Share.sendDefault({
    objectType: 'text',
    text:
      `[편한길] ${inviteeName ? inviteeName + '님, ' : ''}` +
      `${inviterName ? inviterName + '님이 ' : ''}가족 안심 연결을 초대했어요.\n` +
      `링크로 수락하면 외출·도착·SOS 알림을 함께 받아요.`,
    link: { mobileWebUrl: link, webUrl: link },
    buttonTitle: '초대 수락하기',
  })
}
