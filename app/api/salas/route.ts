import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { temAcessoSala } from '@/lib/types'
import type { Cargo, NivelAcesso } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const filtrarPorAcesso = searchParams.get('filtrarPorAcesso') === 'true'

    let salas = await prisma.sala.findMany({
      include: {
        criador: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    })

    // Filtrar salas baseado no cargo do usuário se solicitado
    if (filtrarPorAcesso) {
      salas = salas.filter(sala => 
        temAcessoSala(user.cargo as Cargo, sala.nivelAcesso as NivelAcesso)
      )
    }

    return NextResponse.json(salas)
  } catch (error) {
    console.error('[v0] Erro ao buscar salas:', error)
    return NextResponse.json({ error: 'Erro ao buscar salas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.tipoUsuario !== 'Admin') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { nome, capacidade, tipoSala, nivelAcesso } = body

    if (!nome || !capacidade || !tipoSala || !nivelAcesso) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const sala = await prisma.sala.create({
      data: {
        nome,
        capacidade: parseInt(capacidade),
        tipoSala,
        nivelAcesso,
        criadorId: user.id
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

    return NextResponse.json(sala, { status: 201 })
  } catch (error) {
    console.error('[v0] Erro ao criar sala:', error)
    return NextResponse.json({ error: 'Erro ao criar sala' }, { status: 500 })
  }
}
