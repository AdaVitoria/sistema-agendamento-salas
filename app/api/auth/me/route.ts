import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user,
    })
  } catch (error) {
    console.error('[v0] Get session error:', error)
    return NextResponse.json(
      { error: 'Erro ao obter sessão' },
      { status: 500 }
    )
  }
}
