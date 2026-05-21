export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET only' })
    return
  }

  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({
    services: {
      kakaoMaps: Boolean(process.env.VITE_KAKAO_JS_KEY || process.env.KAKAO_JS_KEY),
      kakaoRest: Boolean(process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_REST_API_KEY),
      firebaseAuth: Boolean(process.env.VITE_FIREBASE_API_KEY && process.env.VITE_FIREBASE_AUTH_DOMAIN),
      tmap: Boolean(process.env.TMAP_APP_KEY),
      dataGoKr: Boolean(process.env.DATA_GO_KR_SERVICE_KEY),
    },
  })
}
