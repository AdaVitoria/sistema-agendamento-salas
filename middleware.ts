import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const user = await getCurrentUser()
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/aprovacoes') ||
    pathname.startsWith('/profile')
  ) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (pathname.startsWith('/admin') && user.tipoUsuario !== 'Admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname.startsWith('/aprovacoes')) {
      if (user.cargo !== 'Gerente' && user.cargo !== 'Diretor') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/dashboard/:path*', '/aprovacoes/:path*', '/login', '/register'],
}
