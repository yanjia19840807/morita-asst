import { getStoredFileUrl } from '@/modules/storage/urls'

export function getAvatarSrc(image?: string | null) {
  if (!image || image === '/avatar-default.svg') {
    return '/avatar-default.svg'
  }

  if (
    image.startsWith('http') ||
    image.startsWith('/') ||
    image.startsWith('blob:') ||
    image.startsWith('data:')
  ) {
    return image
  }

  return getStoredFileUrl(image)
}
