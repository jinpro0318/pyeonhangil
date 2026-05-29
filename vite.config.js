import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 카카오 JavaScript 키는 "클라이언트 공개 키"이지만, 저장소가 Public 이므로
 * 폴백을 두지 않고 환경변수에서만 읽습니다. 도메인 화이트리스트로 보호되어도
 * 폐기된 키를 코드에 남겨두면 회전을 강제하기 어렵습니다.
 *
 * 로컬: .env.local 의 VITE_KAKAO_JS_KEY (또는 KAKAO_JS_KEY)
 * 배포: Vercel 환경변수의 VITE_KAKAO_JS_KEY
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const kakaoKey = env.VITE_KAKAO_JS_KEY || env.KAKAO_JS_KEY || ''
  if (!kakaoKey) {
    console.warn('[vite] VITE_KAKAO_JS_KEY 가 비어 있어요. 지도가 로드되지 않습니다.')
  }

  const localApiStatusPlugin = {
    name: 'local-api-status',
    configureServer(server) {
      server.middlewares.use('/api/status', (req, res, next) => {
        if (req.method !== 'GET') return next()
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          services: {
            kakaoMaps: Boolean(env.VITE_KAKAO_JS_KEY || env.KAKAO_JS_KEY || kakaoKey),
            kakaoRest: Boolean(env.KAKAO_REST_API_KEY || env.VITE_KAKAO_REST_API_KEY),
            firebaseAuth: Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_AUTH_DOMAIN),
            tmap: Boolean(env.TMAP_APP_KEY),
            dataGoKr: Boolean(env.DATA_GO_KR_SERVICE_KEY),
          },
        }))
      })
    },
  }

  return {
    plugins: [react(), localApiStatusPlugin],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
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
