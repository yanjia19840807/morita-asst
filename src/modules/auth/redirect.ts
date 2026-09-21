export const DEFAULT_AUTH_REDIRECT = '/agents'
export const DEFAULT_LOGOUT_REDIRECT = '/'
export const SIGN_IN_PATH = '/sign-in/email'
export const SIGN_UP_PATH = '/sign-up/email'
export const FORGOT_PASSWORD_PATH = '/forgot-password/email'

export const AUTH_ENTRY_PATHS = [
  SIGN_IN_PATH,
  SIGN_UP_PATH,
  FORGOT_PASSWORD_PATH
] as const

export function isAuthEntryPath(pathname: string) {
  return AUTH_ENTRY_PATHS.includes(
    pathname as (typeof AUTH_ENTRY_PATHS)[number]
  )
}

export function parseCallbackUrl(value: string | null | undefined) {
  if (!value) {
    return null
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return null
  }

  const pathname = value.split('?')[0] ?? value
  if (isAuthEntryPath(pathname) || pathname.startsWith('/reset-password')) {
    return null
  }

  return value
}

export function resolveAuthRedirect(value: string | null | undefined) {
  return parseCallbackUrl(value) ?? DEFAULT_AUTH_REDIRECT
}

export function withCallbackUrl(path: string, callbackUrl?: string | null) {
  const next = parseCallbackUrl(callbackUrl)
  if (!next || next === DEFAULT_AUTH_REDIRECT) {
    return path
  }

  const params = new URLSearchParams({ callbackUrl: next })
  return `${path}?${params.toString()}`
}

export function buildSignInUrl(callbackUrl?: string | null) {
  return withCallbackUrl(SIGN_IN_PATH, callbackUrl)
}
