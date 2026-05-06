'use client'

import { DocSelectTable } from './doc-select-table'
import { DocSelectTab } from './doc-select-tab'
import { DocSelectCate } from './doc-select-cate'

export type DocSelectMode = 'docCate' | 'doc'

export type DocSelectValue = {
  mode: DocSelectMode
  categoryId?: string
  documentIds: string[]
}

const pageSize = 10

interface DocSelectProps {
  id: string
  name: string
  value: DocSelectValue
  onChange: (value: DocSelectValue) => void
  onBlur?: () => void
  disabled?: boolean
}

export default function DocSelect({
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled = false
}: DocSelectProps) {
  const handleModeChange = (mode: DocSelectMode) => {
    onChange({
      mode,
      categoryId: value.categoryId,
      documentIds: []
    })
    onBlur?.()
  }

  const handleCategoryChange = (categoryId: string) => {
    onChange({
      ...value,
      categoryId,
      documentIds: value.mode === 'doc' ? [] : value.documentIds
    })
    onBlur?.()
  }

  const handleSelectedDocumentIdsChange = (documentIds: string[]) => {
    onChange({
      ...value,
      documentIds
    })
    onBlur?.()
  }

  return (
    <div id={id} data-name={name} className='flex flex-col gap-3'>
      <DocSelectTab
        mode={value.mode}
        onModeChange={handleModeChange}
        disabled={disabled}
      />
      <div className='flex min-h-0 flex-1 overflow-hidden rounded-md border'>
        <DocSelectCate
          selectedCategoryId={value.categoryId}
          onSelectCategory={handleCategoryChange}
          disabled={disabled}
        />
        <DocSelectTable
          pageSize={pageSize}
          categoryId={value.categoryId}
          selectedDocumentIds={value.documentIds}
          onSelectedDocumentIdsChange={handleSelectedDocumentIdsChange}
          disabled={disabled || value.mode !== 'doc'}
        />
      </div>
    </div>
  )
}
