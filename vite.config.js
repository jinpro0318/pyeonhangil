import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 카카오 JavaScript 키는 "클라이언트 공개 키"로,
 * 보안은 카카오 콘솔의 Web 도메인 화이트리스트로 보장됩니다.
 * (https://developers.kakao.com 의 앱 설정 → 플랫폼 → Web)
 *
 * 그래서 Vercel 환경변수가 미설정이어도 동작하도록 폴백을 둡니다.
 * 키를 바꾸려면 .env 의 VITE_KAKAO_JS_KEY 또는 Vercel 환경변수를 우선 사용합니다.
 */
const KAKAO_JS_KEY_FALLBACK = 'df5e1dc0683b9992c2dd5aea25a9a6af'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const kakaoKey = env.VITE_KAKAO_JS_KEY || KAKAO_JS_KEY_FALLBACK

  return {
    plugins: [react()],
    base: '/',
    define: {
      'import.meta.env.VITE_KAKAO_JS_KEY': JSON.stringify(kakaoKey),
    },
    server: {
      port: 3000,
      open: true,
      host: true,
    },
    preview: {
      port: 3000,
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
    },
  }
})
