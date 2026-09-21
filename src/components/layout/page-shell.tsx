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
        'flex min-h-0 flex-1 flex-col gap-6 px-4 pt-4 pb-8 md:px-6',
        className
      )}
    >
      {children}
    </div>
  )
}

export default PageShell
