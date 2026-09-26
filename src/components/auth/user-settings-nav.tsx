'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IdCard, KeyRound, UserRound } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from '@/components/ui/sidebar'

export function UserSettingsNav({
  userId,
  showProfile,
  disabledSections = []
}: {
  userId?: string
  showProfile: boolean
  disabledSections?: Array<'security' | 'profile'>
}) {
  const pathname = usePathname()
  const accountHref = userId ? `/users/${userId}` : '/users/new'
  const editHref = userId ? `/users/${userId}/edit` : undefined
  const securityHref = userId ? `/users/${userId}/security` : undefined
  const profileHref = userId ? `/users/${userId}/user-profile` : undefined
  const securityDisabled = disabledSections.includes('security') || !securityHref
  const profileDisabled = disabledSections.includes('profile') || !profileHref

  const items = [
    {
      href: accountHref,
      label: '账号资料',
      icon: IdCard,
      disabled: false,
      isActive:
        pathname === accountHref ||
        pathname === '/users/new' ||
        Boolean(editHref && pathname === editHref)
    },
    {
      href: securityHref,
      label: '安全',
      icon: KeyRound,
      disabled: securityDisabled,
      isActive: Boolean(securityHref && pathname === securityHref)
    },
    ...(showProfile
      ? [
          {
            href: profileHref,
            label: '画像',
            icon: UserRound,
            disabled: profileDisabled,
            isActive: Boolean(
              profileHref && pathname.startsWith(profileHref)
            )
          }
        ]
      : [])
  ]

  return (
    <SidebarProvider
      className='min-h-0 w-auto min-w-0'
      style={{ '--sidebar-width': '14rem' } as CSSProperties}
    >
      <Sidebar collapsible='none' className='border-r'>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>设置</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(item => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      isActive={item.isActive}
                      disabled={item.disabled}
                      render={
                        item.disabled || !item.href ? undefined : (
                          <Link href={item.href} />
                        )
                      }
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
