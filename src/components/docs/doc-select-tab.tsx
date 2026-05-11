'use client'

import {
  KNOWLEDGE_SOURCE_MODE,
  type KnowledgeSourceModeValues
} from '@/modules/knowledges/schemas'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export type DocSelectMode = KnowledgeSourceModeValues

export type DocSelectValue = {
  mode: DocSelectMode
  categoryId?: string
  docIds: string[]
}

interface DocSelectTabProps {
  mode: DocSelectMode
  onModeChange: (mode: DocSelectMode) => void
  disabled?: boolean
}

export function DocSelectTab({
  mode,
  onModeChange,
  disabled = false
}: DocSelectTabProps) {
  return (
    <RadioGroup
      defaultValue={mode}
      value={mode}
      onValueChange={value => onModeChange(value as DocSelectMode)}
      orientation='horizontal'
      className='flex flex-row gap-3'
      disabled={disabled}
    >
      <FieldLabel
        htmlFor='doc-select-mode-category'
        className='max-w-sm flex-1'
      >
        <Field orientation='horizontal'>
          <FieldContent>
            <FieldTitle>选择类目</FieldTitle>
            <FieldDescription>
              选择数据中心的文件类目，将类目下的所有文件导入并构建索引
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem
            value={KNOWLEDGE_SOURCE_MODE.DOC_CATE}
            id='doc-select-mode-category'
          />
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor='doc-select-mode-file' className='max-w-sm flex-1'>
        <Field orientation='horizontal'>
          <FieldContent>
            <FieldTitle>选择文件</FieldTitle>
            <FieldDescription>
              选择应用数据类目下的文件构建索引
            </FieldDescription>
          </FieldContent>
          <RadioGroupItem
            value={KNOWLEDGE_SOURCE_MODE.DOC}
            id='doc-select-mode-file'
          />
        </Field>
      </FieldLabel>
    </RadioGroup>
  )
}
