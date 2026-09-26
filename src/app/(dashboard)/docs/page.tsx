import { DocTable } from '@/components/docs/doc-table'
import { PageHeader } from '@/components/layout/page-title'
import { PageShell } from '@/components/layout/page-shell'
import { PageSplit } from '@/components/layout/page-split'
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
    <Button nativeButton={false} render={<Link href='/docs/new' />}>
      <Plus />
      导入数据
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
      <PageSplit aside={<DocCateSidebar />}>
        <Suspense fallback={null}>
          <DocTable data={data.docs} total={data.total} pageSize={pageSize} />
        </Suspense>
      </PageSplit>
    </PageShell>
  )
}
