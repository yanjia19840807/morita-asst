'use client'

import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { getKnowledgeDocsQueryKey } from '@/modules/knowledges/client'
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
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getKnowledgeIndexSummaryQueryKey(item.knowledgeId)
          }),
          queryClient.invalidateQueries({
            queryKey: getKnowledgeDocsQueryKey({
              knowledgeId: item.knowledgeId
            })
          })
        ])
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
        disabled={isPending}
        onClick={handleReindex}
      >
        {isPending ? <Loader2 className='animate-spin' /> : <RefreshCw />}
        重新索引
      </Button>
    </div>
  )
}
