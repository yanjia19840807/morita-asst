import { PageHeader } from '@/components/layout/page-title'
import { PageShell } from '@/components/layout/page-shell'
import { PageEmpty } from '@/components/layout/page-empty'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BookmarkDetailPage() {
  return (
    <PageShell>
      <PageHeader
        title='书签详情'
        description='查看已收藏的内容'
        actions={
          <Button variant='ghost' asChild>
            <Link href='/bookmarks'>返回</Link>
          </Button>
        }
      />
      <PageEmpty
        title='书签详情尚未开放'
        description='收藏功能还在建设中，详情页稍后会补上。'
        action={
          <Button variant='outline' asChild>
            <Link href='/bookmarks'>返回书签</Link>
          </Button>
        }
      />
    </PageShell>
  )
}
