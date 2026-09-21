'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useTransition
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { DragDropProvider } from '@dnd-kit/react'
import type { DragEndEvent } from '@dnd-kit/abstract'
import { Controller, Resolver, useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type z from 'zod'
import PageTitle from '@/components/layout/page-title'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, LoaderCircle, Plus, Save } from 'lucide-react'
import type { ResponseResult } from '@/lib/api/response'
import type { UserProfileEditValues } from '@/modules/profiles/schemas'
import {
  PROFILE_AGE_RANGE_OPTIONS,
  PROFILE_GENDER_OPTIONS
} from '@/modules/profiles/constants'
import { ProfileOccupationCombobox } from './profile-occupation-combobox'
import { ProfileIssueTagsCombobox } from './profile-issue-tags-combobox'
import { SortableIssueItem } from './sortable-issue-card'

export interface UserProfileFormHandle {
  getValidatedValues: () => Promise<UserProfileEditValues | null>
}

interface UserProfileFormProps {
  title: string
  formId: string
  backHref: string
  successHref?: string
  defaultValues: UserProfileEditValues
  schema: z.ZodTypeAny
  onSubmitAction: (values: UserProfileEditValues) => Promise<ResponseResult>
  embedded?: boolean
  cardDescription?: string
  submitLabel?: string
  hideSubmitButton?: boolean
}

function normalizeValues(values: UserProfileEditValues): UserProfileEditValues {
  return {
    ...values,
    issues: values.issues.map((issue, index) => ({
      ...issue,
      priority: index + 1,
      tags: issue.tags.map(tag => tag.trim()).filter(Boolean),
      description: issue.description.trim()
    }))
  }
}

export const UserProfileForm = forwardRef<
  UserProfileFormHandle,
  UserProfileFormProps
>(function UserProfileForm(
  {
    title,
    formId,
    backHref,
    successHref,
    defaultValues,
    schema,
    onSubmitAction,
    embedded = false,
    cardDescription,
    submitLabel = '保存画像',
    hideSubmitButton = false
  },
  ref
) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<UserProfileEditValues>({
    resolver: zodResolver(schema as never) as Resolver<UserProfileEditValues>,
    defaultValues
  })

  const issuesFieldArray = useFieldArray({
    control: form.control,
    name: 'issues'
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  useImperativeHandle(ref, () => ({
    async getValidatedValues() {
      const isValid = await form.trigger()

      if (!isValid) {
        return null
      }

      return normalizeValues(form.getValues())
    }
  }))

  function handleDragEnd({ operation, canceled }: DragEndEvent) {
    if (canceled || isPending) {
      return
    }

    const sortableSource = operation.source as {
      initialIndex?: number
      index?: number
    } | null

    if (
      !sortableSource ||
      typeof sortableSource.initialIndex !== 'number' ||
      typeof sortableSource.index !== 'number'
    ) {
      return
    }

    const sourceIndex = sortableSource.initialIndex
    const targetIndex = sortableSource.index

    if (
      sourceIndex === targetIndex ||
      sourceIndex < 0 ||
      targetIndex < 0 ||
      sourceIndex >= issuesFieldArray.fields.length ||
      targetIndex >= issuesFieldArray.fields.length
    ) {
      return
    }

    issuesFieldArray.move(sourceIndex, targetIndex)
  }

  const onSubmit = (values: UserProfileEditValues) => {
    startTransition(async () => {
      try {
        const normalizedValues = normalizeValues(values)

        const result = await onSubmitAction(normalizedValues)

        if (result.success) {
          toast.success('画像保存成功')
          if (successHref) {
            router.push(successHref)
          } else {
            router.refresh()
          }
        } else {
          toast.error(result.error.message)
        }
      } catch (error) {
        console.error(error)
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  const fields = (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <input type='hidden' {...form.register('userId')} />
      <input type='hidden' {...form.register('id')} />
      <FieldGroup>
        <FieldSet>
          <FieldLegend>{title}</FieldLegend>
          {cardDescription ? (
            <FieldDescription>{cardDescription}</FieldDescription>
          ) : null}
          <FieldGroup>
            <div className='grid gap-6 md:grid-cols-2'>
              <Controller
                name='gender'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>性别</FieldLabel>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder='请选择性别' />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFILE_GENDER_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      可留空，保持用户自愿填写
                    </FieldDescription>
                    {fieldState.invalid && fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
              <Controller
                name='ageRange'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>年龄段</FieldLabel>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder='请选择年龄段' />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFILE_AGE_RANGE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      建议优先使用年龄段而非精确年龄
                    </FieldDescription>
                    {fieldState.invalid && fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>
            <Controller
              name='occupation'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>职业</FieldLabel>
                  <ProfileOccupationCombobox
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isPending}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && fieldState.error ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend>主要问题</FieldLegend>
          <FieldDescription>拖动左侧把手调整优先级</FieldDescription>
          <FieldGroup>
            {issuesFieldArray.fields.length ? (
              <DragDropProvider onDragEnd={handleDragEnd}>
                <div className='flex flex-col'>
                  {issuesFieldArray.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className={
                        index > 0 ? 'border-border mt-6 border-t pt-6' : undefined
                      }
                    >
                      <SortableIssueItem
                        issueId={field.id}
                        index={index}
                        disabled={isPending}
                        label={
                          <FieldLabel htmlFor={`issues.${index}.tags`}>
                            标签
                          </FieldLabel>
                        }
                        onRemove={() => issuesFieldArray.remove(index)}
                      >
                        <input
                          type='hidden'
                          {...form.register(`issues.${index}.priority` as const)}
                          value={index + 1}
                        />
                        <Controller
                          name={`issues.${index}.tags` as const}
                          control={form.control}
                          render={({ field: tagsField, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <ProfileIssueTagsCombobox
                                value={
                                  Array.isArray(tagsField.value)
                                    ? tagsField.value
                                    : []
                                }
                                onChange={tagsField.onChange}
                                onBlur={tagsField.onBlur}
                                disabled={isPending}
                                invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && fieldState.error ? (
                                <FieldError errors={[fieldState.error]} />
                              ) : null}
                            </Field>
                          )}
                        />
                        <Controller
                          name={`issues.${index}.description` as const}
                          control={form.control}
                          render={({ field: descriptionField, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel
                                htmlFor={`issues.${index}.description`}
                              >
                                问题描述
                              </FieldLabel>
                              <Textarea
                                id={`issues.${index}.description`}
                                placeholder='描述当前主要困扰、出现方式和具体情境'
                                aria-invalid={fieldState.invalid}
                                value={descriptionField.value}
                                onBlur={descriptionField.onBlur}
                                name={descriptionField.name}
                                ref={descriptionField.ref}
                                rows={3}
                                onChange={event =>
                                  descriptionField.onChange(
                                    event.target.value
                                  )
                                }
                              />
                              {fieldState.invalid && fieldState.error ? (
                                <FieldError errors={[fieldState.error]} />
                              ) : null}
                            </Field>
                          )}
                        />
                      </SortableIssueItem>
                    </div>
                  ))}
                </div>
              </DragDropProvider>
            ) : (
              <p className='text-muted-foreground text-sm'>
                还没有填写主要问题
              </p>
            )}
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='w-fit'
              onClick={() =>
                issuesFieldArray.append({
                  priority: issuesFieldArray.fields.length + 1,
                  tags: [],
                  description: ''
                })
              }
            >
              <Plus />
              添加问题
            </Button>
            {!hideSubmitButton ? (
              <Field orientation='horizontal' className='justify-end'>
                <Button type='submit' disabled={isPending}>
                  {isPending ? <LoaderCircle className='animate-spin' /> : null}
                  <Save />
                  {submitLabel}
                </Button>
              </Field>
            ) : null}
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </form>
  )

  if (embedded) {
    return fields
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-6'>
      <PageTitle
        title={title}
        description='维护用户画像，帮助助手更好地理解来访者'
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Link
              href={backHref}
              className={buttonVariants({
                variant: 'ghost'
              })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      />
      {fields}
    </div>
  )
})
