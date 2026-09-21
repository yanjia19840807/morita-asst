import { withAuth } from '@/modules/auth/api'
import { getStoredFileUrl, saveStoredFile } from '@/modules/storage/server'
import { ValidationError } from '@/lib/api/errors'
import { handleApiError, handleApiResult } from '@/lib/api/response'

const AVATAR_MAX_SIZE = 5 * 1024 * 1024
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const runtime = 'nodejs'

export const POST = withAuth(async (request, context) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      throw new ValidationError('请选择要上传的头像')
    }

    if (file.size > AVATAR_MAX_SIZE) {
      throw new ValidationError('头像大小不能超过 5M')
    }

    if (file.type && !AVATAR_TYPES.includes(file.type)) {
      throw new ValidationError('头像仅支持 JPG、PNG、WebP 或 GIF')
    }

    const storageKey = await saveStoredFile('avatars', context.user.id, file)

    return handleApiResult({
      storageKey,
      url: getStoredFileUrl(storageKey)
    })
  } catch (error) {
    return handleApiError(error)
  }
})
