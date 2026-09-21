'use client'

import { usePathname } from 'next/navigation'
import AppBreadCrumb, {
  getPathnameSegments
} from '@/components/layout/app-breadcrumb'
import { useDashboardHeader } from '@/components/layout/page-header-context'

export function PageToolbar() {
  const header = useDashboardHeader()
  const pathname = usePathname()
  const segments = getPathnameSegments(pathname)

  if (segments.length === 0) {
    return null
  }

  return (
    <div className='flex items-center justify-between gap-3 px-4 pt-4 md:px-6'>
      <div className='min-w-0 flex-1'>
        <AppBreadCrumb segments={segments} />
      </div>
      {header?.actions ? (
        <div className='flex shrink-0 flex-wrap items-center justify-end gap-2'>
          {header.actions}
        </div>
      ) : null}
    </div>
  )
}
