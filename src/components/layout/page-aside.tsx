import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageAside({
  title,
  actions,
  children,
  className
}: {
  title?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <aside
      className={cn('flex w-56 shrink-0 flex-col border-r pr-6', className)}
    >
      {title || actions ? (
        <div className='flex items-center justify-between gap-2 pb-3'>
          {title ? <div className='text-sm font-medium'>{title}</div> : null}
          {actions}
        </div>
      ) : null}
      <div className='min-h-0 flex-1'>{children}</div>
    </aside>
  )
}

export default PageAside
