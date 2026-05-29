# 편한길 · PyeonhanGil

> 🎙 **듣고 알아서** — 걸음이 불편한 분과 동행하는 가족을 위한 **배리어프리 이동(도보+대중교통) 내비게이션**

![status](https://img.shields.io/badge/status-MVP%20live-success)
![stack](https://img.shields.io/badge/stack-React%2018%20·%20Vite%205%20·%20Vercel-blue)
![pages](https://img.shields.io/badge/pages-20-informational)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

**고령자·휠체어·시각장애·유모차·부상자**를 위한 Voice-First 무장애 내비게이션. 버스·지하철 환승과 걷는 구간을 한 흐름으로 묶어 음성으로 안내받고, 쉼터·화장실·엘리베이터를 자동으로 찾아주며, 3분 이상 멈추면 가족에게 위치를 자동 공유합니다.

---

## 📑 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [문제 인식](#2-문제-인식)
3. [솔루션 — 핵심 가치 3가지](#3-솔루션--핵심-가치-3가지)
4. [타깃 사용자 — 5종 페르소나](#4-타깃-사용자--5종-페르소나)
5. [차별성](#5-차별성)
6. [✅ 구현된 MVP 범위](#6--구현된-mvp-범위)
7. [🚧 향후 계획 (Roadmap)](#7--향후-계획-roadmap)
8. [시장 분석 요약](#8-시장-분석-요약)
9. [기술 스택 & 시스템 구조](#9-기술-스택--시스템-구조)
10. [로컬 실행 & 배포 가이드](#10-로컬-실행--배포-가이드)
11. [프로젝트 구조](#11-프로젝트-구조)
12. [보안 주의](#12-보안-주의)
13. [라이선스](#13-라이선스)

---

## 1. 프로젝트 개요

### 🎤 30초 엘리베이터 피치

> 기존 지도 앱은 자동차·시각 중심입니다. **편한길**은 고령자·장애인·유아동반자가 화면을 보지 않고도 버스·지하철과 걷는 구간을 한 흐름으로 음성 안내받고, 무장애 시설(쉼터·화장실·엘리베이터)을 자동으로 알려줍니다.
> 3분 이상 멈추면 자동으로 쉼터 모드로 전환되고, 가족에게 위치가 자동 공유됩니다.
> 서울 5개 자치구 MVP → 수도권 → 전국 확장으로, 약 **1,400만 명**의 보행 약자가 자립적으로 외출하는 사회를 목표로 합니다.

### 🧭 정체성

| 항목 | 내용 |
|---|---|
| **서비스명** | 편한길 (PyeonhanGil) |
| **한 줄 정의** | 교통약자를 위한 **Voice-First 무장애 이동 내비게이션 (도보+대중교통)** |
| **카테고리** | 모바일 웹앱 · 지도/내비 · 소셜 임팩트 |
| **현재 단계** | **MVP 완성** (20개 페이지 동작, 서울 시드 데이터 배포) |
| **플랫폼** | 웹앱 (PWA 전환 예정) → iOS/Android 네이티브 |

### 💎 핵심 가치 3가지

| 가치 | 한 줄 설명 |
|---|---|
| 🎙 **Voice-First** | STT + TTS 양방향 — 검색·경로·도착·쉼터 안내 전 과정을 음성만으로 |
| 🪑 **무장애 POI 3계층** | 정적 GeoJSON + Kakao Local + data.go.kr 공공데이터를 한 지도로 통합 |
| 👨‍👩‍👧 **자동 체류 + 가족 SOS** | 10m·3분 자동 쉼터 전환, 짧게 누르면 119/가족/쉼터, 길게 누르면 위치 SMS |

---

## 2. 문제 인식

### 🇰🇷 보행 약자 약 1,400만 명

| 그룹 | 인구 규모 | 출처 |
|---|---:|---|
| 65세 이상 고령자 | 약 **950만 명** | 행안부 주민등록인구통계 (2024) |
| 등록 장애인 | 약 **264만 명** | 보건복지부 등록장애인 현황 (2023, 지체장애 44%) |
| 영유아 동반 보호자 | 약 **230만 가구** | 통계청 출생아·가구 추계 |
| **중복 제외 합산** | **약 1,400만 명** | TAM |

> 2030년 65세↑ 인구 25% 진입 → 보행 약자 시장은 향후 5년간 급팽창.

### 😣 사용자가 외출을 포기하는 3가지 이유

1. **"오늘 갈 길에 계단이 몇 개인지 모른다"** — 경로 선택의 불확실성
2. **"중간에 쉴 곳이 있는지 모른다"** — 체력 한계 대비 불가
3. **"넘어지면 가족이 알 수 있을까"** — 안전망의 부재

### 🧱 기존 지도 앱의 구조적 한계

| 한계 | 원인 |
|---|---|
| **시각 중심 UI** | 운전자·통근자 대상 설계 — 글씨·아이콘 작음 |
| **자동차 경로 기반** | "도보" 경로도 차도 기준 알고리즘 사용 |
| **무장애 POI 없음** | 상업 POI 중심, 쉼터·장애인 화장실 미수록 |
| **안전 기능 없음** | 체류 감지·가족 알림 부재 |
| **공사·통행불가 미반영** | 실시간 커뮤니티 입력 채널 없음 |

---

## 3. 솔루션 — 핵심 가치 3가지

### ① 🎙 Voice-First Navigation — 화면 없이도 이동

**개념**: STT(음성 인식) + TTS(음성 합성)를 양방향으로 결합해, 검색·경로 안내·도착 확인 전 과정을 음성만으로 수행.

| 구현 | 위치 | 동작 |
|---|---|---|
| TTS 큐 관리 + 자동 안내 | `src/hooks/useVoice.jsx` | 한국어 ko-KR, rate 0.95, `walkState=visual` 자동 음성 |
| STT 음성 인식 | `src/hooks/useSpeechRecognition.js` | 음성 검색·명령 (continuous=false) |
| 음성 검색 | `src/pages/Search.jsx` | 자동 시작 → 첫 결과 자동 이동 |
| 실시간 음성 안내 | `src/pages/Navigation.jsx` | "도착지까지 N분 남았어요" 실시간 |

**기술 선택 이유**: Web Speech API는 클라이언트 사이드 처리 → 서버 음성 처리 비용 ≈ 0. Chrome/Edge에서 안정 동작.

### ② 🪑 무장애 POI 3계층 통합

**개념**: 정적 GeoJSON + 실시간 Kakao + 정부 공공데이터를 하나의 API로 통합. 오프라인/네트워크/지역 어떤 환경에서도 결과 보장.

```
┌────────────────────────────────────────────────────┐
│  src/services/poiApi.js  (3계층 통합)              │
│  ┌──────────────┬──────────────┬─────────────────┐ │
│  │  1. 정적      │  2. 실시간    │  3. 공공데이터   │ │
│  │  GeoJSON     │  Kakao Local │  data.go.kr     │ │
│  │  ─────────   │  ─────────   │  ──────────     │ │
│  │  오프라인 ✓  │  최신 ✓      │  표준 데이터 ✓   │ │
│  │  즉시 응답   │  500만/월 무료│  5,000건 캐시24h│ │
│  │  서울 시드   │  카테고리 검색│  전국 무더위쉼터  │ │
│  └──────────────┴──────────────┴─────────────────┘ │
│                       ↓                            │
│              중복 제거 (5m · 동일 type)             │
│              거리순 정렬 / bbox 필터                │
└────────────────────────────────────────────────────┘
```

| 마커 | 1. 정적 | 2. Kakao | 3. data.go.kr |
|---|:-:|:-:|:-:|
| 🪑 쉼터 / 장수의자 | ✓ | ✓ ("무더위쉼터") | ✓ 무더위쉼터 표준데이터 (15013199) |
| 🚻 화장실 | | ✓ ("공중화장실") | ✓ 공중화장실 표준데이터 (15012892) |
| 🛗 지하철 엘리베이터 | ✓ | | |
| 🚸 장애인 편의시설 | | | ✓ 장애인편의시설 표준데이터 (15100058) |

### ③ 👨‍👩‍👧 자동 체류 감지 + 가족 SOS

**개념**: GPS 좌표 히스토리를 분석해 사용자가 멈췄을 때 자동 감지 → 강제 입력 없이 쉼터 모드 전환·가족 알림.

| 기능 | 위치 | 임계값 |
|---|---|---|
| 체류 감지 | `src/hooks/useGPS.js` | 10m 반경 내 3분 이상 |
| 속도 계산 | `src/hooks/useGPS.js` | 최근 3개 좌표 평균 |
| 자동 쉼터 전환 | `src/pages/Resting.jsx` | `isStaying=true` 자동 라우팅 |
| 도착 감지 | `src/pages/Arrived.jsx` | 도착지 반경 자동 인식 |
| SOS 3단계 | `src/pages/SOS.jsx` | 119 / 가족 위치 SMS / 가까운 쉼터 |
| 1.5초 길게 누름 | `src/components/SOSButton.jsx` | 등록 가족에게 카카오맵 링크 SMS 자동 발송 |
| 진동 패턴 | `src/hooks/useHaptics.js` | 좌/우/위험/도착/SOS 사전 |

---

## 4. 타깃 사용자 — 5종 페르소나

`src/hooks/useAppState.jsx` 의 `WALK_STATES` 정의에 1:1 대응.

| 코드 키 | 한글 | 이모지 | 속도 | 핵심 니즈 |
|---|---|:-:|---|---|
| `older` | 고령자 | 👵 | 0.6~0.8 m/초 | 계단·경사 회피, 쉼터, 가족 연락 |
| `wheelchair` | 휠체어·보행기 | ♿ | 0.4~0.6 m/초 | 엘리베이터·경사로·넓은 길 |
| `visual` | 시각장애인 | 🦯 | 0.5~0.7 m/초 | 횡단보도·음성 양방향·안전한 보행 |
| `stroller` | 유모차 동반 | 👶 | 0.6~0.8 m/초 | 엘리베이터·턱 없는 길·기저귀실 |
| `injured` | 일시적 부상자 | 🩼 | 0.5~0.7 m/초 | 짧은 보행·자주 쉼·최단 거리 |

**세컨더리 사용자**: 위 1차 사용자의 가족(자녀·배우자). 실시간 위치 확인, 도착 알림, SOS 수신 담당.

페르소나별 권장 휴식 간격은 `src/utils/routeRest.js` 의 `pickRestStops` 가 자동 산출 (고령 250m / 휠체어 400m / 부상 200m 등).

---

## 5. 차별성

| 항목 | 카카오맵 | 네이버지도 | T맵 | **편한길** |
|---|:-:|:-:|:-:|:-:|
| 주 사용자 | 운전자 | 일반 | 운전자 | **보행 약자** |
| 도보 전용 경로 | △ | △ | ○ | **◎ (4단 폴백)** |
| 무장애 POI | △ | × | × | **◎ (3계층)** |
| 음성 양방향 (STT+TTS) | × | × | △ | **◎** |
| 자동 체류 감지 | × | × | × | **◎** |
| 50m 경로 필터링 | × | × | × | **◎** |
| 커뮤니티 제보 (72h) | × | × | × | **○** |
| 걸음 상태 맞춤 안내 | × | × | × | **◎ (5종)** |

> **무장애·음성·체류 감지·맞춤 안내 4축이 모두 결합된 서비스는 국내 최초.**

---

## 6. ✅ 구현된 MVP 범위

> 2026-05 기준 — 모든 페이지가 동작하며 Vercel에 배포 운영 중.

### 📱 페이지 (20종)

| 구분 | 페이지 | 경로 | 한 줄 설명 |
|---|---|---|---|
| 온보딩 | Splash | `/` | 로고 + URL 쿼리 기반 초기화 |
| 온보딩 | Login | `/login` | Firebase 인증 |
| 온보딩 | Intro | `/intro` | 가치 소개 캐러셀 |
| 온보딩 | Permissions | `/permissions` | 위치·음성·진동 권한 |
| 온보딩 | WalkState | `/walk-state` | 걸음 상태 5종 선택 |
| 메인 | Home | `/home` | 음성 검색·즐겨찾기·빠른 찾기 |
| 메인 | Search | `/search` | 음성/텍스트 검색 + 자동완성 |
| 메인 | MapMain | `/map` | 반경 1500m POI 통합 지도 |
| 메인 | RouteSuggest | `/route` | 이동수단 스위처·50m 필터·제보 표시 |
| 길 안내 | Navigation | `/navigation` | 실시간 음성·체류 감지 |
| 길 안내 | Resting | `/resting` | 자동 쉼터 + 잔여 시간 안내 |
| 길 안내 | Arrived | `/arrived` | 도착 자동 인식 |
| 긴급 | SOS | `/sos` | 119·가족 SMS·가장 가까운 쉼터 |
| 설정 | Family | `/family` | 가족 초대·SOS 수신 토글 |
| 설정 | EmergencyContacts | `/emergency` | 긴급 연락처 관리 |
| 설정 | Favorites | `/favorites` | 즐겨찾기 편집 |
| 설정 | MyInfo | `/my` | 프로필·월간 통계·가족·연락처 |
| 설정 | Settings | `/settings` | 음성·진동·테마·앱 초기화 |
| 사회 | Community | `/community` | 6종 위험 제보 (72h 유효) |
| 관리자 | Admin | `/admin` | 제보 큐·API 상태 (`isAdminEmail` 가드) |

### 🛠 기술 자산 (코드 인용 색인)

| 영역 | 파일 | 설명 |
|---|---|---|
| 라우팅 | `src/App.jsx` | 20 페이지 SPA, Admin 가드 포함 |
| 전역 상태 + 5종 페르소나 | `src/hooks/useAppState.jsx` | `WALK_STATES` · `FONT_SIZES` · Context + localStorage |
| 인증 | `src/hooks/useAuth.jsx` · `src/lib/admin.js` | Firebase Auth · `isAdminEmail()` |
| GPS·체류 감지 | `src/hooks/useGPS.js` | 10m·3분 체류 / 평균 속도 |
| TTS + 자동 안내 | `src/hooks/useVoice.jsx` | `useAutoAnnounce` · `AnnounceLive` |
| STT 음성 인식 | `src/hooks/useSpeechRecognition.js` | Web Speech API |
| 진동 패턴 | `src/hooks/useHaptics.js` | 좌/우/위험/도착/SOS |
| 지도 SDK 래퍼 | `src/hooks/useKakaoMap.js` | 12종 마커 커스텀 |
| 도보 경로 (4단 폴백) | `api/route.js` | Tmap → OSRM → Kakao → 직선 |
| Kakao Local 프록시 | `api/local.js` | 키워드·카테고리 검색 |
| 공공데이터 통합 + 캐시 | `api/govdata.js` | ODCloud 3종 / 24h 캐시 |
| Kakao 장소 상세 | `api/place.js` | 장소 ID → 상세 |
| 헬스 체크 | `api/status.js` | 외부 4종 API 연결 상태 |
| POI 3계층 통합 | `src/services/poiApi.js` | center+radius / bbox 두 모드 |
| 권장 휴식 자동 삽입 | `src/utils/routeRest.js` | `pickRestStops` · `findNearestRest` |
| 거리·bbox 유틸 | `src/utils/geo.js` | haversine · polyline 거리 |
| 트립 기록 | `src/services/tripStore.js` | GPS 트립 누적 |
| 커뮤니티 제보 | `src/services/reportsStore.js` | 6종 타입 · 72h 유효 |
| SOS 버튼 | `src/components/SOSButton.jsx` | 짧게 → `/sos` / 1.5초 → SMS |
| 정적 데이터 | `public/data/*.geojson` | 서울 지하철 엘리베이터·장수의자·무더위쉼터 |

---

## 7. 🚧 향후 계획 (Roadmap)

### 표기 규약

| 표기 | 의미 |
|:-:|---|
| 🟢 | **완료** — 위 §6 참조 |
| 🟡 | **즉시 보완** (UI는 있으나 로직 미연결) — M+0~3 |
| 🔵 | **Phase 2 신규 개발** — M+3~9 |
| ⚪ | **Phase 3 장기 확장** — M+9 이후 |

### 🟡 즉시 보완 (UI만 있는 영역)

| # | 기능 | 현재 상태 | 보완 방향 |
|:-:|---|---|---|
| 1 | 글씨 크기 조절 | UI 있음, 로직 미연결 | CSS 변수 + Context로 4단계 적용 (`FONT_SIZES` 활용) |
| 2 | 긴급 연락처 → SOS 연동 | UI만 존재 | localStorage → `SOS.jsx`에서 호출 |
| 3 | 즐겨찾기 편집 | 하드코딩 3개 시드 | 추가/삭제 모달, 영속화 |
| 4 | 가족 초대 | `prompt()` 알림만 | 토큰 기반 초대 링크 (Phase 2 인증과 연계) |
| 5 | 월간 통계 | 하드코딩 숫자 | GPS 트립 기록 → 일별 집계 (`tripStore.js` 확장) |
| 6 | 커뮤니티 다기기 공유 | localStorage 단일 기기 | Phase 2 DB 동기화 |
| 7 | POI 카테고리 검색 UI | API 구현됨, UI 미노출 | MapMain 필터 UI 추가 |
| 8 | Resting 도착 예상시간 | 하드코딩 9분 | 잔여 경로 + 걸음 속도 동적 계산 |

### 🔵 Phase 2 — 지원 기간 내 (M+0~9)

- **대중교통 실시간 경로 연동** — 환승·노선·배차 시간을 반영한 도보+대중교통 통합 라우팅 (현재 `api/route.js` 도보 4단 폴백 + 대중교통 외부 링크 → 전용 대중교통 API 연동으로 확장)
- **사용자 인증·계정** — 이메일/카카오 OAuth (Firebase 기반은 일부 구현)
- **백엔드 DB** — Supabase/Firebase 통합 (프로필·즐겨찾기·트립·제보·가족 토큰)
- **실시간 가족 연동** — FCM 푸시, SOS 수신 → 위치 공유, 도착 알림
- **PWA 전환** — manifest · Service Worker · 오프라인 캐시
- **data.go.kr 전국 확대** — 지역별 캐시 분리, 1주 TTL, Cron 자동 갱신
- **접근성 보강 (WCAG 2.2 AA)** — 고대비 모드 · ARIA 라벨 · 키보드 네비 · 외부 감수
- **베타 운영 도구** — 익명 분석 · A/B 테스트 · Sentry

### ⚪ Phase 3 — 장기 확장 (M+9 이후)

- **React Native 네이티브 앱** — 백그라운드 GPS · 푸시 안정성 · 배터리 최적화
- **ML 걸음 학습** — 개인별 평균 속도 · 외출 패턴 예측 · 시간대별 혼잡도
- **가족 실시간 위치 공유** — 보호자 앱 · 안전 구역 · 외출 히스토리
- **다언어 (영·중·일)** — 관광객 무장애 안내 시장
- **B2B 관리자 대시보드** — 자치구·복지관용 데이터 환류 · 정책 결정 지원
- **모빌리티 연동** — 시니어 콜택시 · 휠체어 리프트 차량 · 공유 전동스쿠터

### 📌 핵심 마일스톤·KPI

| 시점 | 마일스톤 | KPI 목표 |
|---|---|---|
| M+1 | 🟡 8건 보완 완료 | 모든 UI 동작 |
| M+3 | 🔵 인증 + DB 도입 | 가입자 500명 |
| M+6 | 🔵 PWA + 푸시 | 홈 화면 설치율 30%+ |
| M+9 | 🔵 WCAG 2.2 AA 인증 | 외부 접근성 감수 통과 |
| M+12 | 첫 B2B 계약 | 자치구·복지관 라이선스 1건+ |
| M+12 | 사용자 외출 +20% | 트립 기록 통계 입증 |

---

## 8. 시장 분석 요약

### TAM / SAM / SOM

| 지표 | 규모 | 정의 |
|---|---:|---|
| **TAM** | 약 **1,400만 명** | 국내 보행 보조가 필요한 전체 인구 |
| **SAM** | 약 **600만 명** | 서울·수도권 거주 보행 약자 (Phase 1~2) |
| **SOM** | **3년 내 MAU 10만** | SAM의 약 1.7% 침투 (보수적 추산) |

### 진입 단계

| Phase | 시점 | 지역 | 데이터 자산 |
|---|---|---|---|
| **Phase 1** | M+0~12 | 서울 5개 자치구 (종로·중구·동대문·서대문·동작) | 현재 시드 데이터로 즉시 실행 가능 |
| **Phase 2** | M+12~24 | 수도권 (인천·수원·고양·성남·용인) | 지역별 캐시 분리 |
| **Phase 3** | M+24 이후 | 전국 광역시 + 다언어 | 자치단체 B2B 라이선스 |

### 진입 적기 신호

- **인구 (Pull)** — 2030년 65세↑ 25% 진입 → 시장 30%+ 성장
- **정책 (Push)** — 「교통약자 이동편의 증진법」, 행안부 무장애 BF 인증 확대, 서울시 '보행친화도시 서울' 비전 2030
- **기술 (Enabler)** — Kakao 500만/월 무료, Web Speech 클라우드 비용 ≈ 0, data.go.kr 5,000건 일괄 다운로드, Vercel/Cloudflare Edge

> 보다 상세한 시장·경쟁사·사업 모델은 `docs/application/` 참조.

---

## 9. 기술 스택 & 시스템 구조

### 🎨 프론트엔드

| 영역 | 기술 |
|---|---|
| 프레임워크 | **React 18.3** + Vite 5.4 |
| 라우팅 | React Router DOM 6.26 (20 페이지 SPA) |
| 상태 관리 | Context API + localStorage |
| UI | Tailwind CSS 3.4 · Radix UI · Lucide Icons · Sonner |
| 지도 SDK | Kakao Maps JavaScript SDK |
| 인증 | Firebase Auth 12.13 |

### 🧠 브라우저 표준 API

Web Speech API (TTS·STT) · Web Vibration API (진동) · Geolocation API (GPS·속도) · Notification API · localStorage

### ☁️ 백엔드 (Vercel Serverless Functions)

| 엔드포인트 | 역할 |
|---|---|
| `POST /api/route` | 도보 경로 — Tmap → OSRM → Kakao → 직선 (4단 폴백) |
| `GET  /api/local` | Kakao Local 프록시 (키워드·카테고리) |
| `GET  /api/govdata` | data.go.kr 무더위쉼터·공중화장실·장애인편의시설 (5,000건 캐시 24h) |
| `GET  /api/place/[id]` | Kakao 장소 상세 |
| `GET  /api/status` | 외부 4종 API 헬스 체크 |

### 🛡 도보 경로 — 4단 폴백 로직

`api/route.js`:

```
1순위: Tmap Pedestrian API   ─┐
                              ├─ TMAP_APP_KEY 미설정/실패
2순위: OSRM Foot 프로파일      ─┤
                              ├─ 네트워크 실패
3순위: Kakao Mobility Directions (자동차 → 도보 속도 재계산)
                              ├─ 실패
4순위: 직선 폴백 + 중점 경유 (haversine 거리)
```

> 외부 API 장애 시에도 **항상 경로를 반환**하는 신뢰성 설계. 캐시 5분 TTL (`Cache-Control: s-maxage=120, stale-while-revalidate=300`).

### 🔐 API 키 보안 모델

| 키 | 노출 위치 | 보호 방식 |
|---|---|---|
| `VITE_KAKAO_JS_KEY` | 클라이언트 | **도메인 화이트리스트** (Kakao 콘솔) |
| `KAKAO_REST_API_KEY` | 서버 only | Vercel 환경변수 |
| `TMAP_APP_KEY` | 서버 only | Vercel 환경변수 |
| `DATA_GO_KR_SERVICE_KEY` | 서버 only | Vercel 환경변수 |

모든 외부 호출은 `/api/*` Serverless Function을 통과 → 클라이언트에 비공개 키 노출 없음.

---

## 10. 로컬 실행 & 배포 가이드

### 🚀 로컬 실행

```bash
npm install
cp .env.example .env
# .env 파일 열어 카카오 JS 키 붙여넣기
npm run dev
```

브라우저에서 http://localhost:3000 접속.

### 🎬 데모/시연용 URL 쿼리

`Splash.jsx`가 URL 쿼리로 진입 상태를 강제 제어합니다 (심사·시연 시 깨끗한 첫 인상 확보).

| URL | 동작 |
|---|---|
| `/?demo=1` (또는 `/?reset=1`) | `localStorage` 초기화 → 온보딩부터 다시 시작 (데모 모드 배지 표시) |
| `/?onboard=1` | 다른 데이터 유지, 온보딩만 강제 |
| `/?walk=visual` | 사용자 유형 미리 지정 (`older`/`wheelchair`/`visual`/`stroller`/`injured`) |

발표 자료/신청서에는 `https://<도메인>/?demo=1` 를 적어두면 평가자가 누를 때마다 초기 상태로 시작합니다.

### 🔑 카카오 JS 키 발급

1. https://developers.kakao.com 로그인 → 내 애플리케이션 → 추가
2. **앱 키 → JavaScript 키** 복사 → `.env`에 붙여넣기
3. **앱 설정 → 플랫폼 → Web 플랫폼 등록**
   - `http://localhost:3000`

### 🛂 관리자 계정 (시연용)

| 항목 | 값 |
|---|---|
| 이메일 | `admin@pyeonhangil.com` |
| 비밀번호 | `admin123!` |

`/admin` 경로는 `isAdminEmail()` 가드를 통과해야 접근 가능 (`src/lib/admin.js`).

---

### ☁️ Vercel 배포 — 지도가 안 나올 때 체크리스트

지도가 안 나오는 이유는 거의 다음 셋 중 하나입니다.

#### ① Vercel 환경변수 등록

Vercel 대시보드 → 프로젝트 → **Settings → Environment Variables**

| Name | Value | 용도 |
|---|---|---|
| `VITE_KAKAO_JS_KEY` | 카카오 JavaScript 키 | 지도 SDK (클라) |
| `KAKAO_REST_API_KEY` | 카카오 REST API 키 | 로컬 검색 + 길찾기 (서버) |
| `TMAP_APP_KEY` | (선택) Tmap 앱 키 | 보행자 경로 (서버) |
| `DATA_GO_KR_SERVICE_KEY` | (선택) data.go.kr 서비스 키 | 무더위쉼터/공중화장실/장애인편의시설 (서버) |

⚠️ `KAKAO_REST_API_KEY`, `DATA_GO_KR_SERVICE_KEY`는 **`VITE_` 접두사 없이** 등록 — 서버 함수에서만 쓰고 클라에 노출되지 않게.

#### data.go.kr 서비스 키 발급 절차

1. https://www.data.go.kr 가입 → 로그인
2. 다음 데이터셋 각각 검색해서 **활용신청** (각각 1~2시간 후 승인 메일)
   - "전국무더위쉼터표준데이터" (ID 15013199)
   - "전국공중화장실표준데이터" (ID 15012892)
   - "전국장애인편의시설표준데이터" (ID 15100058)
3. 마이페이지 → 인증키 발급내역 → **일반 인증키 (Decoding)** 복사
4. Vercel 환경변수 `DATA_GO_KR_SERVICE_KEY` 에 등록 → Redeploy

키가 미설정이어도 정적 GeoJSON으로 폴백되어 앱은 정상 동작합니다.

저장 후 **Deployments → 최신 배포 → ⋯ → Redeploy** 로 재배포.

#### ② 카카오 개발자 콘솔에 Vercel 도메인 등록

카카오맵 SDK는 등록되지 않은 도메인에서는 작동하지 않습니다.

1. https://developers.kakao.com → 내 애플리케이션 → 해당 앱
2. **앱 설정 → 플랫폼 → Web 플랫폼 수정**
3. 사이트 도메인에 추가:
   - `https://your-project.vercel.app` (Vercel이 부여한 기본 도메인)
   - `https://your-project-*.vercel.app` (PR 프리뷰용, 와일드카드 지원)
   - 커스텀 도메인이 있다면 그것도 추가

#### ③ SPA 라우팅

이 저장소에는 `vercel.json`이 포함되어 있어 `/home`, `/map` 등 직접 접근 시에도 새로고침 404가 나지 않습니다. 별도 설정 불필요.

#### 빠른 진단

배포된 사이트 → 지도 화면(`/map`)으로 가면 카카오 SDK 로드 실패 시 화면에 **현재 도메인**과 함께 단계별 해결 방법이 안내됩니다.

---

## 11. 프로젝트 구조

```
src/
├── App.jsx                          # 20 페이지 라우팅 + Admin 가드
├── main.jsx
├── styles/global.css
├── hooks/
│   ├── useAppState.jsx              # 전역 상태 + 5종 페르소나 (WALK_STATES)
│   ├── useAuth.jsx                  # Firebase Auth
│   ├── useVoice.jsx                 # TTS + useAutoAnnounce + AnnounceLive
│   ├── useHaptics.js                # Web Vibration 패턴 사전
│   ├── useGPS.js                    # GPS 추적 + 10m·3분 체류 감지
│   ├── useSpeechRecognition.js      # STT
│   └── useKakaoMap.js               # 카카오맵 SDK 래퍼 (12종 마커)
├── components/
│   ├── AppBrand.jsx
│   ├── TabBar.jsx
│   └── SOSButton.jsx                # 짧게 → /sos / 1.5초 길게 → SMS 발송
├── services/
│   ├── poiApi.js                    # POI 3계층 통합 (정적+Kakao+gov)
│   ├── routeApi.js
│   ├── placeApi.js
│   ├── tripStore.js                 # GPS 트립 기록
│   └── reportsStore.js              # 커뮤니티 제보 (6종, 72h)
├── utils/
│   ├── geo.js                       # haversine · bbox · polyline 거리
│   └── routeRest.js                 # pickRestStops · findNearestRest
├── lib/
│   └── admin.js                     # isAdminEmail()
├── data/pois.js                     # POI 샘플
└── pages/                           # 20 페이지
    ├── Splash · Login · Intro · Permissions · WalkState
    ├── Home · Search · MapMain · RouteSuggest
    ├── Navigation · Resting · Arrived · SOS
    ├── Family · EmergencyContacts · Favorites · MyInfo · Settings
    ├── Community
    └── Admin

api/                                 # Vercel Serverless Functions
├── route.js                         # 도보 경로 4단 폴백
├── local.js                         # Kakao Local 프록시
├── govdata.js                       # data.go.kr 통합 + 24h 캐시
├── place.js                         # Kakao 장소 상세
└── status.js                        # 외부 4종 헬스 체크

public/data/                         # 정적 GeoJSON 시드 (서울)
├── subway_elevators.geojson
├── jangsu_chairs.geojson
└── heat_shelters_seoul.geojson

docs/application/                    # 상세 사업계획서 (별도 트랙)
└── 00_INDEX.md ~ 99_APPENDIX.md
```

---

## 12. 보안 주의

- `.env` 는 절대 Git에 커밋 금지 (`.gitignore`에 포함됨)
- **이미 키가 GitHub에 노출됐다면 카카오 콘솔에서 키 재발급 필수**
- 서버 전용 키(`KAKAO_REST_API_KEY`, `TMAP_APP_KEY`, `DATA_GO_KR_SERVICE_KEY`)는 절대 `VITE_` 접두사로 등록하지 말 것
- Admin 페이지는 `isAdminEmail()` 가드 필수 (`src/App.jsx`)

---

## 13. 라이선스

MIT
