import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-primary-800/35 backdrop-blur-sm data-[state=open]:animate-fade-in',
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = 'SheetOverlay'

const sheetVariants = cva(
  'fixed z-50 bg-white shadow-xl transition ease-in-out data-[state=open]:animate-slide-up',
  {
    variants: {
      side: {
        bottom: 'inset-x-0 bottom-0 rounded-t-3xl max-h-[85vh] overflow-y-auto',
        top: 'inset-x-0 top-0 rounded-b-3xl',
        left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm',
        right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm',
      },
    },
    defaultVariants: { side: 'bottom' },
  }
)

const SheetContent = React.forwardRef(({ side = 'bottom', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      {side === 'bottom' && (
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-ink-200 rounded-full" />
        </div>
      )}
      <div className="px-5 pb-5">{children}</div>
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-2 text-ink-500 hover:bg-ink-100">
        <X className="h-5 w-5" />
        <span className="sr-only">닫기</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = 'SheetContent'

const SheetHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
)
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-xl font-extrabold tracking-tight', className)} {...props} />
))
SheetTitle.displayName = 'SheetTitle'
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-ink-500', className)} {...props} />
))
SheetDescription.displayName = 'SheetDescription'

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription }
