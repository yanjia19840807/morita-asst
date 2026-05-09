'use client'

import { LoaderCircle, Save, ChevronLeft } from 'lucide-react'
import PageTitle from '../layout/page-title'
import { Button, buttonVariants } from '../ui/button'
import Link from 'next/link'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  KNOWLEDGE_SOURCE_MODE,
  knowledgeCreateSchema,
  KnowledgeCreateFormValues
} from '@/schemas/knowledge'
import DocSelect, { type DocSelectValue } from '../docs/doc-select'
import { createKnowledgeAction } from '@/actions/knowledges/actions'
import { toast } from 'sonner'

export default function KnowledgeForm() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const defaultValues: KnowledgeCreateFormValues = {
    name: '',
    description: '',
    docSource: {
      mode: KNOWLEDGE_SOURCE_MODE.DOC_CATE,
      categoryId: '',
      docIds: undefined
    }
  }

  const form = useForm<KnowledgeCreateFormValues>({
    resolver: zodResolver(knowledgeCreateSchema),
    defaultValues
  })

  const renderNameInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<KnowledgeCreateFormValues, 'name'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<KnowledgeCreateFormValues>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>知识库名称</FieldLabel>
        <Input
          id={field.name}
          placeholder='填写知识库名称'
          aria-invalid={fieldState.invalid}
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const renderDescriptionInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<KnowledgeCreateFormValues, 'description'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<KnowledgeCreateFormValues>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>知识库描述</FieldLabel>
        <Textarea
          id={field.name}
          placeholder='填写知识库的用途、范围或内容说明'
          aria-invalid={fieldState.invalid}
          rows={5}
          {...field}
          value={field.value ?? ''}
        />
        <FieldDescription>
          用于说明该知识库包含的文档内容与使用场景
        </FieldDescription>
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const renderDocSelect = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<KnowledgeCreateFormValues, 'docSource'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<KnowledgeCreateFormValues>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>关联文档</FieldLabel>
        <DocSelect
          id={field.name}
          name={field.name}
          value={field.value as DocSelectValue}
          onChange={field.onChange}
          onBlur={field.onBlur}
          disabled={isPending}
        />
        <FieldDescription>选择类目或按文件选择</FieldDescription>
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const onSubmit = (values: KnowledgeCreateFormValues) => {
    startTransition(async () => {
      try {
        const result = await createKnowledgeAction(values)

        if (result.success) {
          toast.success('知识库创建成功')
          router.replace(`/knowledge/${result.data.id}`)
        } else {
          toast.error(result.error.message)
        }
      } catch (error) {
        console.error(error)
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button
              type='submit'
              form='knowledgeCreateForm'
              disabled={isPending}
            >
              {isPending && <LoaderCircle className='animate-spin' />}
              <Save />
              保存
            </Button>
            <Link
              href='/knowledge'
              className={buttonVariants({ variant: 'ghost' })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      >
        新建知识库
      </PageTitle>

      <form id='knowledgeCreateForm' onSubmit={form.handleSubmit(onSubmit)}>
        <div className='h-min-0 flex flex-col gap-3'>
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
              <CardDescription>填写知识库的名称和描述信息</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <FieldSet>
                  <Controller
                    name='name'
                    control={form.control}
                    render={renderNameInput}
                  />
                  <Controller
                    name='description'
                    control={form.control}
                    render={renderDescriptionInput}
                  />
                </FieldSet>
              </FieldGroup>
            </CardContent>
          </Card>
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>数据来源</CardTitle>
              <CardDescription>选择知识库对应的类目或文件</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <FieldSet>
                  <Controller
                    name='docSource'
                    control={form.control}
                    render={renderDocSelect}
                  />
                </FieldSet>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
