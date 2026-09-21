import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/modules/auth/server'
import {
  isAuthEntryPath,
  resolveAuthRedirect,
  SIGN_IN_PATH
} from '@/modules/auth/redirect'

function hasSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some(cookie => cookie.name.includes('session_token'))
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const loggedInHint = hasSessionCookie(request)

  if (!loggedInHint) {
    if (isAuthEntryPath(pathname)) {
      return NextResponse.next()
    }

    const signInUrl = new URL(SIGN_IN_PATH, request.url)
    signInUrl.searchParams.set('callbackUrl', `${pathname}${search}`)
    return NextResponse.redirect(signInUrl)
  }

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session && isAuthEntryPath(pathname)) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
    return NextResponse.redirect(
      new URL(resolveAuthRedirect(callbackUrl), request.url)
    )
  }

  if (!session && !isAuthEntryPath(pathname)) {
    const signInUrl = new URL(SIGN_IN_PATH, request.url)
    signInUrl.searchParams.set('callbackUrl', `${pathname}${search}`)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/agents/:path*',
    '/docs/:path*',
    '/knowledges/:path*',
    '/prompt-profiles/:path*',
    '/users/:path*',
    '/profile/:path*',
    '/bookmarks/:path*',
    '/sign-in/:path*',
    '/sign-up/:path*',
    '/forgot-password/:path*'
  ]
}
