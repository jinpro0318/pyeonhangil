/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        // DESIGN_SYSTEM.md 기준 — Primary Blue #1A8FE3
        primary: {
          50: '#EAF6FE',
          100: '#C7E6FB',
          200: '#A0D3F8',
          300: '#6EB9F0',
          400: '#3D9FE7',
          500: '#1A8FE3',
          600: '#1576BB',
          700: '#105D93',
          800: '#0B446B',
          DEFAULT: '#1A8FE3',
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
        // shadcn 의미적 토큰 — DESIGN_SYSTEM.md 정렬
        border: '#D4DCE4',
        input: '#D4DCE4',
        ring: '#1A8FE3',
        background: '#EAF6FE',
        foreground: '#1A2B3C',
        muted: { DEFAULT: '#F4F7FA', foreground: '#5A7080' },
        secondary: { DEFAULT: '#FFFFFF', foreground: '#1A2B3C' },
        destructive: { DEFAULT: '#DC2626', foreground: '#FFFFFF' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#1A2B3C' },
        card: { DEFAULT: '#FFFFFF', foreground: '#1A2B3C' },
      },
      // Material 3 Shape Scale (none/xs/sm/md/lg/xl/full) + 디자인 시스템 카드 12px
      borderRadius: {
        DEFAULT: '8px',     // chip / button (--radius-chip)
        xs: '4px',          // M3 xs
        sm: '8px',          // M3 sm — chip · button
        md: '12px',         // M3 md — card (--radius-card)
        lg: '16px',         // M3 lg — surface
        xl: '12px',         // 호환: 기존 코드 다수가 rounded-xl 사용 (= 카드 12px)
        '2xl': '20px',      // M3 컨테이너
        '3xl': '28px',      // M3 xl — large container
      },
      // Material 3 Elevation (Level 1~5) — 카드/시트/FAB
      boxShadow: {
        sm: '0 1px 2px rgba(26,43,60,0.05)',                                          // M3 Level 1
        DEFAULT: '0 1px 3px rgba(26,43,60,0.10), 0 1px 2px rgba(26,43,60,0.06)',      // M3 Level 1+
        md: '0 4px 8px rgba(26,43,60,0.08), 0 2px 4px rgba(26,43,60,0.06)',           // M3 Level 2
        lg: '0 10px 20px rgba(26,43,60,0.10), 0 4px 8px rgba(26,43,60,0.06)',         // M3 Level 3
        xl: '0 18px 32px rgba(26,43,60,0.14), 0 8px 16px rgba(26,43,60,0.08)',        // M3 Level 4
        '2xl': '0 24px 48px rgba(26,43,60,0.18), 0 12px 24px rgba(26,43,60,0.10)',    // M3 Level 5
        primary: '0 8px 20px rgba(26,143,227,0.30)',                                  // CTA blue glow
        success: '0 8px 20px rgba(62,190,110,0.28)',                                  // 배리어프리 OK glow
        warning: '0 8px 20px rgba(232,93,36,0.28)',                                   // 계단/주의 glow
        danger: '0 8px 20px rgba(220,38,38,0.28)',                                    // SOS glow
        fab: '0 6px 12px rgba(26,143,227,0.36), 0 2px 4px rgba(26,43,60,0.10)',       // FAB Level 3
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
