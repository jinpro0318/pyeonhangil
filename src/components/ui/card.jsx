import * as React from 'react'
import { cn } from '@/lib/utils'

// Material 3 Surface — variant 별로 elevation 레벨 적용
// - filled: 회색 톤 (기본 surface variant)
// - elevated: 그림자 강조 (CityTrans 추천 카드 / 지도 위 정보)
// - outlined: 보더만 (정보 그룹)
// - tonal: 의미색 약한 톤 (배리어프리 / 주의 알림)
const CARD_VARIANTS = {
  default:  'bg-white border border-ink-200/80 shadow-sm',     // M3 Filled card
  elevated: 'bg-white border border-ink-200/40 shadow-md',     // M3 Elevated card
  outlined: 'bg-white border border-ink-300',                  // M3 Outlined card
  tonal:    'bg-primary-50 border border-primary-100',         // M3 Tonal (primary)
  success:  'bg-success-50 border border-success/30',          // 배리어프리 OK
  warning:  'bg-warning-50 border border-warning/30',          // 계단 / 주의
}

const Card = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-xl', CARD_VARIANTS[variant] || CARD_VARIANTS.default, className)}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-lg font-bold leading-tight tracking-normal', className)} {...props} />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm text-ink-500', className)} {...props} />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-5 pt-0', className)} {...props} />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
