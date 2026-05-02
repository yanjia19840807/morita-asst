'use client'

import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import DocCateForm from './doc-cate-create-form'
import React, { useRef, useState, useTransition } from 'react'
import { DocCateCreateFormRef } from './doc-cate-create-form'

export default function DocCateDialog({
  trigger
}: {
  trigger?: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<DocCateCreateFormRef>(null)
  const onClose = () => setOpen(false)
  const onSuccess = () => router.refresh()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type='button' variant='link' size='xs'>
            <PlusIcon />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增类目</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DocCateForm
          ref={formRef}
          onClose={onClose}
          onSuccess={onSuccess}
          startTransition={startTransition}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='secondary'>
              取消
            </Button>
          </DialogClose>
          <Button
            type='button'
            disabled={isPending}
            onClick={() => formRef.current?.submit()}
          >
            {isPending ? '提交中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
