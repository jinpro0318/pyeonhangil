import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-bold tracking-normal transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&_svg]:shrink-0 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-600 shadow-primary',
        secondary: 'bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 shadow-sm',
        ghost: 'text-ink-700 hover:bg-ink-100',
        outline: 'border border-ink-200 bg-white text-ink-900 hover:bg-ink-50 shadow-sm',
        destructive: 'bg-danger text-white hover:bg-danger-600 shadow-danger',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-[52px] px-5 py-3 text-base [&_svg]:w-5 [&_svg]:h-5',
        sm: 'min-h-[40px] px-4 py-2 text-sm rounded-md [&_svg]:w-4 [&_svg]:h-4',
        lg: 'min-h-[60px] px-6 py-4 text-lg [&_svg]:w-5 [&_svg]:h-5',
        xl: 'min-h-[58px] px-6 py-4 text-[17px] rounded-xl [&_svg]:w-5 [&_svg]:h-5',
        icon: 'h-11 w-11 [&_svg]:w-5 [&_svg]:h-5',
        iconSm: 'h-9 w-9 rounded-md [&_svg]:w-4 [&_svg]:h-4',
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
