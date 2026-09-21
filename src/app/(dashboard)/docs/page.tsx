import { DocTable } from '@/components/docs/doc-table'
import { PageHeader } from '@/components/layout/page-title'
import { PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import DocCateSidebar from '@/components/docs/doc-cate-sidebar'
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
    <PageShell>
      <PageHeader
        title='文档'
        description='上传、分类并检索文档资料'
        actions={<ImportBtn />}
      />
      <div className='flex min-h-0 flex-1'>
        <DocCateSidebar />
        <div className='flex min-h-0 flex-1 flex-col'>
          <Suspense fallback={null}>
            <DocTable data={data.docs} total={data.total} pageSize={pageSize} />
          </Suspense>
        </div>
      </div>
    </PageShell>
  )
}
