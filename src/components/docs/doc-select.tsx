'use client'

import { useState } from 'react'
import {
  KNOWLEDGE_SOURCE_MODE,
  type KnowledgeCreateFormValues,
  type KnowledgeSourceModeValues
} from '@/modules/knowledges/schemas'
import { DocSelectTable } from './doc-select-table'
import { DocSelectTab } from './doc-select-tab'
import { DocSelectCate } from './doc-select-cate'

export type DocSelectMode = KnowledgeSourceModeValues

export type DocSelectValue = KnowledgeCreateFormValues['docSource']

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
  const [browseCategoryId, setBrowseCategoryId] = useState(value.categoryId)
  const selectedCategoryId =
    value.mode === KNOWLEDGE_SOURCE_MODE.DOC_CATE
      ? value.categoryId
      : browseCategoryId

  const handleModeChange = (mode: DocSelectMode) => {
    if (mode === KNOWLEDGE_SOURCE_MODE.DOC_CATE) {
      onChange({
        mode,
        categoryId: selectedCategoryId ?? '',
        docIds: undefined
      })
    } else {
      setBrowseCategoryId(value.categoryId)
      onChange({
        mode,
        categoryId: undefined,
        docIds: value.docIds ?? []
      })
    }

    onBlur?.()
  }

  const handleCategoryChange = (categoryId: string) => {
    setBrowseCategoryId(categoryId)

    if (value.mode === KNOWLEDGE_SOURCE_MODE.DOC_CATE) {
      onChange({
        mode: KNOWLEDGE_SOURCE_MODE.DOC_CATE,
        categoryId,
        docIds: undefined
      })
    }

    onBlur?.()
  }

  const handleSelectedDocIdsChange = (docIds: string[]) => {
    onChange({
      mode: KNOWLEDGE_SOURCE_MODE.DOC,
      categoryId: undefined,
      docIds
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
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleCategoryChange}
          disabled={disabled}
        />
        <DocSelectTable
          pageSize={pageSize}
          categoryId={selectedCategoryId}
          selectedDocIds={value.docIds ?? []}
          onSelectedDocIdsChange={handleSelectedDocIdsChange}
          disabled={disabled || value.mode !== KNOWLEDGE_SOURCE_MODE.DOC}
        />
      </div>
    </div>
  )
}
