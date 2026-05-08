'use client'

import { ChevronRight } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/layout/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { menuConfig } from '@/lib/side-menu'
import NavLogo from './nav-logo'
import NavUser from './nav-user'

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        {menuConfig.map((group, gIndex) => (
          <SidebarGroup key={gIndex}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map(item => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className='data-[state=open]:rotate-90'>
                            <ChevronRight />
                            <span className='sr-only'>Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map(subItem => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <a href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
