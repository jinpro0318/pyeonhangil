# 편한길 디자인 시스템

> CityTrans UI Kit + Material 3 Design Kit 기반  
> 아이콘 색상 원본: `/Users/admin/Desktop/pyeonhangil`

---

## 색상 토큰

| 이름 | Hex | Tailwind | 용도 |
|------|-----|----------|------|
| Primary Blue | `#1A8FE3` | `bg-[#1A8FE3]` | 버튼, 경로선, 지도 핀, 활성 탭 |
| Accent Teal | `#2CC6A0` | `bg-[#2CC6A0]` | 선택 상태, 포커스 링, 하트 아이콘 |
| Success Green | `#3EBE6E` | `bg-[#3EBE6E]` | 배리어프리 가능, 엘리베이터, 경사로 |
| Warning Orange | `#E85D24` | `bg-[#E85D24]` | 계단, 장벽, 접근 불가 |
| Background | `#EAF6FE` | `bg-[#EAF6FE]` | 앱 배경, 카드, 입력창 |
| Text Primary | `#1A2B3C` | `text-[#1A2B3C]` | 본문 텍스트 |
| Text Secondary | `#5A7080` | `text-[#5A7080]` | 보조 텍스트, 캡션 |

---

## CSS 변수 (`src/styles/global.css`)

```css
:root {
  --color-primary:  #1A8FE3;
  --color-teal:     #2CC6A0;
  --color-green:    #3EBE6E;
  --color-warning:  #E85D24;
  --color-bg:       #EAF6FE;
  --color-text:     #1A2B3C;
  --color-text-sub: #5A7080;
  --radius-card:    12px;
  --radius-chip:    8px;
  --touch-target:   48px;
}
```

---

## 컴포넌트 규칙 (Material 3 기반)

| 항목 | 값 | Tailwind |
|------|-----|----------|
| 최소 터치 영역 | 48px × 48px | `min-h-[48px] min-w-[48px]` |
| 카드 모서리 | 12px | `rounded-xl` |
| 버튼/칩 모서리 | 8px | `rounded-lg` |
| FAB 모서리 | 원형 | `rounded-full` |
| 색상 대비 | WCAG 2.1 AA (4.5:1) | — |
| 폰트 | Noto Sans KR | `font-['Noto_Sans_KR']` |

---

## 아이콘 색상 규칙

| 아이콘 | 색상 | 의미 |
|--------|------|------|
| 휠체어 | `#3EBE6E` | 접근 가능 경로 |
| 엘리베이터 | `#3EBE6E` | 접근 가능 |
| 경사로 | `#3EBE6E` | 접근 가능 |
| 저상버스 | `#1A8FE3` | 대중교통 |
| 도보 | `#2CC6A0` | 일반 보행 |
| 계단 | `#E85D24` | 장벽 (주의) |

---

## 화면 목록 (20개)

| 화면 | 파일 | 설명 |
|------|------|------|
| 스플래시 | `Splash.jsx` | 앱 로딩 |
| 인트로 | `Intro.jsx` | 온보딩 |
| 로그인 | `Login.jsx` | Firebase 인증 |
| 권한 | `Permissions.jsx` | GPS 등 권한 요청 |
| 홈 | `Home.jsx` | 메인 화면 |
| 지도 | `MapMain.jsx` | 카카오맵 |
| 검색 | `Search.jsx` | 장소 검색 |
| 내비게이션 | `Navigation.jsx` | 경로 안내 |
| 경로 추천 | `RouteSuggest.jsx` | 배리어프리 경로 선택 |
| 보행 상태 | `WalkState.jsx` | 이동 중 화면 |
| 휴식 | `Resting.jsx` | 휴식 알림 |
| 도착 | `Arrived.jsx` | 목적지 도착 |
| SOS | `SOS.jsx` | 긴급 신고 |
| 긴급 연락처 | `EmergencyContacts.jsx` | 연락처 관리 |
| 가족 | `Family.jsx` | 동행자 |
| 즐겨찾기 | `Favorites.jsx` | 저장 장소 |
| 커뮤니티 | `Community.jsx` | 배리어프리 정보 공유 |
| 내 정보 | `MyInfo.jsx` | 프로필 |
| 설정 | `Settings.jsx` | 앱 설정 |
| 관리자 | `Admin.jsx` | 관리자 대시보드 |

---

## 참고 Figma 킷

- **CityTrans Bus Transportation App UI Kit** — 화면 레이아웃 구조  
  https://www.figma.com/community/file/1403960124614816925
- **Material 3 Design Kit** — 컴포넌트 시스템 + 접근성  
  https://www.figma.com/community/file/1035203688168086460

---

## 관련 링크

- 라이브: https://pyeonhangil.vercel.app
- GitHub: https://github.com/jinpro0318/pyeonhangil
