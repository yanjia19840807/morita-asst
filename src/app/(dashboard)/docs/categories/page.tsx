import { PageShell } from '@/components/layout/page-shell'
import { fetchDocCates } from '@/modules/docs/service'
import DocCateManager from '@/components/docs/doc-cate-manager'

export default async function DocCategoriesPage() {
  const cates = await fetchDocCates()

  return (
    <PageShell>
      <DocCateManager data={cates} />
    </PageShell>
  )
}
