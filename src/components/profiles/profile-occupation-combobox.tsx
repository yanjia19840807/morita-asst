'use client'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@/components/ui/combobox'
import {
  PROFILE_OCCUPATION_OPTIONS,
  type ProfileOption
} from '@/modules/profiles/constants'

type ProfileOccupationComboboxProps = {
  value: string | null | undefined
  onChange: (value: string) => void
  onBlur: () => void
  disabled?: boolean
  invalid?: boolean
}

export function ProfileOccupationCombobox({
  value,
  onChange,
  onBlur,
  disabled,
  invalid
}: ProfileOccupationComboboxProps) {
  const selectedOption =
    PROFILE_OCCUPATION_OPTIONS.find(item => item.value === value) ?? null

  return (
    <Combobox<ProfileOption>
      items={PROFILE_OCCUPATION_OPTIONS}
      value={selectedOption}
      onValueChange={nextValue => onChange(nextValue?.value ?? '')}
    >
      <ComboboxInput
        placeholder='请选择职业'
        disabled={disabled}
        aria-invalid={invalid}
        onBlur={onBlur}
        showClear
      />
      <ComboboxContent>
        <ComboboxEmpty>没有匹配的职业</ComboboxEmpty>
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
