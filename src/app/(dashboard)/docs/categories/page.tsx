import PageTitle from '@/components/layout/page-title'
import DocCateForm from '@/components/doc/doc-cate-form'
import DocCateTable from '@/components/doc/doc-cate-table'
import { fetchDocCates } from '@/dal/docs'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

interface DocsPageProps {
  name?: string
}

export default async function DocsPage({
  searchParams
}: {
  searchParams: Promise<DocsPageProps>
}) {
  const { name } = await searchParams
  const cates = await fetchDocCates()

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Link
              href='/documents'
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
