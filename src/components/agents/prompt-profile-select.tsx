'use client'

import { use } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor
} from '@/components/ui/combobox'
import type { PromptProfileOptionDto } from '@/modules/prompt-profiles/dto'

interface PromptProfileSelectProps {
  promptPromise: Promise<Array<PromptProfileOptionDto>>
  value: string | undefined
  onChange: (value: string | undefined) => void
  onBlur: () => void
  disabled?: boolean
  invalid?: boolean
}

export function PromptProfileSelect({
  promptPromise,
  value,
  onChange
}: PromptProfileSelectProps) {
  const promptProfiles = use(promptPromise)
  const anchor = useComboboxAnchor()
  const selectedOption =
    promptProfiles.find(option => option.id === value) ?? null

  return (
    <Combobox
      items={promptProfiles}
      itemToStringLabel={item => item.name}
      itemToStringValue={item => item.id}
      value={selectedOption}
      onValueChange={nextValue => onChange(nextValue?.id)}
    >
      <ComboboxInput placeholder='请选择提示词模板' />
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>没有匹配的提示词模板</ComboboxEmpty>
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
