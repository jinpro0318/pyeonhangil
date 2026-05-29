import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Material 3 Button — Filled / Tonal / Outlined / Text / Elevated + FAB
// CityTrans 패턴: 도보·교통 화면에 어울리도록 success/warning 의미색 + FAB 포함
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-base font-semibold tracking-normal transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:shrink-0 active:scale-[0.98]',
  {
    variants: {
      variant: {
        // spec Primary Button — #3F52B4, CTA
        default: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 shadow-primary',
        // spec Tonal — 보조 액션 (연한 인디고)
        tonal: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
        // spec Outline Button — 1.5px 인디고 보더
        outline: 'border-[1.5px] border-primary bg-transparent text-primary hover:bg-primary-50',
        // Text — 가장 약한 액션 (취소 / 더보기)
        ghost: 'text-primary hover:bg-primary-50',
        // Elevated — 흰 배경 + 그림자 (지도 위 컨트롤)
        secondary: 'bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 shadow-md',
        // spec Secondary Pink — 배지/강조 액션
        pink: 'bg-pink text-white hover:bg-pink-600 active:bg-pink-700 shadow-pink',
        // 위험 / SOS
        destructive: 'bg-danger text-white hover:bg-danger-600 shadow-danger',
        // 배리어프리 OK (Success Green)
        success: 'bg-success text-white hover:bg-success-600 shadow-success',
        // 계단 / 주의 (Warning Orange)
        warning: 'bg-warning text-white hover:bg-warning-600 shadow-warning',
        // Link
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-[48px] px-5 py-3 text-base [&_svg]:w-5 [&_svg]:h-5',       // M3 권장 48px
        sm: 'min-h-[40px] px-4 py-2 text-sm rounded-sm [&_svg]:w-4 [&_svg]:h-4',
        lg: 'min-h-[56px] px-6 py-4 text-lg [&_svg]:w-5 [&_svg]:h-5',
        xl: 'min-h-[60px] px-6 py-4 text-[17px] rounded-xl [&_svg]:w-5 [&_svg]:h-5', // CityTrans CTA
        icon: 'h-12 w-12 [&_svg]:w-5 [&_svg]:h-5',                                  // 48×48
        iconSm: 'h-9 w-9 rounded-sm [&_svg]:w-4 [&_svg]:h-4',
        // Material 3 FAB sizes (rounded-full)
        fab: 'h-14 w-14 rounded-full shadow-fab [&_svg]:w-6 [&_svg]:h-6',           // M3 Regular FAB 56×56
        fabSm: 'h-10 w-10 rounded-full shadow-md [&_svg]:w-5 [&_svg]:h-5',          // M3 Small FAB 40×40
        fabLg: 'h-24 w-24 rounded-[28px] shadow-fab [&_svg]:w-9 [&_svg]:h-9',       // M3 Large FAB 96×96
        // CityTrans 가로형 FAB (Extended FAB)
        fabExt: 'h-14 px-5 rounded-full shadow-fab text-[15px] [&_svg]:w-5 [&_svg]:h-5',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
