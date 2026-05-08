import DocCreateForm from '@/components/doc/doc-create-form'
import { fetchDocCates } from '@/dal/docs'
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
