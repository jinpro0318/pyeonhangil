import { Toaster as Sonner } from 'sonner'

export function Toaster(props) {
  return (
    <Sonner
      position="top-center"
      richColors
      closeButton={false}
      duration={2500}
      toastOptions={{
        classNames: {
          toast: 'rounded-2xl shadow-lg border border-ink-100 font-medium',
          title: 'font-bold text-ink-900',
          description: 'text-ink-500',
        },
      }}
      {...props}
    />
  )
}
