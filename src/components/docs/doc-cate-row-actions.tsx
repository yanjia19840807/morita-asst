'use client'

import { Loader2 } from 'lucide-react'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { deleteDocCateAction } from '@/modules/docs/actions'
import type { DocCateRow } from '@/modules/docs/service'

export function DocCateRowActions({
  category,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancel
}: {
  category: DocCateRow
  isEditing: boolean
  isSaving: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}) {
  const router = useRouter()
  const [isDeleting, startDelete] = useTransition()

  const handleDelete = () => {
    startDelete(async () => {
      try {
        const result = await deleteDocCateAction(category.id)
        if (!result.success) {
          toast.error(result.error.message)
          return
        }

        toast.success(`已删除类目「${category.name}」`)
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error(
          error instanceof Error ? error.message : '操作失败，请稍后重试'
        )
      }
    })
  }

  if (isEditing) {
    return (
      <div className='flex items-center justify-end gap-2 whitespace-nowrap'>
        <Button size='sm' disabled={isSaving} onClick={onSave}>
          {isSaving && <Loader2 className='h-4 w-4 animate-spin' />}
          保存
        </Button>
        <Button
          size='sm'
          variant='ghost'
          disabled={isSaving}
          onClick={onCancel}
        >
          取消
        </Button>
      </div>
    )
  }

  return (
    <div className='flex items-center justify-end gap-2 whitespace-nowrap'>
      <Button size='sm' variant='outline' onClick={onEdit}>
        编辑
      </Button>
      {category.isDefault ? null : (
        <ConfirmDialog
          title='删除类目'
          description={`确认删除类目「${category.name}」吗？该类目下的 ${category._count.docs} 份文档会变为未分类，知识库关联也会解除。此操作不可撤销。`}
          actions={{
            label: '删除',
            onClick: handleDelete,
            className:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90'
          }}
        >
          <Button size='sm' variant='outline' className='text-destructive'>
            {isDeleting && <Loader2 className='h-4 w-4 animate-spin' />}
            删除
          </Button>
        </ConfirmDialog>
      )}
    </div>
  )
}
