'use client'

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor
} from '@/components/ui/combobox'
import {
  PROFILE_ISSUE_TAG_OPTIONS,
  type ProfileOption
} from '@/modules/profiles/constants'

type ProfileIssueTagsComboboxProps = {
  value: string[]
  onChange: (value: string[]) => void
  onBlur: () => void
  disabled?: boolean
  invalid?: boolean
}

export function ProfileIssueTagsCombobox({
  value,
  onChange,
  onBlur,
  disabled,
  invalid
}: ProfileIssueTagsComboboxProps) {
  const anchor = useComboboxAnchor()
  const selectedOptions = PROFILE_ISSUE_TAG_OPTIONS.filter(item =>
    value.includes(item.value)
  )

  return (
    <Combobox<ProfileOption, true>
      multiple
      autoHighlight
      items={PROFILE_ISSUE_TAG_OPTIONS}
      value={selectedOptions}
      onValueChange={nextValue =>
        onChange((nextValue ?? []).map(item => item.value))
      }
    >
      <ComboboxChips ref={anchor} aria-invalid={invalid}>
        <ComboboxValue>
          {(values: ProfileOption[]) => (
            <>
              {values.map(option => (
                <ComboboxChip key={option.value}>
                  {option.label}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={values.length ? '继续选择标签' : '请选择标签'}
                disabled={disabled}
                onBlur={onBlur}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>没有匹配的标签</ComboboxEmpty>
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
