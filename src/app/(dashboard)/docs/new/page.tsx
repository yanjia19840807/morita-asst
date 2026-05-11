import DocCreateForm from '@/components/docs/doc-create-form'
import { fetchDocCates } from '@/modules/docs/service'
import { Suspense } from 'react'

export default function DocumentNewPage() {
  const docCatesPromise = fetchDocCates()

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <Suspense>
        <DocCreateForm docCatesPromise={docCatesPromise} />
      </Suspense>
    </div>
  )
}
