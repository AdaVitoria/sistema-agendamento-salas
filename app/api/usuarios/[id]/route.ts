import { NextRequest, NextResponse } from 'next/server'
import { getUsuarioById, updateUsuario, deleteUsuario } from '@/lib/auth'
import { getCurrentUser } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userId = parseInt(params.id)

    // Usuários comuns só podem ver seu próprio perfil
    if (currentUser.tipoUsuario !== 'Admin' && currentUser.id !== userId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const user = await getUsuarioById(userId)

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userId = parseInt(params.id)
    const body = await request.json()

    // Usuários comuns só podem editar seu próprio perfil
    if (currentUser.tipoUsuario !== 'Admin' && currentUser.id !== userId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Apenas admin pode alterar cargo e tipoUsuario
    if (currentUser.tipoUsuario !== 'Admin') {
      delete body.cargo
      delete body.tipoUsuario
    }

    const updatedUser = await updateUsuario(userId, body)
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser || currentUser.tipoUsuario !== 'Admin') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const userId = parseInt(params.id)

    // Não pode deletar a si mesmo
    if (currentUser.id === userId) {
      return NextResponse.json({ error: 'Não pode deletar seu próprio usuário' }, { status: 400 })
    }

    await deleteUsuario(userId)
    return NextResponse.json({ message: 'Usuário deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json({ error: 'Erro ao deletar usuário' }, { status: 500 })
  }
}
