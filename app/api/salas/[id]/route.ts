import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const sala = await prisma.sala.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        criador: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    })

    if (!sala) {
      return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 })
    }

    return NextResponse.json(sala)
  } catch (error) {
    console.error('[v0] Erro ao buscar sala:', error)
    return NextResponse.json({ error: 'Erro ao buscar sala' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.tipoUsuario !== 'Admin') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, capacidade, tipoSala, nivelAcesso } = body

    const sala = await prisma.sala.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(nome && { nome }),
        ...(capacidade && { capacidade: parseInt(capacidade) }),
        ...(tipoSala && { tipoSala }),
        ...(nivelAcesso && { nivelAcesso })
      },
      include: {
        criador: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(sala)
  } catch (error) {
    console.error('[v0] Erro ao atualizar sala:', error)
    return NextResponse.json({ error: 'Erro ao atualizar sala' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.tipoUsuario !== 'Admin') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    await prisma.sala.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ message: 'Sala deletada com sucesso' })
  } catch (error) {
    console.error('[v0] Erro ao deletar sala:', error)
    return NextResponse.json({ error: 'Erro ao deletar sala' }, { status: 500 })
  }
}
