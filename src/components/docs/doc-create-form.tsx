'use client'

import {
  DocCreateFormValues,
  docCreateFormSchema
} from '@/modules/docs/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import type { DocCate } from '@/generated/prisma/client'
import { useRouter } from 'next/navigation'
import { useRef, useTransition } from 'react'
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
import DocUpload from '@/components/docs/doc-upload'
import { createDocAction } from '@/modules/docs/actions'
import { authClient } from '@/modules/auth/client'
import { FileUploadRef } from '@/components/ui/file-upload'
import { uploadDocs } from '@/modules/oss/client'
import DocCateCombobox from './doc-cate-combobox'
import PageTitle from '../layout/page-title'
import { Button, buttonVariants } from '../ui/button'
import { ChevronLeft, LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import DocCateDialog from './doc-cate-dialog'

export default function DocCreateForm({
  docCatesPromise
}: {
  docCatesPromise: Promise<DocCate[]>
}) {
  const { data: userData } = authClient.useSession()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const fileUploadRef = useRef<FileUploadRef>(null)

  const form = useForm({
    resolver: zodResolver(docCreateFormSchema),
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
          <DocCateDialog>
            <Button type='button' variant='link' size='sm'>
              新增类目
            </Button>
          </DocCateDialog>
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
          ref={(instance: FileUploadRef | null) => {
            field.ref(instance)
            fileUploadRef.current = instance
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
        const uploaded = new Map<File, Awaited<ReturnType<typeof uploadDocs>>>()

        await fileUploadRef.current!.upload(
          async (files, { onProgress, onSuccess, onError }) => {
            const onUpload = async (file: File) => {
              try {
                const result = await uploadDocs(userId, file, progress =>
                  onProgress(file, progress)
                )
                uploaded.set(file, result)
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

        const files = values.files.map(file => {
          const result = uploaded.get(file)
          if (!result) {
            throw new Error(`文件 ${file.name} 上传失败`)
          }

          return {
            filename: result.filename,
            fileSize: result.fileSize,
            mimeType: result.mimeType,
            storageKey: result.storageKey
          }
        })

        await createDocAction({
          categoryId: values.categoryId,
          files
        })

        const convertedCount = [...uploaded.values()].filter(
          item => item.converted
        ).length
        toast.success(
          convertedCount > 0
            ? `保存成功，已将 ${convertedCount} 个 .doc 转为 .docx`
            : '保存成功'
        )
        router.push('/docs')
      } catch (error) {
        console.error(error)
        const message =
          error instanceof Error ? error.message : '操作失败，请稍后重试'
        toast.error(message)
      }
    })
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-6'>
      <PageTitle
        title='导入数据'
        description='上传本地文件，并归入对应类目'
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button type='submit' form='docForm' disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
              保存
            </Button>
            <Link
              href='/docs'
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
      <form id='docForm' onSubmit={e => form.handleSubmit(onSubmit)(e)}>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>本地上传</CardTitle>
            <CardDescription>上传本地文件到文档数据</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <div className='flex w-1/2 flex-col gap-6 md:flex-row'>
                  <Controller
                    name='categoryId'
                    control={form.control}
                    render={renderDocCateCombobox}
                  />
                </div>
                <div className='flex w-1/2 flex-col gap-6 md:flex-row'>
                  <Controller
                    name='files'
                    control={form.control}
                    render={renderFileInput}
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
