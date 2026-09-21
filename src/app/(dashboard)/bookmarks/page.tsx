import { PageHeader } from '@/components/layout/page-title'
import { PageShell } from '@/components/layout/page-shell'
import { PageEmpty } from '@/components/layout/page-empty'

export default function BookmarksPage() {
  return (
    <PageShell>
      <PageHeader
        title='书签'
        description='收藏常用内容，方便下次打开'
      />
      <PageEmpty
        title='还没有书签'
        description='收藏助手、文档或知识库后，会显示在这里。'
      />
    </PageShell>
  )
}
