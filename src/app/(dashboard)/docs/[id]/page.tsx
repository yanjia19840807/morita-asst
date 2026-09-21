import { DocDetail } from '@/components/docs/doc-detail'
import { PageShell } from '@/components/layout/page-shell'
import { fetchDocById } from '@/modules/docs/service'

export default async function DocDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const doc = await fetchDocById(id)

  return (
    <PageShell>
      <DocDetail doc={doc} />
    </PageShell>
  )
}
