# 편한길 — Cursor Claude CLI 명령어

> 실제 프로젝트 경로: `/Users/admin/Desktop/pyeonhangil`

---

## Step 1 — .cursorrules 생성

터미널에서 실행:

```bash
cd /Users/admin/Desktop/pyeonhangil

cat > .cursorrules << 'EOF'
You are a UI/UX design engineer working on 편한길 (PyeonhanGil), a barrier-free navigation app for people with mobility limitations (wheelchair users, elderly, stroller users).

Stack: React 18, Vite, Tailwind CSS, shadcn/ui, Kakao Maps SDK, Firebase, Web Speech API

## Project Structure
- Pages: Splash, Intro, Login, Permissions, Home, MapMain, Search, Navigation, RouteSuggest, WalkState, Resting, Arrived, SOS, EmergencyContacts, Family, Favorites, Community, MyInfo, Settings, Admin
- Components: AppBrand, PageHeader, PoiDetailCard, SOSButton, TabBar
- UI: shadcn/ui (button, card, dialog, dropdown-menu, input, sheet, sonner, tabs)
- Hooks: useAppState, useAuth, useGPS, useHaptics, useKakaoMap, useSpeechRecognition, useVoice
- Services: placeApi, poiApi, reportsStore, routeApi, tripStore

## Color Tokens
--color-primary:  #1A8FE3  (버튼, 경로선, 지도 핀, 활성 탭)
--color-teal:     #2CC6A0  (선택 상태, 포커스 링, 하트 아이콘)
--color-green:    #3EBE6E  (배리어프리 가능, 엘리베이터, 경사로)
--color-warning:  #E85D24  (계단, 장벽, 접근 불가)
--color-bg:       #EAF6FE  (앱 배경, 카드, 입력창)
--color-text:     #1A2B3C  (본문)
--color-text-sub: #5A7080  (보조 텍스트)

## Component Rules (Material 3 principles)
- Minimum touch target: 48px x 48px (min-h-[48px] min-w-[48px])
- Card radius: rounded-xl (12px)
- Chip/button radius: rounded-lg (8px)
- FAB radius: rounded-full
- Color contrast: WCAG 2.1 AA (4.5:1 minimum)
- Font: Noto Sans KR

## Icon Color Rules
- 휠체어 / 엘리베이터 / 경사로 → #3EBE6E
- 저상버스 / 경로선              → #1A8FE3
- 도보 / 중간 경로               → #2CC6A0
- 계단 / 장벽                   → #E85D24

## Design Reference
- Screen layout: CityTrans Bus Transportation App UI Kit (Figma)
- Component system: Material 3 Design Kit (Figma)
- Live: https://pyeonhangil.vercel.app

## Rules
1. Tailwind arbitrary values 사용 (bg-[#1A8FE3]), 임의 hex 직접 금지
2. 모든 인터랙티브 요소 min-h-[48px] min-w-[48px]
3. 한국어 UI는 Noto Sans KR
4. 배리어프리 상태: 초록(가능) / 주황(주의) 시각적 구분
5. shadcn/ui 컴포넌트 우선, CityTrans 레이아웃 구조 참고
EOF
```

---

## Step 2 — CSS 변수 추가

커서 채팅창에 입력:

```
src/styles/global.css 파일 :root에 아래 CSS 변수 추가해줘. 기존 내용 건드리지 말고:

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

## Step 3 — 화면별 리디자인 명령어

### TabBar.jsx (가장 먼저)

```
src/components/TabBar.jsx를 리디자인해줘.

- 배경: bg-white, border-t border-gray-100
- 활성 탭 아이콘 + 텍스트: text-[#1A8FE3]
- 비활성 탭: text-[#5A7080]
- 각 탭 터치 영역: min-h-[56px]
- 활성 탭 상단 인디케이터: border-t-2 border-[#1A8FE3]
```

### Home.jsx

```
src/pages/Home.jsx를 CityTrans 홈 화면 레이아웃 구조 참고해서 리디자인해줘.

- 배경: bg-[#EAF6FE]
- 상단 검색바: shadcn Input, 아이콘 text-[#1A8FE3], rounded-xl
- 최근 경로 칩: shadcn Badge, 선택 시 bg-[#2CC6A0] text-white
- 주변 배리어프리 시설 카드: shadcn Card, rounded-xl
  - 엘리베이터/경사로 뱃지: bg-[#3EBE6E] text-white rounded-full
  - 계단만 뱃지: bg-[#E85D24] text-white rounded-full
- 모든 버튼 min-h-[48px]
```

### MapMain.jsx

```
src/pages/MapMain.jsx 지도 위 UI 레이어를 리디자인해줘.

- 현재 위치 FAB: 우하단 고정, rounded-full, bg-[#1A8FE3], min-h-[56px] min-w-[56px]
- 배리어프리 마커: 엘리베이터/경사로 → #3EBE6E 핀
- 장벽 마커: 계단 → #E85D24 핀
- 하단 바텀시트: shadcn Sheet 활용, 경로 요약 정보
- 검색바 상단 고정: bg-white rounded-xl
```

### Search.jsx

```
src/pages/Search.jsx를 CityTrans 검색 화면 레이아웃 참고해서 리디자인해줘.

- 입력창: shadcn Input, focus ring #2CC6A0, rounded-xl
- 최근 검색어 항목: min-h-[48px], 아이콘 text-[#5A7080]
- 검색 결과 카드: shadcn Card, rounded-xl
  - 배리어프리 가능: text-[#3EBE6E] + 체크 아이콘
  - 거리: text-[#5A7080]
- 배경: bg-[#EAF6FE]
```

### RouteSuggest.jsx

```
src/pages/RouteSuggest.jsx 경로 추천 화면을 CityTrans 경로 선택 레이아웃 참고해서 리디자인해줘.

- 경로 옵션 카드 3종 (도보 / 저상버스 / 지하철+엘리베이터):
  - shadcn Card, rounded-xl
  - 선택 카드: border-2 border-[#1A8FE3]
  - 배리어프리 뱃지: bg-[#3EBE6E] text-white rounded-full
  - 소요 시간: text-[#1A8FE3] font-semibold
- 경로 탐색 버튼: bg-[#1A8FE3], min-h-[52px], rounded-xl, w-full
- 출발지/도착지 입력: shadcn Input, focus ring #2CC6A0
```

### Navigation.jsx

```
src/pages/Navigation.jsx 내비게이션 화면을 리디자인해줘.

- 상단 경로 정보 바: bg-[#1A8FE3] text-white
- 현재 안내 카드: shadcn Card, border-l-4 border-[#2CC6A0], rounded-xl
- 배리어프리 알림: bg-[#3EBE6E]/10 border border-[#3EBE6E], rounded-xl
- 장벽 경고: bg-[#E85D24]/10 border border-[#E85D24], rounded-xl
- 하단 도착 버튼: bg-[#1A8FE3], min-h-[52px], rounded-xl, w-full
```

### SOS.jsx

```
src/pages/SOS.jsx SOS 화면을 리디자인해줘.

- SOS 메인 버튼: rounded-full, bg-[#E85D24], min-h-[120px] min-w-[120px]
- 긴급 연락처 카드: shadcn Card, rounded-xl, 전화 아이콘 text-[#1A8FE3]
- 위치 공유 버튼: bg-[#2CC6A0], min-h-[48px], rounded-xl
- 배경: bg-[#EAF6FE]
```

---

## Step 4 — DESIGN_SYSTEM.md 생성 및 README 업데이트

커서 채팅창에 입력:

```
docs/DESIGN_SYSTEM.md 파일을 새로 만들어줘. 내용:
1. 편한길 색상 토큰 표 (이름 / Hex / Tailwind class / 용도)
2. 컴포넌트 규칙 (터치 영역, 라디우스, 대비율)
3. 아이콘 색상 규칙 표
4. 화면 목록 (20개 페이지 설명)
5. 참고 Figma 킷 링크 2개

그리고 README.md 하단에 ## 디자인 시스템 섹션 추가해서
docs/DESIGN_SYSTEM.md 링크 연결해줘.
```

---

## Step 5 — Git 커밋 & 푸시

```bash
cd /Users/admin/Desktop/pyeonhangil

git add .cursorrules
git commit -m "chore: add cursorrules for design system"

git add src/styles/global.css
git commit -m "design: add 편한길 color tokens to CSS variables"

git add src/components/TabBar.jsx
git commit -m "design: apply brand colors to TabBar"

git add src/pages/Home.jsx src/pages/MapMain.jsx
git commit -m "design: apply CityTrans layout + M3 components to Home, Map"

git add src/pages/Search.jsx src/pages/RouteSuggest.jsx src/pages/Navigation.jsx
git commit -m "design: apply brand design system to Search, Route, Navigation"

git add src/pages/SOS.jsx
git commit -m "design: apply brand colors to SOS screen"

git add docs/DESIGN_SYSTEM.md README.md
git commit -m "docs: add design system documentation and update README"

git push origin main
```

---

## 작업 체크리스트

- [ ] `.cursorrules` 루트에 생성
- [ ] `src/styles/global.css` CSS 변수 추가
- [ ] `src/components/TabBar.jsx` 리디자인
- [ ] `src/pages/Home.jsx`
- [ ] `src/pages/MapMain.jsx`
- [ ] `src/pages/Search.jsx`
- [ ] `src/pages/RouteSuggest.jsx`
- [ ] `src/pages/Navigation.jsx`
- [ ] `src/pages/SOS.jsx`
- [ ] `docs/DESIGN_SYSTEM.md` 생성
- [ ] `README.md` 디자인 시스템 섹션 추가
- [ ] Vercel 배포 확인 (https://pyeonhangil.vercel.app)
