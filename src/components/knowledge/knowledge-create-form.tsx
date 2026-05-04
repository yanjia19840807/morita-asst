import React, { useTransition } from 'react'
import PageTitle from '../page-title'
import { Card, CardContent } from '../ui/card'
import { Button, buttonVariants } from '../ui/button'
import { LoaderCircle, Save, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export default function KnowledgeCreateForm() {
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    resolver: zodResolver(),
    defaultValues: {}
  })

  return (
    <div>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button type='submit' form='userCreateForm' disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
              <Save />
              保存
            </Button>
            <Link
              href={`/users/`}
              className={buttonVariants({
                variant: 'ghost'
              })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      >
        新增用户
      </PageTitle>
      <form id='userCreateForm' onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent></CardContent>
        </Card>
      </form>
    </div>
  )
}
