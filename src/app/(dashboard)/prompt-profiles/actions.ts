'use server'

import { revalidatePath } from 'next/cache'
import { ResponseResult } from '@/lib/api/shared/response'
import {
  handleActionError,
  handleActionResult
} from '@/lib/api/server/response'
import {
  createPromptProfile,
  editPromptProfile
} from '@/data-access/prompt-profile'
import {
  PromptProfileCreateFormValues,
  PromptProfileEditFormValues
} from '@/schemas/prompt-profile'
import { PromptProfile } from '@/generated/prisma/client'

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
