'use client'

import { Controller, type UseFormReturn } from 'react-hook-form'

import { ProfileOccupationCombobox } from '@/components/profiles/profile-occupation-combobox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  PROFILE_AGE_RANGE_OPTIONS,
  PROFILE_GENDER_OPTIONS
} from '@/modules/profiles/constants'
import type { UserProfileBackgroundValues } from '@/modules/profiles/schemas'

export function UserProfileBackgroundFields({
  form,
  disabled,
  showSeparator = true,
  showLegend = true
}: {
  form: UseFormReturn<UserProfileBackgroundValues>
  disabled?: boolean
  showSeparator?: boolean
  showLegend?: boolean
}) {
  const fields = (
    <>
      <div className='grid gap-5 md:grid-cols-2'>
        <Controller
          name='gender'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>性别</FieldLabel>
              <Select
                value={field.value || null}
                onValueChange={value => field.onChange(value ?? '')}
                items={PROFILE_GENDER_OPTIONS}
                disabled={disabled}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className='w-full'
                >
                  <SelectValue placeholder='请选择性别' />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_GENDER_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && fieldState.error ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
        <Controller
          name='ageRange'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>年龄段</FieldLabel>
              <Select
                value={field.value || null}
                onValueChange={value => field.onChange(value ?? '')}
                items={PROFILE_AGE_RANGE_OPTIONS}
                disabled={disabled}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className='w-full'
                >
                  <SelectValue placeholder='请选择年龄段' />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_AGE_RANGE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && fieldState.error ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </div>
      <Controller
        name='occupation'
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>职业</FieldLabel>
            <ProfileOccupationCombobox
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={disabled}
              invalid={fieldState.invalid}
            />
            {fieldState.invalid && fieldState.error ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}
          </Field>
        )}
      />
    </>
  )

  if (!showLegend) {
    return (
      <>
        {showSeparator ? <FieldSeparator /> : null}
        {fields}
      </>
    )
  }

  return (
    <>
      {showSeparator ? <FieldSeparator /> : null}
      <FieldSet>
        <FieldLegend>画像背景</FieldLegend>
        <FieldDescription>
          可选。问题和标签请到画像页单独维护。
        </FieldDescription>
        <FieldGroup>{fields}</FieldGroup>
      </FieldSet>
    </>
  )
}
