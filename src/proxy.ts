import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/modules/auth/server'

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/users/:path*',
    '/docs/:path*',
    '/bookmarks/:path*',
    '/knowledges/:path*'
  ]
}
