import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageShell({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col gap-4 px-4 pt-4 pb-6 md:gap-6 md:px-6 md:pb-8',
        className
      )}
    >
      {children}
    </div>
  )
}

export default PageShell
