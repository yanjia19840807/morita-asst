import { requireRoles } from '@/modules/auth/service'
import { ValidationError } from '@/lib/api/errors'
import z from 'zod'
import {
  createPromptProfileRecord,
  findAllPromptProfiles,
  findPromptProfileById,
  findPromptProfiles,
  type FetchPromptProfilesParams,
  type FetchPromptProfilesResult,
  type PromptProfileOption,
  updatePromptProfileRecord
} from './repository'
import {
  promptProfileCreateSchema,
  promptProfileEditSchema,
  promptProfileIdSchema,
  type PromptProfileCreateFormValues,
  type PromptProfileEditFormValues
} from './schemas'

export type {
  FetchPromptProfilesParams,
  FetchPromptProfilesResult,
  PromptProfileOption,
  PromptProfileRow
} from './repository'

export async function fetchAllPromptProfiles(): Promise<PromptProfileOption[]> {
  await requireRoles(['admin'])
  return findAllPromptProfiles()
}

export async function fetchPromptProfiles(
  params: FetchPromptProfilesParams
): Promise<FetchPromptProfilesResult> {
  await requireRoles(['admin'])
  return findPromptProfiles(params)
}

export async function fetchPromptProfileById(id: string) {
  await requireRoles(['admin'])
  const validation = promptProfileIdSchema.safeParse(id)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return findPromptProfileById(validation.data)
}

export async function createPromptProfile(data: PromptProfileCreateFormValues) {
  const user = await requireRoles(['admin'])
  const validation = promptProfileCreateSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return createPromptProfileRecord({
    ...validation.data,
    userId: user.id
  })
}

export async function editPromptProfile(data: PromptProfileEditFormValues) {
  await requireRoles(['admin'])
  const validation = promptProfileEditSchema.safeParse(data)

  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return updatePromptProfileRecord(validation.data)
}
