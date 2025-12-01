import { NextRequest, NextResponse } from 'next/server'
import { createUsuario, getUsuarioByEmail } from '@/lib/auth'
import { createUsuarioSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, cargo, tipoUsuario } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const existingUser = await getUsuarioByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      )
    }

    const user = await createUsuario(
      email, 
      password, 
      name, 
      cargo || 'Funcionario',
      tipoUsuario || 'Comum'
    )

    await createUsuarioSession(user)

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('[v0] Register error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}
