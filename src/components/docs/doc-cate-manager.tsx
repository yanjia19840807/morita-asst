'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, ChevronLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-title'
import { ListStack } from '@/components/layout/list-stack'
import { PagePanel } from '@/components/layout/page-panel'
import { Button, buttonVariants } from '@/components/ui/button'
import DocCateForm from './doc-cate-form'
import DocCateTable from './doc-cate-table'
import type { DocCateRow } from '@/modules/docs/service'

export default function DocCateManager({ data }: { data: DocCateRow[] }) {
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  return (
    <ListStack>
      <PageHeader
        title='文档类目'
        description='新建、重命名、排序文档分类'
        actions={
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              disabled={creating}
              onClick={() => setCreating(true)}
            >
              <Plus />
              新建类目
            </Button>
            <Link
              href='/docs'
              className={buttonVariants({
                variant: 'ghost'
              })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      />
      {creating ? (
        <PagePanel
          title='新建类目'
          description='名称需唯一，创建后可随时改名或调整顺序'
        >
          <DocCateForm
            onCancel={() => setCreating(false)}
            onCreated={() => {
              setCreating(false)
              router.refresh()
            }}
          />
        </PagePanel>
      ) : null}
      <DocCateTable data={data} />
    </ListStack>
  )
}
