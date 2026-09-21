import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageEmpty({
  title,
  description,
  action,
  className
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'bg-card shadow-md ring-border flex min-h-72 flex-col items-center justify-center rounded-[10px] px-6 py-16 text-center ring-1',
        className
      )}
    >
      <h2 className='text-base font-semibold'>{title}</h2>
      {description ? (
        <p className='text-muted-foreground mt-2 max-w-md text-sm'>
          {description}
        </p>
      ) : null}
      {action ? <div className='mt-6'>{action}</div> : null}
    </div>
  )
}
