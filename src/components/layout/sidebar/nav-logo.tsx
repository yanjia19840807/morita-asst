import Image from 'next/image'
import Link from 'next/link'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/layout/sidebar'
import { DEFAULT_AUTH_REDIRECT } from '@/modules/auth/redirect'

export default function NavLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          render={<Link href={DEFAULT_AUTH_REDIRECT} />}
        >
          <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
            <Image
              src='/web-app-manifest-192x192.png'
              alt='云天助手'
              width={32}
              height={32}
              className='rounded-md'
            />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>云天助手</span>
            <span className='text-muted-foreground truncate text-xs'>
              森田疗法 AI
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
