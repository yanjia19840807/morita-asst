import React, { useRef, useState } from 'react'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger
} from './ui/file-upload'
import { error } from 'console'
import { Upload, X } from 'lucide-react'
import { Button } from './ui/button'

interface FileInputProps {
  value: File[] | undefined
  onChange: (files: File[]) => void
  onBlur: () => void
  disabled?: boolean | undefined
  invalid: boolean | undefined
}

export default function FileInput({
  value,
  onChange,
  onBlur,
  disabled,
  invalid
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
  }

  const handleClick = () => {
    if (disabled) {
      return
    }
    inputRef.current?.click()
  }

  const handleProgress = (file: File, progress: number): void => {}

  const handleSuccess = (file: File): void => {}

  const handleError = (file: File, error: Error): void => {}

  const handleUpload = (files, options) => {}

  return (
    <FileUpload
      value={value}
      onValueChange={onChange}
      onUpload={(files, options) => handleUpload(files, options)}
      multiple={true}
      maxFiles={10}
      maxSize={150 * 1024 * 1024}
      label='上传文档'
    >
      <FileUploadDropzone className={invalid ? 'border-destructive' : ''}>
        <div className='flex flex-col items-center gap-1 text-center'>
          <div className='flex items-center justify-center rounded-full border p-2.5'>
            <Upload className='text-muted-foreground size-6' />
          </div>
          <p className='text-sm font-medium'>点击或拖拽上传文档</p>
          <p className='text-muted-foreground text-xs'>
            支持(PDF, WORD, TXT)文件格式
          </p>
        </div>
        <FileUploadTrigger asChild>
          <Button variant='outline' size='sm' className='mt-2'>
            选择文档
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList>
        {value?.map((file, index) => (
          <FileUploadItem key={index} value={file}>
            <FileUploadItemPreview />
            <div className='flex flex-1 flex-col gap-1'>
              <FileUploadItemMetadata />
              <FileUploadItemProgress variant='linear' />
            </div>
            <FileUploadItemDelete asChild>
              <Button variant='ghost' size='icon' className='size-7'>
                <X className='size-4' />
              </Button>
            </FileUploadItemDelete>
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  )
}
