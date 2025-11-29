import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { 
  precisaAprovacao, 
  getLimiteDiasAgendamento,
  getLimiteDuracaoHoras,
  temAcessoSala 
} from '@/lib/types'
import type { Cargo, NivelAcesso } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (dataInicio && dataFim) {
      where.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim)
      }
    }

    const agendamentos = await prisma.agendamento.findMany({
      where,
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
      },
      orderBy: [
        { data: 'asc' },
        { horaInicio: 'asc' }
      ]
    })

    return NextResponse.json(agendamentos)
  } catch (error) {
    console.error('[v0] Erro ao buscar agendamentos:', error)
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { nome, salaId, data, horaInicio, horaFim, participantesIds } = body

    if (!nome || !salaId || !data || !horaInicio || !horaFim) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Buscar sala para verificar permissões
    const sala = await prisma.sala.findUnique({
      where: { id: parseInt(salaId) }
    })

    if (!sala) {
      return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário tem acesso à sala
    if (!temAcessoSala(user.cargo as Cargo, sala.nivelAcesso as NivelAcesso)) {
      return NextResponse.json({ error: 'Sem acesso a esta sala' }, { status: 403 })
    }

    // Verificar limite de dias de antecedência
    const limiteDias = getLimiteDiasAgendamento(user.cargo as Cargo)
    if (limiteDias !== null) {
      const dataAgendamento = new Date(data)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      const diasDiferenca = Math.ceil((dataAgendamento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diasDiferenca > limiteDias) {
        return NextResponse.json({ 
          error: `Seu cargo permite agendar apenas até ${limiteDias} dias no futuro` 
        }, { status: 400 })
      }
    }

    // Verificar duração máxima
    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number)
    const [horaFimH, horaFimM] = horaFim.split(':').map(Number)
    const duracaoMinutos = (horaFimH * 60 + horaFimM) - (horaInicioH * 60 + horaInicioM)
    const duracaoHoras = duracaoMinutos / 60
    
    const limiteDuracao = getLimiteDuracaoHoras(user.cargo as Cargo)
    if (limiteDuracao !== null && duracaoHoras > limiteDuracao) {
      return NextResponse.json({ 
        error: `Seu cargo permite agendar reuniões de até ${limiteDuracao} hora(s)` 
      }, { status: 400 })
    }

    // Verificar conflitos de horário
    const conflito = await prisma.agendamento.findFirst({
      where: {
        salaId: parseInt(salaId),
        data: new Date(data),
        status: { in: ['ativo', 'pendente'] },
        OR: [
          {
            AND: [
              { horaInicio: { lte: new Date(`1970-01-01T${horaInicio}`) } },
              { horaFim: { gt: new Date(`1970-01-01T${horaInicio}`) } }
            ]
          },
          {
            AND: [
              { horaInicio: { lt: new Date(`1970-01-01T${horaFim}`) } },
              { horaFim: { gte: new Date(`1970-01-01T${horaFim}`) } }
            ]
          },
          {
            AND: [
              { horaInicio: { gte: new Date(`1970-01-01T${horaInicio}`) } },
              { horaFim: { lte: new Date(`1970-01-01T${horaFim}`) } }
            ]
          }
        ]
      }
    })

    if (conflito) {
      return NextResponse.json({ 
        error: 'Já existe um agendamento neste horário' 
      }, { status: 400 })
    }

    // Determinar status baseado no cargo
    const status = precisaAprovacao(user.cargo as Cargo) ? 'pendente' : 'ativo'

    // Gerar código único
    const codigoAgendamento = `AGD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Criar agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        codigoAgendamento,
        nome,
        data: new Date(data),
        horaInicio: new Date(`1970-01-01T${horaInicio}`),
        horaFim: new Date(`1970-01-01T${horaFim}`),
        status,
        criadorId: user.id,
        salaId: parseInt(salaId),
        participantes: {
          create: participantesIds?.map((id: number) => ({
            usuarioId: id
          })) || []
        }
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

    return NextResponse.json({ 
      agendamento, 
      precisouAprovacao: status === 'pendente' 
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Erro ao criar agendamento:', error)
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 })
  }
}
