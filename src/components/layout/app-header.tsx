'use client'

import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import UserAvatar from '@/components/user-avatar'
import { SidebarTrigger } from '@/components/layout/sidebar'
import { useDashboardHeader } from '@/components/layout/page-header-context'
import { getRouteLabel } from '@/modules/layout'

export default function AppHeader() {
  const header = useDashboardHeader()
  const pathname = usePathname()
  const fallbackTitle = getRouteLabel(
    pathname.split('/').filter(Boolean).at(-1) ?? ''
  )
  const title = header?.title ?? fallbackTitle

  return (
    <header className='bg-background shrink-0 border-b'>
      <div className='flex min-h-16 items-center gap-3 px-4 py-2.5 md:px-6'>
        <SidebarTrigger className='shrink-0' />
        <div className='min-w-0 flex-1'>
          {title ? (
            <h1 className='truncate text-base font-semibold tracking-tight'>
              {title}
            </h1>
          ) : null}
          {header?.description ? (
            <p className='text-muted-foreground truncate text-sm'>
              {header.description}
            </p>
          ) : null}
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <ThemeToggle />
          <UserAvatar />
        </div>
      </div>
    </header>
  )
}
