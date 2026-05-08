import { use } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@/components/ui/combobox'
import type { DocumentCategory } from '@/generated/prisma/client'

interface DocCateComboboxProps {
  docCatesPromise: Promise<DocumentCategory[]>
  value: string | undefined
  onChange: (value: string) => void
  onBlur: () => void
  disabled?: boolean | undefined
  invalid: boolean | undefined
}

export default function DocCateCombobox({
  docCatesPromise,
  value,
  onChange,
  onBlur,
  disabled,
  invalid
}: DocCateComboboxProps) {
  const docCates = use(docCatesPromise)

  const options = docCates.map(item => ({
    label: item.name,
    value: item.id
  }))

  const selectedOption = options.find(item => item.value === value) ?? null

  return (
    <Combobox
      items={options}
      value={selectedOption}
      onValueChange={nextValue => onChange(nextValue?.value ?? '')}
    >
      <ComboboxInput
        placeholder='请选择类目'
        disabled={disabled}
        aria-invalid={invalid}
        onBlur={onBlur}
      />
      <ComboboxContent>
        <ComboboxEmpty>没有匹配的类目</ComboboxEmpty>
        <ComboboxList>
          {option => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
