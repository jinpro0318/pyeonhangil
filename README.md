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
- Kakao Maps JavaScript SDK (지도)
- Kakao Local REST API (POI 검색) — Vercel Serverless Function 프록시
- Tmap Pedestrian API (도보 경로) — 선택, 미설정 시 카카오 자동차 길찾기로 폴백
- Web Speech API (TTS · STT)
- Geolocation API
- 정적 GeoJSON (서울 지하철 엘리베이터, 장수의자, 무더위쉼터)

## 🗺 지도 위 표시 항목

| 마커 | 출처 | 갱신 |
|---|---|---|
| 🚻 화장실 / 장애인화장실 | 카카오 로컬 키워드 | 실시간 |
| 🪑 무더위쉼터 / 장수의자 | 카카오 로컬 + 정적 GeoJSON (`/public/data`) | 시드 + 실시간 |
| 🛗 지하철 엘리베이터 | 정적 GeoJSON (서울교통공사 OA-21212 발췌) | 수동 |
| 🚸 안전 횡단보도 | 정적 샘플 (통합 공개 API 부재) | 수동 |

POI 데이터 갱신은 `/public/data/*.geojson` 파일 직접 편집 후 푸시.

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
Vercel 대시보드 → 프로젝트 → **Settings → Environment Variables**

| Name | Value | 용도 |
|---|---|---|
| `VITE_KAKAO_JS_KEY` | 카카오 JavaScript 키 | 지도 SDK (클라) |
| `KAKAO_REST_API_KEY` | 카카오 REST API 키 | 로컬 검색 + 길찾기 (서버) |
| `TMAP_APP_KEY` | (선택) Tmap 앱 키 | 보행자 경로 (서버) |

⚠️ `KAKAO_REST_API_KEY`는 **`VITE_` 접두사 없이** 등록 — 서버 함수에서만 쓰고 클라에 노출되지 않게.

저장 후 **Deployments → 최신 배포 → ⋯ → Redeploy** 로 재배포.

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
