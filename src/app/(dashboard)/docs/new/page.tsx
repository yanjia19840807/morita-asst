import DocCreateForm from '@/components/docs/doc-create-form'
import { PageShell } from '@/components/layout/page-shell'
import { fetchDocCates } from '@/modules/docs/service'
import { Suspense } from 'react'

export default function DocumentNewPage() {
  const docCatesPromise = fetchDocCates()

  return (
    <PageShell>
      <Suspense>
        <DocCreateForm docCatesPromise={docCatesPromise} />
      </Suspense>
    </PageShell>
  )
}
