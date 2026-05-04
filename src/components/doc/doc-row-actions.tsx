'use client'

import { Row } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import ConfirmDialog from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import type { DocRow } from '@/data-access/doc'

interface DocRowActionsProps {
  row: Row<DocRow>
}

export function DocRowActions({ row }: DocRowActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRemove = () => {
    startTransition(async () => {
      try {
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error(
          error instanceof Error ? error.message : '操作失败，请稍后重试'
        )
      }
    })
  }

  return (
    <div className='flex items-center justify-end gap-2 whitespace-nowrap'>
      <ConfirmDialog
        title='删除文档'
        description={`确认删除文档"${row.original.filename}"吗？此操作不可撤销。`}
        actions={{
          label: '删除',
          onClick: handleRemove,
          className:
            'bg-destructive text-destructive-foreground hover:bg-destructive/90'
        }}
      >
        <Button size='sm' variant='destructive' disabled={isPending}>
          {isPending && <Loader2 className='h-4 w-4 animate-spin' />}
          <span>删除</span>
        </Button>
      </ConfirmDialog>
    </div>
  )
}
