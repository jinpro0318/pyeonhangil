<!-- 모두의창업 신청서 / 예비창업패키지 표준 / v1.0 / 작성일 2026-05-13 -->
<!-- 본 문서는 docs/application/ 전용. 루트 README.md와 별개 트랙. -->

# 03. 실현 가능성 (Solution)

> 예비창업패키지 양식 매핑: **실현 가능성 — 아이디어 차별성 / 기술 개발 방안 / 보유 자산**

---

## 1. 핵심 차별성 3가지

### ① Voice-First Navigation — 화면 없이도 이동
**개념**: STT(음성 인식) + TTS(음성 합성)를 양방향으로 결합해, 검색·경로 안내·도착 확인 전 과정을 음성만으로 수행.

| 구현 | 위치 | 동작 |
|------|------|------|
| TTS 큐 관리 | `src/hooks/useVoice.js:1-67` | 한국어 ko-KR, rate 0.95 (조금 천천히), 중단/큐 관리 |
| STT 음성 인식 | `src/hooks/useSpeechRecognition.js:1-73` | 음성 검색·명령 (continuous=false) |
| 음성 검색 | `src/pages/Search.jsx:74-88` | 자동 시작 → 첫 결과 자동 이동 |
| 음성 안내 | `src/pages/Navigation.jsx` | "도착지까지 N분 남았어요" 실시간 |
| 쉼터 안내 | `src/pages/Resting.jsx` | "쉬고 계시네요. 충분히 쉬시고..." |

**기술 선택 이유**: Web Speech API는 클라이언트 사이드 처리 → 서버 음성 처리 비용 ≈ 0. Chrome/Edge에서 안정 동작.

### ② 무장애 POI 3계층 통합
**개념**: 정적 GeoJSON + 실시간 Kakao + 정부 공공데이터를 하나의 API로 통합. 어떤 환경(오프라인/네트워크/지역)에서도 결과 보장.

```
┌────────────────────────────────────────────────────┐
│  poiApi.js (3계층 통합)                              │
│  ┌──────────────┬──────────────┬─────────────────┐ │
│  │  1. 정적      │  2. 실시간    │  3. 공공데이터    │ │
│  │  GeoJSON     │  Kakao Local │  data.go.kr     │ │
│  │  ─────────   │  ───────────  │  ──────────────  │ │
│  │  오프라인 ✓   │  최신 ✓       │  표준 데이터 ✓    │ │
│  │  즉시 응답    │  500만/월 무료│  5000건 캐시 24h │ │
│  │  서울 시드    │  카테고리 검색 │  전국 무더위쉼터  │ │
│  └──────────────┴──────────────┴─────────────────┘ │
│                       ↓                            │
│              중복 제거 (5m·동일 type)                │
│              거리순 정렬 / bbox 필터                  │
└────────────────────────────────────────────────────┘
```

| 계층 | 구현 | 데이터셋 |
|------|------|---------|
| 1. 정적 | `public/data/*.geojson` | 서울 지하철 엘리베이터·장수의자·무더위쉼터 |
| 2. 실시간 | `api/local.js:1-128` | Kakao Local 키워드·카테고리 검색 |
| 3. 공공 | `api/govdata.js:1-204` | ODCloud 3종 (무더위쉼터·공중화장실·장애인편의시설) |
| 통합 | `src/services/poiApi.js:138-184` | 두 모드 (center+radius / bbox) |

### ③ 자동 체류 감지 + 가족 SOS
**개념**: GPS 좌표 히스토리를 분석해 사용자가 멈췄을 때를 자동 감지 → 강제 입력 없이 쉼터 모드 전환·가족 알림.

| 기능 | 구현 | 임계값 |
|------|------|--------|
| 체류 감지 | `src/hooks/useGPS.js:70-92` | 10m 반경 내 3분 이상 |
| 속도 계산 | `src/hooks/useGPS.js:55-67` | 최근 3개 좌표 평균 |
| 쉼터 전환 | `src/pages/Resting.jsx` | isStaying=true 자동 라우팅 |
| 도착 감지 | `src/pages/Arrived.jsx` | 도착지 반경 자동 인식 |
| SOS 3단계 | `src/pages/SOS.jsx` | 119 / 가족 / 가까운 쉼터 |

---

## 2. 경쟁 기술 비교표

| 항목 | 카카오맵 | 네이버지도 | T맵 | **편한길** |
|------|:---:|:---:|:---:|:---:|
| 주 사용자 | 일반 운전자 | 일반 사용자 | 운전자/내비 | **보행 약자** |
| 도보 전용 경로 | △ | △ | ○ | **◎ (4단 폴백)** |
| 무장애 POI | △ | × | × | **◎ (3계층)** |
| 음성 양방향 | × | × | △ | **◎ (STT+TTS)** |
| 자동 체류 감지 | × | × | × | **◎** |
| 50m 경로 필터 | × | × | × | **◎** |
| 커뮤니티 제보 | × | × | × | **○ (72h)** |
| 걸음 상태 맞춤 | × | × | × | **◎ (4종)** |
| 무료/오픈 | ○ | ○ | ○ | **◎** |

> 무장애·음성·체류 감지·맞춤 안내의 **4축이 모두 결합된 서비스는 국내 최초**.

---

## 3. 기술 스택 (현재 운영 중)

### 3.1 프론트엔드
| 영역 | 기술 | 역할 |
|------|------|------|
| 프레임워크 | **React 18.3.1** | UI 렌더링 |
| 라우팅 | React Router DOM 6.26 | 14 페이지 SPA |
| 빌드 | **Vite 5.4** | 극저 빌드 시간 (<1초) |
| 상태 관리 | Context API + localStorage | 경량, 오프라인 작동 |
| 지도 | Kakao Maps SDK | 한국 최적화 |

### 3.2 브라우저 표준 API
- Geolocation API (GPS·속도)
- Web Speech API (TTS·STT)
- Notification API (푸시)
- localStorage (상태 영속화)

### 3.3 백엔드 (Serverless)
| API | 역할 | 파일 |
|-----|------|------|
| `/api/route` | 도보 경로 4단 폴백 | `api/route.js:1-191` |
| `/api/local` | Kakao Local 프록시 | `api/local.js:1-128` |
| `/api/govdata` | data.go.kr 통합 + 캐시 | `api/govdata.js:1-204` |
| `/api/place` | 카카오 장소 상세 | `api/place.js:1-101` |

### 3.4 외부 데이터 소스
- Kakao Maps + Kakao Local + Kakao Mobility Directions
- **OSRM** (Open Source Routing Machine) foot 프로파일
- **Tmap** Pedestrian API
- **data.go.kr / ODCloud** 표준 데이터 3종
- 서울교통공사 / 자치구청 무장애 정보

---

## 4. 도보 경로 탐색 — 4단 폴백 로직

`api/route.js:40-124` 의 우선순위 체인:

```
1순위: Tmap Pedestrian API
       ↓ (TMAP_APP_KEY 미설정 or 실패)
2순위: OSRM Foot 프로파일
       ↓ (네트워크 실패)
3순위: Kakao Mobility Directions (자동차 → 도보 속도 재계산)
       ↓ (실패)
4순위: 직선 폴백 + 중점 경유 (haversine 거리)
```

> 외부 API 장애 시에도 **항상 경로를 반환**하는 신뢰성 설계. 캐시 5분 TTL (`Cache-Control: s-maxage=120, stale-while-revalidate=300`).

---

## 5. MVP 14개 페이지 — 모두 동작 (`src/App.jsx:1-60`)

| 단계 | 페이지 | 한 줄 설명 |
|------|--------|------------|
| 온보딩 | Splash | 로고 1.8초 |
| 온보딩 | Intro | 2단계 가치 소개 |
| 온보딩 | Permissions | 위치·알림·음성 권한 |
| 온보딩 | WalkState | 걸음 상태 4종 선택 |
| 메인 | Home | 음성 검색·즐겨찾기·빠른 찾기 |
| 검색 | Search | 음성/텍스트 양방향 |
| 경로 | RouteSuggest | 이동수단·50m 필터·제보 표시 |
| 지도 | MapMain | 반경 1500m POI |
| 이동 | Navigation | 실시간 음성·체류 감지 |
| 상태 | Resting | 자동 쉼터 전환 |
| 상태 | Arrived | 도착 자동 감지 |
| 긴급 | SOS | 119·가족·쉼터 |
| 사회 | Community | 6종 제보·72h 유효 |
| 설정 | Family · MyInfo | 가족·프로필 |

---

## 6. API 보안 모델

| 키 | 노출 위치 | 보호 방식 |
|-----|----------|----------|
| `VITE_KAKAO_JS_KEY` | 클라이언트 | **도메인 화이트리스트** (Kakao 콘솔) |
| `KAKAO_REST_API_KEY` | 서버 only | Vercel 환경변수 |
| `TMAP_APP_KEY` | 서버 only | Vercel 환경변수 |
| `DATA_GO_KR_SERVICE_KEY` | 서버 only | Vercel 환경변수 |

> 모든 외부 호출은 `/api/*` Serverless Function을 통과 → 클라이언트에 비공개 키 노출 없음.

---

## 7. 기능별 코드 인용 색인 (심사 검증용)

| 기능 | 파일 | 라인 |
|------|------|------|
| 라우팅 | `src/App.jsx` | 1-60 |
| 전역 상태·걸음 4종 | `src/hooks/useAppState.jsx` | 22-55 |
| GPS·체류 감지 | `src/hooks/useGPS.js` | 1-137 (체류: 70-92) |
| TTS 음성 안내 | `src/hooks/useVoice.js` | 1-67 |
| STT 음성 인식 | `src/hooks/useSpeechRecognition.js` | 1-73 |
| 지도·마커·폴리라인 | `src/hooks/useKakaoMap.js` | 1-363 |
| 3계층 POI 통합 | `src/services/poiApi.js` | 138-184 |
| 도보 경로 폴백 | `api/route.js` | 40-124 |
| 공공데이터 캐시 | `api/govdata.js` | 23-77, 133-150 |
| 50m 필터 | `src/pages/RouteSuggest.jsx` | 150-164 |
| 커뮤니티 제보 | `src/services/reportsStore.js` | 1-88 |
| 거리·bbox 유틸 | `src/utils/geo.js` | 1-88 |

---

## 8. 실현 가능성 종합 평가

| 평가 항목 | 현재 상태 |
|-----------|-----------|
| **기술 동작 검증** | ✅ MVP 14페이지 모두 동작, Vercel 배포 운영 중 |
| **데이터 확보** | ✅ 서울 시드 + Kakao 500만/월 + data.go.kr 활용 |
| **확장성** | ✅ Serverless + 캐시 → 비용 선형 증가 |
| **차별성** | ✅ 4축 결합 국내 최초 |
| **개선 여지** | 🟡 사용자 인증·서버 동기화·접근성 보강 (06_ROADMAP 참조) |

> 다음: **앞으로 무엇을 더 만들 것인가** → [06_ROADMAP](./06_ROADMAP.md)
