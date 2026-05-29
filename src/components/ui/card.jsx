import * as React from 'react'
import { cn } from '@/lib/utils'

// Material 3 Surface — variant 별로 elevation 레벨 적용
// - filled: 회색 톤 (기본 surface variant)
// - elevated: 그림자 강조 (CityTrans 추천 카드 / 지도 위 정보)
// - outlined: 보더만 (정보 그룹)
// - tonal: 의미색 약한 톤 (배리어프리 / 주의 알림)
// spec Card — radius 16px, shadow 0 2px 12px rgba(0,0,0,.08)
const CARD_VARIANTS = {
  default:  'bg-white border border-black/[0.04] shadow-card',  // spec Card
  elevated: 'bg-white border border-black/[0.04] shadow-md',    // 살짝 더 떠 보이는 카드
  outlined: 'bg-white border border-ink-200',                   // 보더만
  tonal:    'bg-primary-50 border border-primary-100',          // 연한 인디고
  pink:     'bg-pink-50 border border-pink-100',                // 핑크 강조 카드
  success:  'bg-success-50 border border-success/30',           // 배리어프리 OK
  warning:  'bg-warning-50 border border-warning/30',           // 계단 / 주의
}

const Card = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-[16px]', CARD_VARIANTS[variant] || CARD_VARIANTS.default, className)}
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
