'use client'

import { useDocsParams } from '@/hooks/use-docs-params'
import { DocCate } from '@/generated/prisma/client'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

export default function DocCateList({ data }: { data: DocCate[] }) {
  const { categoryId, setCategoryId } = useDocsParams()

  return (
    <SidebarMenu>
      {data.map(item => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            isActive={categoryId === item.id}
            onClick={() => setCategoryId(item.id)}
          >
            <span>{item.name}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
