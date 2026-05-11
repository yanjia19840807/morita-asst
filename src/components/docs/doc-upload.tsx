import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadRef
} from '../ui/file-upload'
import { Upload, X } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DOC_ACCEPT_TYPES,
  DOC_MAX_FILES,
  DOC_MAX_SIZE
} from '@/modules/docs/schemas'
import React from 'react'

interface DocUploadProps {
  value: File[] | undefined
  onChange: (files: File[]) => void
  onBlur: () => void
  disabled?: boolean | undefined
  invalid: boolean | undefined
  ref?: React.Ref<FileUploadRef>
}

function DocUpload({
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  ref
}: DocUploadProps) {
  return (
    <FileUpload
      ref={ref}
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      multiple={true}
      maxFiles={DOC_MAX_FILES}
      maxSize={DOC_MAX_SIZE * 1024 * 1024}
      label='上传文档'
    >
      <FileUploadDropzone
        className={invalid ? 'border-destructive' : ''}
        onBlur={onBlur}
      >
        <div className='flex flex-col items-center gap-1 text-center'>
          <div className='flex items-center justify-center rounded-full border p-2.5'>
            <Upload className='text-muted-foreground size-6' />
          </div>
          <p className='text-sm font-medium'>点击或拖拽上传文档</p>
          <p className='text-muted-foreground text-xs'>
            {`支持(${DOC_ACCEPT_TYPES})文件`}
          </p>
        </div>
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

export default DocUpload
