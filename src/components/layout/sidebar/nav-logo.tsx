import React from 'react'
import Image from 'next/image'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/layout/sidebar'

export default function NavLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' asChild>
          <a href='#'>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square items-center justify-center rounded-lg'>
              <Image
                src={'/web-app-manifest-192x192.png'}
                alt='logo'
                width={32}
                height={32}
                className='rounded-md'
              />
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>云天助手</span>
              <span className='truncate text-xs'>森田疗法AI平台</span>
            </div>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
