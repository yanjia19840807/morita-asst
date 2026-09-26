'use client'

import React, { useRef, useState } from 'react'
import { Camera } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar'
import { getAvatarSrc } from '@/modules/auth/avatar'

interface AvatarPickerProps {
  name: string
  value: string | File | null | undefined
  onChange: (file: string | File | null | undefined) => void
  onBlur: () => void
  disabled?: boolean | undefined
}

function isCustomAvatar(value: string | File | null | undefined) {
  if (value instanceof File) {
    return true
  }

  return Boolean(value && value !== '/avatar-default.svg')
}

export default function AvatarPicker({
  name,
  value,
  onChange,
  onBlur,
  disabled
}: AvatarPickerProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const image =
    preview ||
    (typeof value === 'string' ? getAvatarSrc(value) : '/avatar-default.svg')
  const canRemove = Boolean(preview || isCustomAvatar(value))

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    onChange(file)
  }

  const handleUpload = () => {
    if (disabled) {
      return
    }
    inputRef.current?.click()
  }

  const handleClear = () => {
    if (disabled) {
      return
    }
    setPreview(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className='flex items-center gap-4'>
      <button
        type='button'
        className='relative shrink-0 rounded-full disabled:cursor-not-allowed disabled:opacity-50'
        onClick={handleUpload}
        disabled={disabled}
        aria-label='上传新头像'
      >
        <Avatar className='size-20 shrink-0 after:hidden'>
          <AvatarImage src={image} />
          <AvatarFallback>U</AvatarFallback>
          <AvatarBadge className='right-auto bottom-0 left-1/2 size-7 -translate-x-1/2 [&>svg]:size-3.5'>
            <Camera />
          </AvatarBadge>
        </Avatar>
      </button>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          type='button'
          disabled={disabled}
          onClick={handleUpload}
        >
          上传新头像
        </Button>
        <Button
          type='button'
          variant='outline'
          disabled={disabled || !canRemove}
          onClick={handleClear}
        >
          删除头像
        </Button>
      </div>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type='file'
        accept='image/jpeg,image/png,image/webp,image/gif'
        className='sr-only'
        disabled={disabled}
        onBlur={onBlur}
        onChange={handleChange}
      />
    </div>
  )
}
