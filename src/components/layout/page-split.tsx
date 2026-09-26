import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageSplit({
  aside,
  children,
  className
}: {
  aside: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-h-0 flex-1 gap-4 md:gap-6', className)}>
      {aside}
      <div className='flex min-h-0 min-w-0 flex-1 flex-col'>{children}</div>
    </div>
  )
}

export default PageSplit
