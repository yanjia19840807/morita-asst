'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { use, useTransition } from 'react'
import { toast } from 'sonner'
import PageTitle from '@/components/page-title'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor
} from '@/components/ui/combobox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createAgentAction } from '@/app/(dashboard)/agents/actions'
import { AgentCreateFormValues, agentCreateSchema } from '@/schemas/agent'
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react'

interface AgentCreateFormProps {
  optionsPromise: Promise<{
    promptProfiles: Array<{ id: string; name: string }>
    knowledges: Array<{ id: string; name: string; description: string | null }>
  }>
}

type KnowledgeOption = {
  label: string
  value: string
  description: string
}

const statusOptions = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'ACTIVE', label: '启用中' },
  { value: 'DISABLED', label: '已停用' }
] as const

export function AgentCreateForm({ optionsPromise }: AgentCreateFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { promptProfiles, knowledges } = use(optionsPromise)
  const knowledgeAnchor = useComboboxAnchor()

  const knowledgeOptions: KnowledgeOption[] = knowledges.map(knowledge => ({
    label: knowledge.name,
    value: knowledge.id,
    description: knowledge.description || '暂无描述'
  }))

  const defaultValues: AgentCreateFormValues = {
    name: '',
    description: '',
    status: 'DRAFT',
    model: '',
    promptProfileId: undefined,
    knowledgeIds: []
  }

  const form = useForm<AgentCreateFormValues>({
    resolver: zodResolver(agentCreateSchema),
    defaultValues
  })

  const renderNameInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'name'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>名称</FieldLabel>
      <Input
        id={field.name}
        placeholder='填写助手名称'
        aria-invalid={fieldState.invalid}
        {...field}
      />
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const renderDescriptionInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'description'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>描述</FieldLabel>
      <Textarea
        id={field.name}
        placeholder='简要说明这个助手的用途和适用场景'
        aria-invalid={fieldState.invalid}
        value={field.value ?? ''}
        onBlur={field.onBlur}
        name={field.name}
        ref={field.ref}
        onChange={event => field.onChange(event.target.value)}
        rows={3}
      />
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const renderStatusInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'status'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>状态</FieldLabel>
      <Select
        value={field.value}
        onValueChange={field.onChange}
        disabled={isPending}
      >
        <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
          <SelectValue placeholder='请选择状态' />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const renderModelInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'model'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>模型</FieldLabel>
      <Input
        id={field.name}
        placeholder='例如：gpt-4.1-mini'
        aria-invalid={fieldState.invalid}
        value={field.value ?? ''}
        onBlur={field.onBlur}
        name={field.name}
        ref={field.ref}
        onChange={event => field.onChange(event.target.value)}
      />
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const renderPromptProfileInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'promptProfileId'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>提示词模板</FieldLabel>
      <Select
        value={field.value}
        onValueChange={value => field.onChange(value)}
        disabled={isPending}
      >
        <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
          <SelectValue placeholder='请选择提示词模板' />
        </SelectTrigger>
        <SelectContent>
          {promptProfiles.map(option => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const renderKnowledgeInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'knowledgeIds'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => {
    const selectedIds = field.value ?? []
    const selectedOptions = knowledgeOptions.filter(option =>
      selectedIds.includes(option.value)
    )

    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>关联知识库</FieldLabel>
        <Combobox
          multiple
          autoHighlight
          items={knowledgeOptions}
          value={selectedOptions}
          onValueChange={nextValue => {
            field.onChange((nextValue ?? []).map(option => option.value))
          }}
        >
          <ComboboxChips
            ref={knowledgeAnchor}
            className='w-full'
            aria-invalid={fieldState.invalid}
            onBlur={field.onBlur}
          >
            <ComboboxValue>
              {(values: KnowledgeOption[]) => (
                <React.Fragment>
                  {values.map(value => (
                    <ComboboxChip key={value.value}>{value.label}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput placeholder='选择知识库' />
                </React.Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={knowledgeAnchor}>
            <ComboboxEmpty>没有匹配的知识库</ComboboxEmpty>
            <ComboboxList>
              {item => (
                <ComboboxItem key={item.value} value={item}>
                  <div className='min-w-0'>
                    <div className='font-medium'>{item.label}</div>
                    <div className='text-muted-foreground line-clamp-2 text-sm'>
                      {item.description}
                    </div>
                  </div>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>可选，可为助手绑定多个知识库</FieldDescription>
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const onSubmit = (values: AgentCreateFormValues) => {
    startTransition(async () => {
      try {
        const result = await createAgentAction(values)

        if (result.success) {
          toast.success('保存成功')
          router.push('/agents')
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
    <div>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button type='submit' form='agentCreateForm' disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
              <Save />
              保存
            </Button>
            <Link
              href='/agents'
              className={buttonVariants({ variant: 'ghost' })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      >
        新建助手
      </PageTitle>
      <form id='agentCreateForm' onSubmit={form.handleSubmit(onSubmit)}>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>基础信息</CardTitle>
            <CardDescription>定义助手身份和运行状态</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <div className='flex flex-col gap-6 md:flex-row'>
                  <div className='flex-1'>
                    <Controller
                      name='name'
                      control={form.control}
                      render={renderNameInput}
                    />
                  </div>
                  <div className='flex-1'>
                    <Controller
                      name='status'
                      control={form.control}
                      render={renderStatusInput}
                    />
                  </div>
                </div>
                <div>
                  <Controller
                    name='description'
                    control={form.control}
                    render={renderDescriptionInput}
                  />
                </div>
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card className='mt-4 w-full'>
          <CardHeader>
            <CardTitle>能力配置</CardTitle>
            <CardDescription>
              绑定提示词模板和知识库，形成助手的初始工作上下文
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <div className='flex flex-col gap-6 md:flex-row'>
                  <div className='flex-1'>
                    <Controller
                      name='model'
                      control={form.control}
                      render={renderModelInput}
                    />
                  </div>
                  <div className='flex-1'>
                    <Controller
                      name='promptProfileId'
                      control={form.control}
                      render={renderPromptProfileInput}
                    />
                  </div>
                </div>
                <div>
                  <Controller
                    name='knowledgeIds'
                    control={form.control}
                    render={renderKnowledgeInput}
                  />
                </div>
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
