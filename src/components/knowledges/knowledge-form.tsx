'use client'

import { LoaderCircle, Save, ChevronLeft } from 'lucide-react'
import { PagePanel } from '../layout/page-panel'
import { PageStack } from '../layout/page-stack'
import PageTitle from '../layout/page-title'
import { Button, buttonVariants } from '../ui/button'
import Link from 'next/link'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
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
  knowledgeUpdateSchema,
  type KnowledgeCreateFormValues,
  type KnowledgeUpdateFormValues
} from '@/modules/knowledges/schemas'
import DocSelect, { type DocSelectValue } from '../docs/doc-select'
import {
  createKnowledgeAction,
  updateKnowledgeAction
} from '@/modules/knowledges/actions'
import { toast } from 'sonner'

export type KnowledgeFormData = {
  id: string
  name: string
  description: string | null
}

interface KnowledgeFormProps {
  knowledge?: KnowledgeFormData
}

type KnowledgeFormValues = KnowledgeCreateFormValues & { id?: string }

const defaultDocSource: KnowledgeCreateFormValues['docSource'] = {
  mode: KNOWLEDGE_SOURCE_MODE.DOC_CATE,
  categoryId: '',
  docIds: undefined
}

export default function KnowledgeForm({ knowledge }: KnowledgeFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isEdit = Boolean(knowledge)
  const formId = isEdit ? 'knowledgeEditForm' : 'knowledgeCreateForm'
  const backHref = knowledge ? `/knowledges/${knowledge.id}` : '/knowledges'

  const form = useForm<KnowledgeFormValues>({
    resolver: zodResolver(isEdit ? knowledgeUpdateSchema : knowledgeCreateSchema),
    defaultValues: {
      id: knowledge?.id,
      name: knowledge?.name ?? '',
      description: knowledge?.description ?? '',
      docSource: defaultDocSource
    }
  })

  const renderNameInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<KnowledgeFormValues, 'name'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<KnowledgeFormValues>
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
    field: ControllerRenderProps<KnowledgeFormValues, 'description'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<KnowledgeFormValues>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>知识库描述</FieldLabel>
        <Textarea
          id={field.name}
          placeholder='用于说明该知识库包含的文档内容与使用场景'
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
    field: ControllerRenderProps<KnowledgeFormValues, 'docSource'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<KnowledgeFormValues>
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

  const onSubmit = (values: KnowledgeFormValues) => {
    startTransition(async () => {
      try {
        if (knowledge) {
          const result = await updateKnowledgeAction({
            id: knowledge.id,
            name: values.name,
            description: values.description,
            docSource: values.docSource
          } as KnowledgeUpdateFormValues)

          if (result.success) {
            toast.success(
              result.data.addedCount > 0
                ? `知识库已更新，并追加了 ${result.data.addedCount} 份文档`
                : '知识库已更新'
            )
            router.push(`/knowledges/${knowledge.id}`)
          } else {
            toast.error(result.error.message)
          }
          return
        }

        const result = await createKnowledgeAction(values)

        if (result.success) {
          toast.success('知识库创建成功')
          router.replace(`/knowledges/${result.data.id}`)
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
    <PageStack>
      <PageTitle
        title={isEdit ? '编辑知识库' : '新建知识库'}
        description={
          isEdit
            ? '更新名称和描述，并可继续选择文档追加到知识库'
            : '设置名称，并选择要纳入检索的文档来源'
        }
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button type='submit' form={formId} disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
              <Save />
              保存
            </Button>
            <Link
              href={backHref}
              className={buttonVariants({ variant: 'ghost' })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      />

      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <PageStack>
          <PagePanel title='基础信息' description='填写知识库的名称和描述信息'>
            <FieldGroup>
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
            </FieldGroup>
          </PagePanel>
          <PagePanel
            title='数据来源'
            description={
              isEdit
                ? '选择要追加的类目或文件，已关联的文档会自动跳过'
                : '选择知识库对应的类目或文件'
            }
          >
            <FieldGroup>
              <Controller
                name='docSource'
                control={form.control}
                render={renderDocSelect}
              />
            </FieldGroup>
          </PagePanel>
        </PageStack>
      </form>
    </PageStack>
  )
}
