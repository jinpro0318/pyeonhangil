# 편한길 · PyeonhanGil

> 🎙 듣고 📍 알아서 — 걸음이 불편한 분과 동행하는 가족을 위한 배리어프리 내비게이션

## ✨ 핵심 기능

- 🎙 **Voice-First** — 모든 안내 음성 동시 지원. 화면 안 봐도 귀로 다닐 수 있음
- 📍 **GPS 자동 감지** — 체류 3분 이상 자동 인식 → "쉬고 계시네요" 자동 전환
- 📊 **걸음 데이터 학습** — GPS 실시간 속도 측정으로 개인 맞춤 안내
- 👨‍👩‍👧 **가족 자동 공유** — 도착·쉼·위치 실시간 공유
- 🗺 **카카오맵 통합** — 정부 설치 시설 8종 한 지도
- 🚨 **긴급 SOS** — 119·가족·쉼터 3단계 도움 요청

## 🛠 기술 스택

- React 18 + Vite 5
- React Router 6
- Kakao Maps JavaScript SDK
- Web Speech API (TTS · STT)
- Geolocation API

## 🚀 로컬 실행

```bash
npm install
cp .env.example .env
# .env 파일 열어 카카오 JS 키 붙여넣기
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 카카오 JS 키 발급
1. https://developers.kakao.com 로그인 → 내 애플리케이션 → 추가
2. **앱 키 → JavaScript 키** 복사 → `.env`에 붙여넣기
3. **앱 설정 → 플랫폼 → Web 플랫폼 등록**
   - `http://localhost:3000`

---

## ☁️ Vercel 배포 (지도가 안 나올 때 체크리스트)

지도가 안 나오는 이유는 거의 다음 셋 중 하나입니다.

### ① Vercel 환경변수 등록
1. Vercel 대시보드 → 프로젝트 → **Settings → Environment Variables**
2. 아래 변수 추가
   - **Name**: `VITE_KAKAO_JS_KEY`
   - **Value**: 카카오에서 발급받은 JavaScript 키
   - **Environment**: Production / Preview / Development 모두 체크
3. 저장 후 **Deployments → 최신 배포 → ⋯ → Redeploy** 로 재배포 (환경변수는 빌드 시점에 주입되므로 반드시 재배포 필요)

### ② 카카오 개발자 콘솔에 Vercel 도메인 등록
카카오맵 SDK는 등록되지 않은 도메인에서는 작동하지 않습니다.

1. https://developers.kakao.com → 내 애플리케이션 → 해당 앱
2. **앱 설정 → 플랫폼 → Web 플랫폼 수정**
3. 사이트 도메인에 추가:
   - `https://your-project.vercel.app` (Vercel이 부여한 기본 도메인)
   - `https://your-project-*.vercel.app` (PR 프리뷰용, 와일드카드 지원)
   - 커스텀 도메인이 있다면 그것도 추가

### ③ SPA 라우팅
이 저장소에는 `vercel.json`이 포함되어 있어 `/home`, `/map` 등 직접 접근 시에도 새로고침 404가 나지 않습니다. 별도 설정 불필요.

### 빠른 진단
배포된 사이트 → 지도 화면(`/map`)으로 가면 카카오 SDK 로드 실패 시 화면에 **현재 도메인**과 함께 단계별 해결 방법이 안내됩니다.

---

## 🔒 보안 주의

- `.env` 는 절대 Git에 커밋 금지 (`.gitignore`에 포함됨)
- **이미 키가 GitHub에 노출됐다면 카카오 콘솔에서 키 재발급 필수**

## 📁 구조

```
src/
├── App.jsx              # 라우팅
├── main.jsx
├── styles/global.css
├── hooks/
│   ├── useAppState.jsx  # 전역 상태 (Context + LocalStorage)
│   ├── useVoice.js      # TTS 음성 안내
│   ├── useGPS.js        # GPS 추적 + 체류 감지
│   ├── useSpeechRecognition.js  # STT
│   └── useKakaoMap.js   # 카카오맵 SDK 래퍼
├── components/
│   ├── TabBar.jsx
│   └── SOSButton.jsx
├── data/pois.js         # POI 샘플
└── pages/               # 14개 화면
```

## 📝 라이선스

MIT
