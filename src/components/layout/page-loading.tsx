import { PageShell } from '@/components/layout/page-shell'
import { Skeleton } from '@/components/ui/skeleton'

export function PageLoading() {
  return (
    <PageShell>
      <div className='flex items-start justify-between gap-4'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-28' />
          <Skeleton className='h-4 w-48' />
        </div>
        <Skeleton className='h-9 w-28' />
      </div>
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className='h-44 w-full rounded-[10px]' />
        ))}
      </div>
    </PageShell>
  )
}
