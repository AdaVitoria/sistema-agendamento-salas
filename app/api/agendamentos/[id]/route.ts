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

    const agendamento = await prisma.agendamento.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        criador: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true
          }
        },
        sala: true,
        participantes: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    return NextResponse.json(agendamento)
  } catch (error) {
    console.error('[v0] Erro ao buscar agendamento:', error)
    return NextResponse.json({ error: 'Erro ao buscar agendamento' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { status, motivo } = body

    // Verificar se o usuário tem permissão para aprovar/recusar
    if (user.cargo !== 'Gerente' && user.cargo !== 'Diretor') {
      return NextResponse.json({ error: 'Sem permissão para aprovar/recusar' }, { status: 403 })
    }

    const agendamento = await prisma.agendamento.update({
      where: { id: parseInt(params.id) },
      data: {
        status,
        ...(motivo && { motivoCancelamento: motivo })
      },
      include: {
        criador: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true
          }
        },
        sala: true,
        participantes: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(agendamento)
  } catch (error) {
    console.error('[v0] Erro ao atualizar agendamento:', error)
    return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const agendamento = await prisma.agendamento.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    // Apenas o criador ou admin pode deletar
    if (agendamento.criadorId !== user.id && user.tipoUsuario !== 'Admin') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    await prisma.agendamento.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ message: 'Agendamento deletado com sucesso' })
  } catch (error) {
    console.error('[v0] Erro ao deletar agendamento:', error)
    return NextResponse.json({ error: 'Erro ao deletar agendamento' }, { status: 500 })
  }
}
