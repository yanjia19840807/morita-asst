import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function ListStack({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col gap-4 md:gap-6', className)}>
      {children}
    </div>
  )
}

export default ListStack
