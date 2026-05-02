'use client'

import { docCreateSchema, DocCreateFormValues } from '@/schemas/doc'
import { zodResolver } from '@hookform/resolvers/zod'
import type { DocumentCategory } from '@/generated/prisma/client'
import { useRouter } from 'next/navigation'
import { use, useRef, useState, useTransition } from 'react'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { toast } from 'sonner'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import {
  FieldGroup,
  FieldSet,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field'
import DocUpload from '@/components/doc/doc-upload'
import { createDocAction } from '@/app/(dashboard)/documents/actions'
import { authClient } from '@/lib/auth-client'
import { FileUploadRef } from '@/components/ui/file-upload'
import { uploadDocs } from '@/lib/oss'
import DocCateCombobox from './doc-cate-combobox'
import PageTitle from '../page-title'
import { Button, buttonVariants } from '../ui/button'
import { ChevronLeft, Save } from 'lucide-react'
import Link from 'next/link'
import DocCateDialog from './doc-cate-dialog'

export default function DocCreateForm({
  docCatesPromise
}: {
  docCatesPromise: Promise<DocumentCategory[]>
}) {
  const { data: userData } = authClient.useSession()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const fileUploadRef = useRef<FileUploadRef>(null)

  const form = useForm({
    resolver: zodResolver(docCreateSchema),
    defaultValues: {
      categoryId: undefined,
      files: []
    }
  })

  const renderDocCateCombobox = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<DocCreateFormValues, 'categoryId'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<DocCreateFormValues>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>类目</FieldLabel>
        <DocCateCombobox
          docCatesPromise={docCatesPromise}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          invalid={fieldState.invalid}
        />
        <FieldDescription>
          <DocCateDialog
            trigger={
              <Button type='button' variant='link' size='sm'>
                新增类目
              </Button>
            }
          />
          <Button type='button' variant='link' size='sm'>
            管理类目
          </Button>
        </FieldDescription>
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const renderFileInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<DocCreateFormValues, 'files'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<DocCreateFormValues>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>选择文件</FieldLabel>
        <DocUpload
          ref={e => {
            field.ref(e)
            fileUploadRef.current = e
          }}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          invalid={fieldState.invalid}
          disabled={isPending}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError
            errors={
              fieldState.error instanceof Array
                ? fieldState.error
                : [fieldState.error]
            }
          />
        )}
      </Field>
    )
  }

  const onSubmit = (values: DocCreateFormValues) => {
    startTransition(async () => {
      try {
        const userId = userData!.user.id
        const fileKeys = new Map<File, string>()

        await fileUploadRef.current!.upload(
          async (files, { onProgress, onSuccess, onError }) => {
            const onUpload = async (file: File) => {
              try {
                const key = await uploadDocs(userId, file, progress =>
                  onProgress(file, progress)
                )
                fileKeys.set(file, key)
                onSuccess(file)
              } catch (err) {
                onError(
                  file,
                  err instanceof Error ? err : new Error('上传失败')
                )
              }
            }

            await Promise.all(files.map(onUpload))
          }
        )

        const files = values.files.map(file => ({
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
          storageKey: fileKeys.get(file)!
        }))

        const failed = values.files.find(f => !fileKeys.has(f))
        if (failed) throw new Error(`文件 ${failed.name} 上传失败`)

        await createDocAction({
          categoryId: values.categoryId,
          files
        })

        toast.success('保存成功')
        router.push('/documents')
      } catch (error) {
        console.error(error)
        const message =
          error instanceof Error ? error.message : '操作失败，请稍后重试'
        toast.error(message)
      }
    })
  }

  return (
    <div>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button type='submit' form='docForm'>
              <Save />
              保存
            </Button>
            <Link
              href='/documents'
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
        导入数据
      </PageTitle>
      <form id='docForm' onSubmit={e => form.handleSubmit(onSubmit)(e)}>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>本地上传</CardTitle>
            <CardDescription>上传本地文件到文档数据</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <Controller
                  name='categoryId'
                  control={form.control}
                  render={renderDocCateCombobox}
                />
                <Controller
                  name='files'
                  control={form.control}
                  render={renderFileInput}
                />
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
