import { DocTable } from '@/components/doc/doc-table'
import PageTitle from '@/components/page-title'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import DocCateSidebar from '@/components/doc/doc-cate-sidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import { fetchDocs } from '@/data-access/doc'
import { getPage } from '@/lib/pagination'

interface DocsPageProps {
  page?: number
  categoryId?: string
  filename?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

const pageSize = 10

function ImportBtn() {
  return (
    <Button asChild>
      <Link href='/documents/new'>
        <Plus />
        导入数据
      </Link>
    </Button>
  )
}

export default async function DocsPage({
  searchParams
}: {
  searchParams: Promise<DocsPageProps>
}) {
  const { categoryId, page, filename, sortBy, sortDirection } =
    await searchParams

  const data = await fetchDocs({
    page: getPage(page),
    pageSize,
    filename,
    categoryId,
    sortBy,
    sortDirection
  })

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3 px-4'>
      <PageTitle actionButtons={<ImportBtn />}>文档数据</PageTitle>
      <div className='flex min-h-0 flex-1'>
        <DocCateSidebar />
        <SidebarInset>
          <Suspense fallback={null}>
            <DocTable
              data={data.documents}
              total={data.total}
              pageSize={pageSize}
            />
          </Suspense>
        </SidebarInset>
      </div>
    </div>
  )
}
