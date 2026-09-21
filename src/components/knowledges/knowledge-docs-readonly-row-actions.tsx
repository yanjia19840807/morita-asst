'use client'

import { AlertCircle, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  getKnowledgeDocsQueryKey,
  getKnowledgeQueryKey
} from '@/modules/knowledges/client'
import { removeKnowledgeDocAction } from '@/modules/knowledges/actions'
import { reindexKnowledgeDocAction } from '@/modules/knowledges/indexing/actions'
import { getKnowledgeIndexSummaryQueryKey } from '@/modules/knowledges/indexing/client'
import type { KnowledgeDocListItemDto } from '@/modules/knowledges/dto'

export function KnowledgeDocsReadonlyRowActions({
  item
}: {
  item: KnowledgeDocListItemDto
}) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [isRemoving, startRemove] = useTransition()
  const processing = ['LOADING', 'SPLITTING', 'EMBEDDING'].includes(item.status)

  const invalidateDocs = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: getKnowledgeIndexSummaryQueryKey(item.knowledgeId)
      }),
      queryClient.invalidateQueries({
        queryKey: getKnowledgeDocsQueryKey({
          knowledgeId: item.knowledgeId
        })
      }),
      queryClient.invalidateQueries({
        queryKey: getKnowledgeQueryKey(item.knowledgeId)
      })
    ])

  const handleReindex = () => {
    startTransition(async () => {
      try {
        const result = await reindexKnowledgeDocAction(
          item.id,
          item.knowledgeId
        )

        if (!result.success) {
          toast.error(result.error.message)
          return
        }

        toast.success(`已提交文档“${item.filename}”的重新索引任务`)
        await invalidateDocs()
      } catch (error) {
        console.error(error)
        toast.error(
          error instanceof Error ? error.message : '操作失败，请稍后重试'
        )
      }
    })
  }

  const handleRemove = () => {
    startRemove(async () => {
      try {
        const result = await removeKnowledgeDocAction({
          knowledgeId: item.knowledgeId,
          knowledgeDocId: item.id
        })

        if (!result.success) {
          toast.error(result.error.message)
          return
        }

        toast.success(`已从知识库移除「${item.filename}」`)
        await invalidateDocs()
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
      {item.status === 'FAILED' && item.errorMessage ? (
        <ConfirmDialog
          title='查看失败原因'
          description={item.errorMessage}
          actions={{ label: '知道了', onClick: () => undefined }}
        >
          <Button size='sm' variant='outline'>
            <AlertCircle className='h-4 w-4' />
            查看错误
          </Button>
        </ConfirmDialog>
      ) : null}

      <Button
        size='sm'
        variant='outline'
        disabled={isPending || processing}
        onClick={handleReindex}
      >
        {isPending ? <Loader2 className='animate-spin' /> : <RefreshCw />}
        重新索引
      </Button>
      <ConfirmDialog
        title='移除文档'
        description={`确认从知识库中移除「${item.filename}」吗？该文档的索引切片会一并删除，原文件仍保留在文档库中。`}
        actions={{
          label: '移除',
          onClick: handleRemove,
          className:
            'bg-destructive text-destructive-foreground hover:bg-destructive/90'
        }}
      >
        <Button
          size='sm'
          variant='outline'
          className='text-destructive'
          disabled={isRemoving || processing}
        >
          {isRemoving ? <Loader2 className='animate-spin' /> : <Trash2 />}
          移除
        </Button>
      </ConfirmDialog>
    </div>
  )
}
