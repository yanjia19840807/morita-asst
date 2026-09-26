import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { PagePanel } from '@/components/layout/page-panel'

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
    <aside className={cn('flex w-56 shrink-0 flex-col', className)}>
      <PagePanel title={title} action={actions}>
        <div className='min-h-0 flex-1'>{children}</div>
      </PagePanel>
    </aside>
  )
}

export default PageAside
