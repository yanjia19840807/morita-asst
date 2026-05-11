import PageTitle from '@/components/layout/page-title'
import { fetchDocCates } from '@/modules/docs/service'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import DocCateForm from '@/components/docs/doc-cate-form'
import DocCateTable from '@/components/docs/doc-cate-table'

interface DocsPageProps {
  name?: string
}

export default async function DocsPage({
  searchParams
}: {
  searchParams: Promise<DocsPageProps>
}) {
  await searchParams
  const cates = await fetchDocCates()

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Link
              href='/docs'
              className={buttonVariants({
                variant: 'ghost'
              })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      >
        文档类目
      </PageTitle>
      <DocCateForm className='h-min-16' />
      <DocCateTable data={cates} />
    </div>
  )
}
