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

POI 데이터 소스는 **3계층**으로 합쳐져 표시됩니다.

| 마커 | 1. 정적 GeoJSON | 2. 카카오 로컬 | 3. data.go.kr 공공데이터 |
|---|:-:|:-:|:-:|
| 🪑 쉼터 / 장수의자 | ✓ | ✓ ("무더위쉼터") | ✓ 무더위쉼터 표준데이터 (15013199) |
| 🚻 화장실 | | ✓ ("공중화장실", "장애인화장실") | ✓ 공중화장실 표준데이터 (15012892, 장애인 칸 보유분만) |
| 🛗 지하철 엘리베이터 | ✓ | | |
| 🚸 장애인 편의시설 | | | ✓ 장애인편의시설 표준데이터 (15100058) |

길 안내 화면(`/route`, `/navigation`)은 경로 폴리라인의 **bbox**(경계상자) 안에 들어오는 POI만 골라 표시합니다.

### 경로 주변 POI 동작
- 경로가 만들어지면 폴리라인의 좌표 bbox 계산 → `/api/govdata?type=...&minLat=...` 호출
- 정부 데이터는 첫 호출 시 ODCloud API 페이지네이션으로 5,000건까지 다운로드 → Vercel 함수 모듈 캐시(24h)
- 이후 호출은 캐시에서 bbox 필터만 수행 (수 ms)

POI 데이터 갱신은 `/public/data/*.geojson` 파일 직접 편집 후 푸시 (정적 부분), 또는 data.go.kr 데이터셋 자체 갱신을 기다림 (API 부분).

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
| `DATA_GO_KR_SERVICE_KEY` | (선택) data.go.kr 서비스 키 | 무더위쉼터/공중화장실/장애인편의시설 (서버) |

⚠️ `KAKAO_REST_API_KEY`, `DATA_GO_KR_SERVICE_KEY`는 **`VITE_` 접두사 없이** 등록 — 서버 함수에서만 쓰고 클라에 노출되지 않게.

### data.go.kr 서비스 키 발급 절차
1. https://www.data.go.kr 가입 → 로그인
2. 다음 데이터셋 각각 검색해서 **활용신청** (각각 1~2시간 후 승인 메일)
   - "전국무더위쉼터표준데이터" (ID 15013199)
   - "전국공중화장실표준데이터" (ID 15012892)
   - "전국장애인편의시설표준데이터" (ID 15100058)
3. 마이페이지 → 인증키 발급내역 → **일반 인증키 (Decoding)** 복사
4. Vercel 환경변수 `DATA_GO_KR_SERVICE_KEY` 에 등록 → Redeploy

키가 미설정이어도 정적 GeoJSON으로 폴백되어 앱은 정상 동작합니다.

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
