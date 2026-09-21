import DocCateList from '@/components/docs/doc-cate-list'
import { PageAside } from '@/components/layout/page-aside'
import { fetchDocCates } from '@/modules/docs/service'
import Link from 'next/link'
import { Button } from '../ui/button'

export default async function DocCateSidebar() {
  const cates = await fetchDocCates()

  return (
    <PageAside
      title='类目'
      actions={
        <Button size='sm' variant='link' asChild>
          <Link href='/docs/categories'>管理</Link>
        </Button>
      }
    >
      <DocCateList data={cates} />
    </PageAside>
  )
}
