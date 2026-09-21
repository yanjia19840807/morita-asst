'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/layout/sidebar'
import { isNavActive, menuConfig } from '@/modules/layout'
import NavLogo from './nav-logo'

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        {menuConfig.map((group, gIndex) => (
          <SidebarGroup key={gIndex}>
            <SidebarGroupLabel className='text-[11px] tracking-[0.08em] uppercase'>
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map(item => {
                const active = item.url ? isNavActive(pathname, item.url) : false

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <Link href={item.url ?? '#'}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
