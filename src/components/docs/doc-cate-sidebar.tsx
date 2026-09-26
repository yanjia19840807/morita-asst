import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Settings2 } from 'lucide-react'
import DocCateList from '@/components/docs/doc-cate-list'
import { fetchDocCates } from '@/modules/docs/service'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarProvider
} from '@/components/ui/sidebar'

export default async function DocCateSidebar() {
  const cates = await fetchDocCates()

  return (
    <SidebarProvider
      className='min-h-0 w-auto min-w-0'
      style={{ '--sidebar-width': '14rem' } as CSSProperties}
    >
      <Sidebar collapsible='none' className='border-r'>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>类目</SidebarGroupLabel>
            <SidebarGroupAction
              title='管理'
              render={<Link href='/docs/categories' />}
            >
              <Settings2 />
              <span className='sr-only'>管理</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <DocCateList data={cates} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
