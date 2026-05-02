import DocCateList from '@/components/doc/doc-cate-list'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader
} from '@/components/ui/sidebar'
import DocCateDialog from './doc-cate-dialog'
import { fetchDocCates } from '@/data-access/doc'

export default async function DocCateSidebar() {
  const cates = await fetchDocCates()

  return (
    <Sidebar collapsible='none' className='flex w-56 border-r'>
      <SidebarHeader className='flex flex-row items-center justify-between gap-3 p-2'>
        <span className='text-base font-medium'>类目</span>
        <DocCateDialog />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className='min-h-0 flex-1 px-0 pt-0'>
          <SidebarGroupContent className='h-full'>
            <DocCateList cates={cates} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
