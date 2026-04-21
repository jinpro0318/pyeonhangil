# 편한길 · PyeonhanGil

> 🎙 듣고 📍 알아서 — 걸음이 불편한 분과 동행하는 가족을 위한 배리어프리 내비게이션

![편한길 로고](./public/pyeonhangil_icon_128.png)

## ✨ 핵심 기능

- 🎙 **Voice-First** — 모든 안내 음성 동시 지원. 화면 안 봐도 귀로 다닐 수 있음
- 📍 **GPS 자동 감지** — 체류 3분 이상 자동 인식 → "쉬고 계시네요" 자동 전환
- 📊 **걸음 데이터 학습** — GPS 실시간 속도 측정으로 개인 맞춤 안내
- 👨‍👩‍👧 **가족 자동 공유** — 도착·쉼·위치 실시간 공유
- 🗺 **카카오맵 통합** — 정부 설치 시설 8종 한 지도
- 🚨 **긴급 SOS** — 119·가족·쉼터 3단계 도움 요청

## 📱 걸음 상태 4가지

| 상태 | 의미 | 속도 |
|---|---|---|
| 🟢 조금 느려요 | 천천히 걷지만 혼자 다님 | 0.7~0.9m/초 |
| 🟡 많이 느려요 | 지팡이·자주 쉼 필요 | 0.5~0.7m/초 |
| 🔴 도움이 필요해요 | 휠체어·보행기·시각장애 | 0.4m/초 이하 |
| 👶 유모차예요 | 아이와 함께 다님 | 0.6~0.8m/초 |

## 🛠 기술 스택

- **React 18** + **Vite** (빠른 개발 서버)
- **React Router 6** (14개 화면 라우팅)
- **Kakao Maps JavaScript SDK** (실제 지도)
- **Web Speech API** (TTS 음성 안내 · STT 음성 인식)
- **Geolocation API** (GPS 추적 + 체류 감지)
- **LocalStorage** (상태 영속화)

## 🚀 실행 방법

### 1. 설치

```bash
# Node.js 18 이상 필요
npm install
```

### 2. 카카오맵 키 설정

```bash
# .env.example을 .env로 복사
cp .env.example .env

# .env 파일 열어서 카카오 JS 키 입력
VITE_KAKAO_JS_KEY=실제키값
```

#### 카카오 JS 키 발급 방법
1. [Kakao Developers](https://developers.kakao.com) 로그인
2. 내 애플리케이션 → 애플리케이션 추가
3. 앱 설정 → 플랫폼 → **Web 플랫폼 등록**
   - `http://localhost:8000`
4. 앱 키 탭 → **JavaScript 키** 복사

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:8000` 접속

### 4. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 📁 프로젝트 구조

```
pyeonhangil/
├── package.json
├── vite.config.js
├── index.html
├── .env.example
├── public/
│   ├── pyeonhangil_icon.svg
│   ├── pyeonhangil_icon_128.png
│   └── pyeonhangil_icon_512.png
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles/global.css       # 토스·카카오 디자인 토큰
    ├── hooks/
    │   ├── useAppState.jsx     # 상태 관리 (Context)
    │   ├── useVoice.js         # TTS 음성 안내
    │   ├── useGPS.js           # GPS + 체류 감지
    │   ├── useSpeechRecognition.js  # STT 음성 명령
    │   └── useKakaoMap.js      # 카카오맵 SDK
    ├── components/
    │   ├── TabBar.jsx          # 하단 탭 (홈·지도·가족·내정보)
    │   └── SOSButton.jsx       # 긴급 SOS 플로팅 버튼
    ├── data/
    │   └── pois.js             # 정부 시설 POI 샘플
    └── pages/
        ├── Splash.jsx          # 01 스플래시
        ├── Intro.jsx           # 02~03 온보딩
        ├── Permissions.jsx     # 04 권한 확인
        ├── WalkState.jsx       # 05 걸음 상태 선택 ⭐
        ├── Home.jsx            # 06 홈
        ├── Search.jsx          # 07 음성 검색
        ├── RouteSuggest.jsx    # 08 경로 추천
        ├── MapMain.jsx         # 10 지도 (카카오맵)
        ├── Navigation.jsx      # 13 길 안내 중
        ├── Resting.jsx         # 15 쉬고 계신 중 ⭐
        ├── Arrived.jsx         # 20 도착
        ├── SOS.jsx             # 19 긴급 SOS ⭐
        ├── Family.jsx          # 22 가족
        └── MyInfo.jsx          # 25 내 정보
```

## 🌐 GitHub 업로드 방법

### 처음 업로드하는 경우

터미널을 열고 프로젝트 폴더에서:

```bash
# 1. Git 초기화
git init

# 2. 모든 파일 추가
git add .

# 3. 첫 커밋
git commit -m "편한길 초기 커밋 · Voice + GPS 배리어프리 내비게이션"

# 4. 메인 브랜치 설정
git branch -M main

# 5. 원격 저장소 연결
git remote add origin https://github.com/jinpro0318/pyeonhangil.git

# 6. 업로드
git push -u origin main
```

### 저장소에 이미 다른 내용이 있는 경우

```bash
# 원격 저장소 내용 먼저 가져오기
git pull origin main --allow-unrelated-histories

# 충돌 해결 후 업로드
git push -u origin main
```

### 이후 수정사항 업로드

```bash
git add .
git commit -m "변경 내용 설명"
git push
```

## 🚨 주의사항

### .env 파일 업로드 금지
`.env` 파일에는 카카오 API 키가 들어있어 **절대 GitHub에 업로드하면 안 됩니다**.
`.gitignore`에 이미 포함되어 있어 자동 제외됩니다.

### 브라우저 지원
- **Chrome / Edge** (권장): 음성 인식 완전 지원
- **Safari / Firefox**: 음성 인식 제한, 음성 안내는 작동
- **모바일 Safari/Chrome**: GPS 및 음성 안내 완전 작동

### HTTPS 필요
GPS와 음성 기능은 **HTTPS 환경**에서만 작동합니다.
- 로컬 개발: `localhost`는 예외로 HTTP 가능
- 배포 시: Vercel, Netlify 등 HTTPS 제공 플랫폼 사용

## 🚀 무료 배포 방법

### Vercel (추천)

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 환경변수 설정 (Vercel 대시보드)
# Settings > Environment Variables
# VITE_KAKAO_JS_KEY 추가
```

### Netlify

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 빌드
npm run build

# 배포
netlify deploy --prod --dir=dist
```

### GitHub Pages

```bash
# vite.config.js에 base 경로 추가
# base: '/pyeonhangil/',

npm run build

# gh-pages 브랜치로 배포
npx gh-pages -d dist
```

## 📝 라이선스

MIT License

## 🙏 감사 인사

이 프로젝트는 걸음이 불편하신 제 어머니와, 전국의 모든 이동 약자 1,465만 분과, 그들을 사랑하는 가족 1,300만 분을 위해 만들어졌습니다.

---

> **걷는 분은 귀로 듣고, GPS가 알아서.**
> **동행 가족은 실시간으로 안심.**
> **편한길이 두 사람을 연결합니다.**
