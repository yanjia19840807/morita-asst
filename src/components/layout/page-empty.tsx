import type { ReactNode } from 'react'
import { PagePanel } from '@/components/layout/page-panel'

export function PageEmpty({
  title,
  description,
  action
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <PagePanel>
      <div className='flex min-h-64 flex-col items-center justify-center py-10 text-center'>
        <h2 className='text-base font-semibold'>{title}</h2>
        {description ? (
          <p className='text-muted-foreground mt-2 max-w-md text-sm'>
            {description}
          </p>
        ) : null}
        {action ? <div className='mt-6'>{action}</div> : null}
      </div>
    </PagePanel>
  )
}

export default PageEmpty
