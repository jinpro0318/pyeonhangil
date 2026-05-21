<!-- 모두의창업 신청서 / 예비창업패키지 표준 / v1.0 / 작성일 2026-05-13 -->
<!-- 본 문서는 docs/application/ 전용. 루트 README.md와 별개 트랙. -->

# 99. 부록 (Appendix)

> 본문에 인용된 기술·데이터·법령의 검증용 상세 자료.

---

## 1. 기술 스택 상세표

### 1.1 프론트엔드
| 카테고리 | 라이브러리 | 버전 | 역할 |
|---------|------------|------|------|
| 프레임워크 | react | 18.3.1 | UI 렌더링 |
| 프레임워크 | react-dom | 18.3.1 | DOM 마운트 |
| 라우팅 | react-router-dom | 6.26.2 | SPA 라우팅 (14 페이지) |
| 빌드 | vite | 5.4.1 | 번들링·HMR |
| 빌드 | @vitejs/plugin-react | 4.3.1 | React 플러그인 |

### 1.2 외부 SDK / API
| 항목 | 출처 | 무료 한도 |
|------|------|----------|
| Kakao Maps JavaScript SDK | dapi.kakao.com | 일 10만 호출 |
| Kakao Local REST | dapi.kakao.com | 월 500만 호출 |
| Kakao Mobility Directions | apis-navi.kakaomobility.com | 유료 (자동차 길찾기) |
| Tmap Pedestrian | apis.openapi.sk.com | 월 500만 호출 |
| OSRM Foot | router.project-osrm.org | 무료 (데모 서버) |
| data.go.kr / ODCloud | api.odcloud.kr | 무료 (활용신청) |

### 1.3 브라우저 표준 API
- Geolocation API (`navigator.geolocation.watchPosition`)
- Web Speech API (`SpeechSynthesisUtterance`, `SpeechRecognition`)
- Notification API
- localStorage

### 1.4 배포·인프라
- **Vercel** Serverless Functions (Node 18)
- **Vercel Edge Cache** (Cache-Control, stale-while-revalidate)
- **Vercel Cron** (Phase 2 자동 갱신용)

---

## 2. 데이터 출처 정리표

| 데이터셋 | 출처 | 갱신 | 라이선스 | 사용 위치 |
|---------|------|------|---------|-----------|
| Kakao Maps | Kakao | 실시간 | Kakao 개발자 약관 | `useKakaoMap.js` |
| Kakao Local | Kakao | 실시간 | Kakao REST 약관 | `api/local.js` |
| Tmap Pedestrian | SK텔레콤 | 실시간 | Tmap 약관 | `api/route.js` |
| OSRM Foot | OSM 커뮤니티 | OSM 갱신 주기 | ODbL | `api/route.js` |
| 전국무더위쉼터표준데이터 | 행안부 (data.go.kr 15013199) | 분기 | 공공누리 1유형 | `api/govdata.js` |
| 전국공중화장실표준데이터 | 행안부 (15012892) | 분기 | 공공누리 1유형 | `api/govdata.js` |
| 전국장애인편의시설표준데이터 | 보건복지부 (15100058) | 반기 | 공공누리 1유형 | `api/govdata.js` |
| 서울 지하철 엘리베이터 | 서울교통공사·자체 수집 | 비정기 | 공공 | `public/data/subway_elevators.geojson` |
| 서울 장수의자 | 자치구청·자체 수집 | 비정기 | 공공 | `public/data/jangsu_chairs.geojson` |
| 서울 무더위쉼터 | data.go.kr·자체 수집 | 여름철 | 공공누리 1유형 | `public/data/heat_shelters_seoul.geojson` |

---

## 3. API 엔드포인트 일람

### `/api/route` (`api/route.js:1-191`)
- 도보 경로 4단 폴백
- 입력: `start={lng,lat}&end={lng,lat}&mode=walk|car`
- 응답: `{ coords, distance, duration, source }`
- 캐시: `s-maxage=120, stale-while-revalidate=300`

### `/api/local` (`api/local.js:1-128`)
- Kakao Local 프록시 (서버 키 사용)
- 입력: `x, y, radius, type (rest|toilet|elev|...)` 또는 `query`
- 응답: 정규화된 POI 배열
- 캐시: `s-maxage=300, stale-while-revalidate=600`

### `/api/govdata` (`api/govdata.js:1-204`)
- data.go.kr 3종 통합 + 24h 모듈 캐시
- 입력: `bbox={minLat,maxLat,minLng,maxLng}&types=[...]`
- 응답: 정규화 POI 배열
- 캐시: 24h (5000건 일괄 다운로드)

### `/api/place` (`api/place.js:1-101`)
- Kakao 비공식 장소 상세 (실패해도 graceful)
- 입력: `placeId`
- 응답: hours·accessibility·photos·rating·menus
- 캐시: `s-maxage=600, stale-while-revalidate=3600`

---

## 4. 파일 구조 트리

```
/Users/admin/Desktop/pyeonhangil/
├── README.md                          ← 개발자 가이드 (신청서와 별개 트랙)
├── package.json
├── vite.config.js                     ← Kakao key 폴백 (vite.config.js:12-22)
├── vercel.json                        ← SPA 라우팅
├── index.html
├── .env.example
│
├── src/
│   ├── main.jsx
│   ├── App.jsx                        ← 14 페이지 라우팅 (1-60)
│   ├── hooks/
│   │   ├── useAppState.jsx            ← 걸음 4종 (22-55)
│   │   ├── useVoice.js                ← TTS (1-67)
│   │   ├── useGPS.js                  ← 체류 감지 (70-92)
│   │   ├── useSpeechRecognition.js    ← STT (1-73)
│   │   └── useKakaoMap.js             ← 지도·마커 (70-155)
│   ├── pages/                         ← 14개 페이지
│   ├── components/
│   │   ├── TabBar.jsx
│   │   ├── SOSButton.jsx
│   │   └── PoiDetailCard.jsx
│   ├── services/
│   │   ├── routeApi.js
│   │   ├── poiApi.js                  ← 3계층 통합 (138-184)
│   │   ├── placeApi.js
│   │   └── reportsStore.js            ← 커뮤니티 (1-88)
│   ├── utils/geo.js                   ← haversine·bbox (1-88)
│   ├── data/pois.js
│   └── styles/global.css
│
├── api/                               ← Vercel Serverless
│   ├── route.js                       ← 4단 폴백 (40-124)
│   ├── local.js                       ← Kakao Local (26-43 매핑)
│   ├── govdata.js                     ← data.go.kr (133-150 캐시)
│   └── place.js                       ← 카카오 장소 상세
│
├── public/
│   ├── pyeonhangil_icon_clean_edge_20260521.png
│   └── data/                          ← GeoJSON 시드
│       ├── subway_elevators.geojson
│       ├── jangsu_chairs.geojson
│       └── heat_shelters_seoul.geojson
│
└── docs/                              ← 본 신청서 폴더
    └── application/
        ├── 00_INDEX.md
        ├── 01_OVERVIEW.md
        ├── 02_PROBLEM.md
        ├── 03_SOLUTION.md
        ├── 04_MARKET.md
        ├── 05_BUSINESS_MODEL.md
        ├── 06_ROADMAP.md              ★
        ├── 07_SOCIAL_IMPACT.md
        ├── 08_TEAM_BUDGET.md
        └── 99_APPENDIX.md
```

---

## 5. 마커 아이콘·색상 매핑표 (`src/hooks/useKakaoMap.js:70-155`)

| 타입 | 이모지 | 색상(HEX) | 용도 | 데이터 출처 |
|------|--------|-----------|------|------------|
| rest | 🪑 | #22C55E | 쉼터·장수의자·무더위쉼터 | GeoJSON + Kakao + govdata |
| toilet | 🚻 | #3182F6 | 공중화장실·장애인화장실 | Kakao + govdata |
| elev | 🛗 | #A855F7 | 지하철 엘리베이터 | GeoJSON |
| cross | 🚸 | #F04452 | 안전 횡단보도·무장애 시설 | Kakao + govdata |
| ramp | 📐 | #F59E0B | 경사로 | (향후) |
| hospital | 🏥 | #EF4444 | 병원 | Kakao 카테고리 HP8 |
| pharmacy | 💊 | #06B6D4 | 약국 | Kakao 카테고리 PM9 |
| subway | 🚇 | #0EA5E9 | 지하철역 | Kakao 카테고리 SW8 |
| public | 🏛️ | #6366F1 | 공공기관 | Kakao 카테고리 PO3 |
| start | 🟢 | #22C55E | 출발지 (teardrop) | 사용자 입력 |
| end | 🏁 | #3182F6 | 도착지 (teardrop) | 사용자 입력 |
| report | ⚠️ | #F97316 | 커뮤니티 제보 | localStorage |

---

## 6. 참고 법령·정책

### 6.1 법령
- **교통약자의 이동편의 증진법** (2005 제정, 최근 개정)
- **장애인·노인 등을 위한 보조기기 지원 및 활용촉진에 관한 법률**
- **개인정보 보호법**
- **위치정보의 보호 및 이용 등에 관한 법률**

### 6.2 정책·인증
- 행안부 **무장애 생활환경 인증제도 (BF 인증)**
- 서울시 **'보행친화도시 서울' 비전 2030**
- 보건복지부 **장애인 이동권 보장 강화 계획**
- 국토부 **교통약자 이동편의 증진 5개년 계획**

### 6.3 표준·가이드라인
- **WCAG 2.2 (Web Content Accessibility Guidelines)**
- **KS X 6019 (모바일 앱 접근성 지침)**
- **공공누리 (Open Data Korea License)** — data.go.kr 데이터 라이선스

---

## 7. 신청서 트랙 vs 개발 트랙 차이 안내

| 구분 | 신청서 트랙 | 개발 트랙 |
|------|------------|-----------|
| 위치 | `docs/application/` (이 폴더) | `README.md`, `src/`, `api/`, `public/` |
| 독자 | 심사위원·투자자·파트너 | 개발자·기여자 |
| 갱신 | 챌린지 양식·전략 변경 시 | 기능 추가·버그 수정 시 |
| 영향 범위 | 본 폴더 내 10개 파일만 | 코드 빌드·배포 |
| 버전 관리 | 파일 상단 헤더 메타 (v1.0 / 2026-05-13) | git 커밋 |

> **두 트랙은 서로 침범하지 않습니다.** 신청서 양식이 변경되더라도 코드/README는 무수정. 코드가 발전해도 신청서는 별도 검토 후 갱신.

---

## 8. 인용 코드 색인 (마스터 표)

| # | 주장 | 코드 위치 |
|---|------|-----------|
| C1 | 14페이지 SPA | `src/App.jsx:1-60` |
| C2 | 걸음 4종 상태 | `src/hooks/useAppState.jsx:22-55` |
| C3 | 체류 자동 감지 (10m·3분) | `src/hooks/useGPS.js:70-92` |
| C4 | TTS 큐 한국어 안내 | `src/hooks/useVoice.js:1-67` |
| C5 | STT 음성 검색 | `src/hooks/useSpeechRecognition.js:1-73` |
| C6 | 12종 마커 + 폴리라인 | `src/hooks/useKakaoMap.js:70-155` |
| C7 | 도보 경로 4단 폴백 | `api/route.js:40-124` |
| C8 | 3계층 POI 통합 | `src/services/poiApi.js:138-184` |
| C9 | Kakao Local 매핑 | `api/local.js:26-43` |
| C10 | 정부 데이터 24h 캐시 | `api/govdata.js:133-150` |
| C11 | 50m 경로 필터 | `src/pages/RouteSuggest.jsx:150-164` |
| C12 | 커뮤니티 6종·72h | `src/services/reportsStore.js:1-88` |
| C13 | 거리·bbox 유틸 | `src/utils/geo.js:1-88` |
| C14 | API 보안·환경변수 | `vite.config.js:12-22` |

---

## 9. 처음으로 돌아가기

- [00_INDEX](./00_INDEX.md) — 신청서 목차
- [06_ROADMAP](./06_ROADMAP.md) ★ — 수정 사항 통합
