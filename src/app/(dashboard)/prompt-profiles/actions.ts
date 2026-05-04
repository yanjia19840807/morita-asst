'use server'

import { revalidatePath } from 'next/cache'
import {
  handleActionError,
  handleActionResult,
  ResponseResult
} from '@/lib/api/response'
import {
  createPromptProfile,
  editPromptProfile,
  PromptProfileRow
} from '@/data-access/prompt-profile'
import {
  PromptProfileCreateFormValues,
  PromptProfileEditFormValues
} from '@/schemas/prompt-profile'

const promptProfilesPath = '/prompt-profiles'

export async function createPromptProfileAction(
  data: PromptProfileCreateFormValues
): Promise<ResponseResult<PromptProfileRow>> {
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
): Promise<ResponseResult<PromptProfileRow>> {
  try {
    const result = await editPromptProfile(data)
    revalidatePath(promptProfilesPath)
    revalidatePath(`${promptProfilesPath}/${data.id}/edit`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}
