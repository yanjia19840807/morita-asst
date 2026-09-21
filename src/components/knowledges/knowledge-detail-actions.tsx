'use client'

import { Blocks, Loader2, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/confirm-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { getKnowledgeDocsQueryKey } from '@/modules/knowledges/client'
import { deleteKnowledgeAction } from '@/modules/knowledges/actions'
import { reindexKnowledgeAction } from '@/modules/knowledges/indexing/actions'
import { getKnowledgeIndexSummaryQueryKey } from '@/modules/knowledges/indexing/client'
import Link from 'next/link'

export function KnowledgeDetailActions({
  knowledgeId,
  knowledgeName
}: {
  knowledgeId: string
  knowledgeName: string
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDelete] = useTransition()

  const handleReindex = () => {
    startTransition(async () => {
      try {
        const result = await reindexKnowledgeAction(knowledgeId)

        if (!result.success) {
          toast.error(result.error.message)
          return
        }

        toast.success('已提交整库重新索引任务')

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: getKnowledgeIndexSummaryQueryKey(knowledgeId)
          }),
          queryClient.invalidateQueries({
            queryKey: getKnowledgeDocsQueryKey({ knowledgeId })
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

  const handleDelete = () => {
    startDelete(async () => {
      try {
        const result = await deleteKnowledgeAction(knowledgeId)

        if (!result.success) {
          toast.error(result.error.message)
          return
        }

        toast.success('知识库已删除')
        router.replace('/knowledges')
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
    <div className='flex flex-row flex-wrap items-center gap-2'>
      <Link
        href={`/knowledges/${knowledgeId}/edit`}
        className={buttonVariants()}
      >
        <Pencil className='h-4 w-4' />
        编辑
      </Link>
      <Link
        href={`/knowledges/${knowledgeId}/chunks`}
        className={buttonVariants({ variant: 'outline' })}
      >
        <Blocks className='h-4 w-4' />
        查看 Chunks
      </Link>
      <ConfirmDialog
        title='重新索引知识库'
        description='确认重新索引当前知识库的全部关联文档吗？系统会重新提交每份文档的处理任务。'
        actions={{
          label: '重新索引',
          onClick: handleReindex
        }}
      >
        <Button disabled={isPending}>
          {isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <RefreshCw className='h-4 w-4' />
          )}
          重新索引全部
        </Button>
      </ConfirmDialog>
      <ConfirmDialog
        title='删除知识库'
        description={`确认删除知识库「${knowledgeName}」吗？关联文档索引和切片会一并删除，已绑定该知识库的助手将解除绑定。此操作不可撤销。`}
        actions={{
          label: '删除',
          onClick: handleDelete,
          className:
            'bg-destructive text-destructive-foreground hover:bg-destructive/90'
        }}
      >
        <Button variant='destructive' disabled={isDeleting}>
          {isDeleting ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Trash2 className='h-4 w-4' />
          )}
          删除
        </Button>
      </ConfirmDialog>
      <Link href='/knowledges' className={buttonVariants({ variant: 'ghost' })}>
        返回
      </Link>
    </div>
  )
}
