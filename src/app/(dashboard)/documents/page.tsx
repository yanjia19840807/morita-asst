import { DocumentTable } from '@/components/document/document-table'
import PageActionBar from '@/components/page-action-bar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React, { Suspense } from 'react'

export default function DocsPage() {
  return (
    <div>
      <PageActionBar>
        <Button asChild>
          <Link href='/documents/new'>
            <Plus />
            导入数据
          </Link>
        </Button>
      </PageActionBar>
      <Suspense fallback={<div>Loading...</div>}>
        <DocumentTable data={[]} total={0} pageSize={10} />
      </Suspense>
    </div>
  )
}
