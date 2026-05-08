'use client'

import { use } from 'react'
import type { KnowledgeOption } from '@/dal/knowledges'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor
} from '@/components/ui/combobox'

interface KnowledgeSelectProps {
  knowledgePromise: Promise<Array<KnowledgeOption>>
  value: string | undefined
  onChange: (value: string | undefined) => void
  onBlur: () => void
  disabled?: boolean
  invalid?: boolean
}

export function KnowledgeSelect({
  knowledgePromise,
  value,
  onChange,
  onBlur,
  disabled,
  invalid
}: KnowledgeSelectProps) {
  const knowledges = use(knowledgePromise)
  const anchor = useComboboxAnchor()
  const selectedOption = knowledges.find(option => option.id === value) ?? null

  return (
    <Combobox
      items={knowledges}
      itemToStringLabel={item => item.name}
      itemToStringValue={item => item.id}
      value={selectedOption}
      onValueChange={nextValue => onChange(nextValue?.id)}
    >
      <ComboboxInput placeholder='选择知识库' />
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>没有匹配的知识库</ComboboxEmpty>
        <ComboboxList>
          {item => (
            <ComboboxItem key={item.id} value={item}>
              <div className='min-w-0'>
                <div className='font-medium'>{item.name}</div>
                <div className='text-muted-foreground line-clamp-2 text-sm'>
                  {item.description || '暂无描述'}
                </div>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
