/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Inter 우선 → 숫자/영문은 Inter, 한글 글리프는 Pretendard로 자동 폴백
        sans: ['Inter', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        // TripMate Design Spec — Primary Indigo #3F52B4 (Default 700) / Pressed #323D76
        primary: {
          50: '#EEF0FA',   // spec Weak 50 (background, subtle)
          100: '#DCE0F4',
          200: '#B9C1E7',
          300: '#8E9AD7',
          400: '#6373C3',
          500: '#3F52B4',  // spec Default — buttons, links, CTA, icons
          600: '#37489D',
          700: '#323D76',  // spec Pressed 900 (hover/pressed)
          800: '#28315F',
          900: '#1F2647',
          DEFAULT: '#3F52B4',
          foreground: '#FFFFFF',
        },
        // TripMate Secondary (Pink/Magenta) — badges, accent buttons
        pink: {
          50: '#FCEEF3',   // spec Weak 50
          100: '#F7D3E0',
          200: '#EFA8C0',
          300: '#E27199',
          400: '#CE4675',
          500: '#B22459',  // spec Default 700
          600: '#9A1F4D',
          700: '#7A1A3D',  // spec Pressed 900
          DEFAULT: '#B22459',
          foreground: '#FFFFFF',
        },
        ink: {
          50: '#F4F7FA',
          100: '#E7ECF1',
          200: '#D4DCE4',
          300: '#B0BBC7',
          400: '#8593A2',
          500: '#5A7080',       // Text Secondary
          700: '#2F4456',
          900: '#1A2B3C',       // Text Primary
        },
        // Success Green #3EBE6E (배리어프리 가능 / 엘리베이터 / 경사로)
        success: {
          50: '#ECFAF1',
          100: '#C8F2D7',
          500: '#3EBE6E',
          600: '#319B58',
          700: '#257842',
          DEFAULT: '#3EBE6E',
        },
        // Warning Orange #E85D24 (계단 / 장벽 / 접근 불가)
        warning: {
          50: '#FCE9E0',
          100: '#F9D0BD',
          500: '#E85D24',
          600: '#C84A19',
          700: '#A23B13',
          DEFAULT: '#E85D24',
        },
        danger: { 50: '#FEF2F2', 500: '#DC2626', 600: '#B91C1C', DEFAULT: '#DC2626' },
        // Accent Teal #2CC6A0 (선택 상태 / 포커스 링)
        accent: {
          50: '#E5F8F2',
          100: '#BFEFE0',
          500: '#2CC6A0',
          600: '#21A283',
          DEFAULT: '#2CC6A0',
        },
        teal: { 50: '#E5F8F2', 500: '#2CC6A0', 600: '#21A283', DEFAULT: '#2CC6A0' },
        // 카테고리·걸음 상태
        cat: {
          rest: '#22C55E',
          'rest-soft': '#DCFCE7',
          toilet: '#3182F6',
          'toilet-soft': '#E8F3FF',
          elev: '#A855F7',
          'elev-soft': '#F3E8FF',
          cross: '#F04452',
          'cross-soft': '#FFE8EA',
          ramp: '#F59E0B',
          'ramp-soft': '#FEF3C7',
        },
        walk: {
          slow: '#22C55E',
          'slow-soft': '#DCFCE7',
          'very-slow': '#F59E0B',
          'very-slow-soft': '#FEF3C7',
          'needs-help': '#F04452',
          'needs-help-soft': '#FFE8EA',
          stroller: '#A855F7',
          'stroller-soft': '#F3E8FF',
        },
        // shadcn 의미적 토큰 — TripMate Design Spec 정렬
        border: '#E2E3EC',          // 연한 보더 (spec Border #9C9FAF는 인풋 전용으로만 사용)
        input: '#C9CBDA',
        ring: '#3F52B4',
        background: '#F5F5F5',      // spec Background Alt — 카드(흰색)가 떠 보이도록
        foreground: '#1E1E1E',      // spec Text Primary
        muted: { DEFAULT: '#F4F7FA', foreground: '#5A7080' },
        secondary: { DEFAULT: '#FFFFFF', foreground: '#1A2B3C' },
        destructive: { DEFAULT: '#DC2626', foreground: '#FFFFFF' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#1A2B3C' },
        card: { DEFAULT: '#FFFFFF', foreground: '#1A2B3C' },
      },
      // Material 3 Shape Scale (none/xs/sm/md/lg/xl/full) + 디자인 시스템 카드 12px
      borderRadius: {
        DEFAULT: '12px',    // spec button / input
        xs: '4px',
        sm: '8px',          // 작은 칩 · 작은 버튼
        md: '12px',         // spec button / input
        lg: '16px',         // spec card
        xl: '16px',         // spec card — 기존 rounded-xl 카드 다수를 16px로 정렬
        '2xl': '20px',      // 큰 컨테이너 / 바텀시트
        '3xl': '28px',      // large container
      },
      // Material 3 Elevation (Level 1~5) — 카드/시트/FAB
      boxShadow: {
        sm: '0 1px 2px rgba(30,30,30,0.05)',                                          // M3 Level 1
        DEFAULT: '0 1px 3px rgba(30,30,30,0.10), 0 1px 2px rgba(30,30,30,0.06)',      // M3 Level 1+
        card: '0 2px 12px rgba(0,0,0,0.08)',                                          // spec Card shadow
        md: '0 2px 12px rgba(0,0,0,0.08)',                                            // spec Card shadow
        lg: '0 10px 20px rgba(30,30,30,0.10), 0 4px 8px rgba(30,30,30,0.06)',         // M3 Level 3
        xl: '0 18px 32px rgba(30,30,30,0.14), 0 8px 16px rgba(30,30,30,0.08)',        // M3 Level 4
        '2xl': '0 24px 48px rgba(30,30,30,0.18), 0 12px 24px rgba(30,30,30,0.10)',    // M3 Level 5
        primary: '0 4px 12px rgba(63,82,180,0.30)',                                   // spec Button shadow (indigo)
        pink: '0 4px 12px rgba(178,36,89,0.30)',                                      // accent button glow
        success: '0 8px 20px rgba(62,190,110,0.28)',                                  // 배리어프리 OK glow
        warning: '0 8px 20px rgba(232,93,36,0.28)',                                   // 계단/주의 glow
        danger: '0 8px 20px rgba(220,38,38,0.28)',                                    // SOS glow
        fab: '0 6px 12px rgba(63,82,180,0.36), 0 2px 4px rgba(30,30,30,0.10)',        // FAB Level 3
      },
      letterSpacing: {
        tighter: '0',
        tight: '0',
        normal: '0',
      },
      keyframes: {
        'voice-pulse': {
          '0%,100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        'gps-blink': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'voice-pulse': 'voice-pulse 1.8s ease-in-out infinite',
        'gps-blink': 'gps-blink 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'check-pop': 'check-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
