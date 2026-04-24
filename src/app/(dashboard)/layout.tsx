import React from 'react'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import AppSidebar from '@/components/sidebar/app-sidebar'

import { Separator } from '@/components/ui/separator'

function MainLayout({
  children,
  breadcrumb,
  toolbar
}: Readonly<{
  children: React.ReactNode
  breadcrumb: React.ReactNode
  toolbar: React.ReactNode
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
            <div className='flex items-center justify-end gap-2'>{toolbar}</div>
          </header>
          <div className='flex flex-col gap-4 p-4 pt-0'>{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default MainLayout
