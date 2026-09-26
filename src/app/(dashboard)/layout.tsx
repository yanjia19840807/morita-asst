import React from 'react'
import AppHeader from '@/components/layout/app-header'
import AppSidebar from '@/components/layout/sidebar/app-sidebar'
import {
  SidebarInset,
  SidebarProvider
} from '@/components/layout/sidebar'
import { DashboardHeaderProvider } from '@/components/layout/page-header-context'
import { PageToolbar } from '@/components/layout/page-toolbar'
import { TooltipProvider } from '@/components/ui/tooltip'

function MainLayout({
  children
}: Readonly<{
  children: React.ReactNode
  breadcrumb: React.ReactNode
}>) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardHeaderProvider>
          <AppSidebar />
          <SidebarInset className='min-w-0'>
            <AppHeader />
            <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto'>
              <PageToolbar />
              {children}
            </div>
          </SidebarInset>
        </DashboardHeaderProvider>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default MainLayout
