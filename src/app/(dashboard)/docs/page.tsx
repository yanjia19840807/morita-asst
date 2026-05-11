import { DocTable } from '@/components/docs/doc-table'
import PageTitle from '@/components/layout/page-title'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import DocCateSidebar from '@/components/docs/doc-cate-sidebar'
import { SidebarInset } from '@/components/layout/sidebar'
import { fetchDocs } from '@/modules/docs/service'
import { getPage } from '@/lib/pagination'
import { FetchDocsParams } from '@/modules/docs/schemas'

function ImportBtn() {
  return (
    <Button asChild>
      <Link href='/docs/new'>
        <Plus />
        导入数据
      </Link>
    </Button>
  )
}

export default async function DocsPage({
  searchParams
}: {
  searchParams: Promise<FetchDocsParams>
}) {
  const { categoryId, page, searchField, searchValue, sortBy, sortDirection } =
    await searchParams
  const pageSize = 10

  const data = await fetchDocs({
    page: getPage(page),
    pageSize,
    searchField,
    searchValue,
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
            <DocTable data={data.docs} total={data.total} pageSize={pageSize} />
          </Suspense>
        </SidebarInset>
      </div>
    </div>
  )
}
