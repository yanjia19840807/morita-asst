import {
  PROFILE_AGE_RANGE_OPTIONS,
  PROFILE_GENDER_OPTIONS,
  PROFILE_ISSUE_TAG_OPTIONS,
  PROFILE_OCCUPATION_OPTIONS,
  type ProfileOption
} from './constants'

function labelOf(options: ProfileOption[], value?: string | null) {
  if (!value) {
    return '未填写'
  }

  return options.find(item => item.value === value)?.label ?? value
}

export function getGenderLabel(value?: string | null) {
  return labelOf(PROFILE_GENDER_OPTIONS, value)
}

export function getAgeRangeLabel(value?: string | null) {
  return labelOf(PROFILE_AGE_RANGE_OPTIONS, value)
}

export function getOccupationLabel(value?: string | null) {
  return labelOf(PROFILE_OCCUPATION_OPTIONS, value)
}

export function getIssueTagLabel(value: string) {
  return (
    PROFILE_ISSUE_TAG_OPTIONS.find(item => item.value === value)?.label ?? value
  )
}

export function formatIssueTags(tags: string[]) {
  if (!tags.length) {
    return '-'
  }

  return tags.map(getIssueTagLabel).join('、')
}
