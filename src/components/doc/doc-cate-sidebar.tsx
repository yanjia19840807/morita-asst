import DocCateList from '@/components/doc/doc-cate-list'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader
} from '@/components/ui/sidebar'
import { fetchDocCates } from '@/data-access/doc'
import Link from 'next/link'
import { Button } from '../ui/button'

export default async function DocCateSidebar() {
  const cates = await fetchDocCates()

  return (
    <Sidebar collapsible='none' className='flex w-56 border-r'>
      <SidebarHeader className='flex flex-row items-center justify-between gap-3'>
        <span className='text-base font-medium'>类目</span>
        <Button size='sm' variant='link' asChild>
          <Link href='/documents/categories'>管理</Link>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className='min-h-0 flex-1'>
          <SidebarGroupContent className='h-full'>
            <DocCateList data={cates} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
