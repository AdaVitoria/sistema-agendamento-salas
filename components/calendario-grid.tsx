'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Sala {
  id: number
  nome: string
  capacidade: number
  tipoSala: string
  nivelAcesso: string
}

interface Agendamento {
  id: number
  codigoAgendamento: string
  nome: string
  data: string
  horaInicio: string
  horaFim: string
  status: 'ativo' | 'pendente' | 'cancelado'
  salaId: number
  criador: {
    id: number
    nome: string
    email: string
  }
  sala: Sala
}

interface CalendarioGridProps {
  onClickSlot: (salaId: number, dia: Date, hora: number) => void
  onClickAgendamento: (agendamento: Agendamento) => void
}

const HORAS = Array.from({ length: 12 }, (_, i) => i + 8) // 8h às 19h
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function CalendarioGrid({ onClickSlot, onClickAgendamento }: CalendarioGridProps) {
  const [salas, setSalas] = useState<Sala[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [semanaAtual, setSemanaAtual] = useState(new Date())
  const [loading, setLoading] = useState(true)

  const diasDaSemana = getDiasDaSemana(semanaAtual)

  useEffect(() => {
    carregarDados()
  }, [semanaAtual])

  async function carregarDados() {
    setLoading(true)
    try {
      // Buscar salas filtradas por acesso
      const resSalas = await fetch('/api/salas?filtrarPorAcesso=true')
      const salasData = await resSalas.json()
      setSalas(salasData)

      // Buscar agendamentos da semana
      const inicio = diasDaSemana[0]
      const fim = diasDaSemana[diasDaSemana.length - 1]
      
      const resAgendamentos = await fetch(
        `/api/agendamentos?dataInicio=${inicio.toISOString().split('T')[0]}&dataFim=${fim.toISOString().split('T')[0]}`
      )
      const agendamentosData = await resAgendamentos.json()
      setAgendamentos(agendamentosData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  function proximaSemana() {
    const proxima = new Date(semanaAtual)
    proxima.setDate(proxima.getDate() + 7)
    setSemanaAtual(proxima)
  }

  function semanaAnterior() {
    const anterior = new Date(semanaAtual)
    anterior.setDate(anterior.getDate() - 7)
    setSemanaAtual(anterior)
  }

  function voltarHoje() {
    setSemanaAtual(new Date())
  }

  function getAgendamentosParaSlot(salaId: number, dia: Date, hora: number) {
    return agendamentos.filter(agendamento => {
      const dataAgendamento = new Date(agendamento.data)
      const horaInicioAgendamento = parseInt(agendamento.horaInicio.split(':')[0])
      const horaFimAgendamento = parseInt(agendamento.horaFim.split(':')[0])
      
      return (
        agendamento.salaId === salaId &&
        dataAgendamento.toDateString() === dia.toDateString() &&
        hora >= horaInicioAgendamento &&
        hora < horaFimAgendamento
      )
    })
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="text-muted-foreground">Carregando calendário...</div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controles de navegação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={semanaAnterior}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={voltarHoje}>
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={proximaSemana}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm font-medium">
          {formatarMesAno(diasDaSemana[0])} - {formatarMesAno(diasDaSemana[diasDaSemana.length - 1])}
        </div>
      </div>

      {/* Grid do calendário */}
      <Card className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Cabeçalho com dias da semana */}
          <div className="grid grid-cols-[150px_repeat(7,1fr)] border-b bg-muted/50">
            <div className="p-3 font-semibold text-sm border-r">Sala / Dia</div>
            {diasDaSemana.map((dia, idx) => (
              <div key={idx} className="p-3 text-center border-r last:border-r-0">
                <div className="font-semibold text-sm">{DIAS_SEMANA[dia.getDay()]}</div>
                <div className={cn(
                  "text-xs text-muted-foreground mt-1",
                  isHoje(dia) && "text-primary font-semibold"
                )}>
                  {dia.getDate()}/{dia.getMonth() + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Linhas de salas */}
          {salas.map(sala => (
            <div key={sala.id} className="grid grid-cols-[150px_repeat(7,1fr)] border-b last:border-b-0">
              {/* Nome da sala */}
              <div className="p-3 border-r bg-muted/30">
                <div className="font-medium text-sm">{sala.nome}</div>
                <div className="text-xs text-muted-foreground">
                  Cap: {sala.capacidade}
                </div>
              </div>

              {/* Células de cada dia para esta sala */}
              {diasDaSemana.map((dia, diaIdx) => (
                <div key={diaIdx} className="border-r last:border-r-0 relative min-h-[80px]">
                  {/* Grid de horas */}
                  <div className="grid grid-rows-12 h-full">
                    {HORAS.map(hora => {
                      const agendamentosNoSlot = getAgendamentosParaSlot(sala.id, dia, hora)
                      const agendamento = agendamentosNoSlot[0] // Pegar o primeiro agendamento

                      return (
                        <div
                          key={hora}
                          className={cn(
                            "border-b last:border-b-0 p-1 cursor-pointer hover:bg-muted/50 transition-colors",
                            agendamento && "bg-transparent hover:bg-transparent"
                          )}
                          onClick={() => {
                            if (!agendamento) {
                              onClickSlot(sala.id, dia, hora)
                            }
                          }}
                        >
                          {agendamento && hora === parseInt(agendamento.horaInicio.split(':')[0]) && (
                            <div
                              className={cn(
                                "p-2 rounded text-xs cursor-pointer transition-all hover:shadow-md",
                                agendamento.status === 'ativo' && "bg-blue-500 text-white",
                                agendamento.status === 'pendente' && "bg-yellow-500 text-yellow-950 border-2 border-yellow-600"
                              )}
                              style={{
                                minHeight: `${calcularAlturaBloco(agendamento) * 100}%`
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                onClickAgendamento(agendamento)
                              }}
                            >
                              <div className="font-semibold truncate">{agendamento.nome}</div>
                              <div className="text-xs opacity-90 truncate mt-1">
                                {agendamento.criador.nome}
                              </div>
                              <div className="text-xs opacity-80 mt-1">
                                {agendamento.horaInicio.slice(0, 5)} - {agendamento.horaFim.slice(0, 5)}
                              </div>
                              {agendamento.status === 'pendente' && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  Pendente
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// Funções auxiliares
function getDiasDaSemana(data: Date): Date[] {
  const dia = new Date(data)
  const diaDaSemana = dia.getDay()
  const domingo = new Date(dia)
  domingo.setDate(dia.getDate() - diaDaSemana)
  
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(domingo)
    d.setDate(domingo.getDate() + i)
    return d
  })
}

function formatarMesAno(data: Date): string {
  return data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

function isHoje(data: Date): boolean {
  const hoje = new Date()
  return data.toDateString() === hoje.toDateString()
}

function calcularAlturaBloco(agendamento: Agendamento): number {
  const [horaInicio, minInicio] = agendamento.horaInicio.split(':').map(Number)
  const [horaFim, minFim] = agendamento.horaFim.split(':').map(Number)
  
  const duracaoMinutos = (horaFim * 60 + minFim) - (horaInicio * 60 + minInicio)
  const duracaoHoras = duracaoMinutos / 60
  
  return duracaoHoras
}
