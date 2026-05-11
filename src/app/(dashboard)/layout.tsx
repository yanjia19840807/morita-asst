import React from 'react'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/layout/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

import { Separator } from '@/components/ui/separator'
import AppSidebar from '@/components/layout/sidebar/app-sidebar'

function MainLayout({
  children,
  breadcrumb
}: Readonly<{
  children: React.ReactNode
  breadcrumb: React.ReactNode
}>) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className='px-4 py-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
            <div className='flex items-center gap-2'>
              <SidebarTrigger className='-ml-1' />
              <Separator
                orientation='vertical'
                className='mr-2 data-[orientation=vertical]:h-4'
              />
              {breadcrumb}
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default MainLayout
