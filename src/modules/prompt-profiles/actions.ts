'use server'

import { PromptProfile } from '@/generated/prisma/client'
import { revalidatePath } from 'next/cache'
import {
  ResponseResult,
  handleActionResult,
  handleActionError
} from '@/lib/api/response'
import {
  type PromptProfileCreateFormValues,
  type PromptProfileEditFormValues
} from './schemas'
import { createPromptProfile, editPromptProfile } from './service'

const promptProfilesPath = '/prompt-profiles'

export async function createPromptProfileAction(
  data: PromptProfileCreateFormValues
): Promise<ResponseResult<PromptProfile>> {
  try {
    const result = await createPromptProfile(data)
    revalidatePath(promptProfilesPath)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function editPromptProfileAction(
  data: PromptProfileEditFormValues
): Promise<ResponseResult<PromptProfile>> {
  try {
    const result = await editPromptProfile(data)
    revalidatePath(promptProfilesPath)
    revalidatePath(`${promptProfilesPath}/${data.id}/edit`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}
