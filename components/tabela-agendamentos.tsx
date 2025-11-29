"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Agendamento {
  id: number
  codigoAgendamento: string
  nome: string
  data: string
  horaInicio: string
  horaFim: string
  status: "ativo" | "pendente" | "cancelado"
  criador: {
    id: number
    nome: string
    email: string
  }
  sala: {
    id: number
    nome: string
    capacidade: number
    tipoSala: string
  }
  participantes: Array<{
    usuario: {
      id: number
      nome: string
      email: string
    }
  }>
}

interface TabelaAgendamentosProps {
  onClickAgendamento: (agendamento: Agendamento) => void
}

export function TabelaAgendamentos({ onClickAgendamento }: TabelaAgendamentosProps) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [paginaAtual, setPaginaAtual] = useState(1)
  const itensPorPagina = 10

  useEffect(() => {
    carregarAgendamentos()
  }, [])

  async function carregarAgendamentos() {
    setLoading(true)
    try {
      const response = await fetch("/api/agendamentos")
      if (response.ok) {
        const data = await response.json()
        // Ordenar por data e hora
        const ordenados = data.sort((a: Agendamento, b: Agendamento) => {
          const dataA = new Date(`${a.data}T${a.horaInicio}`)
          const dataB = new Date(`${b.data}T${b.horaInicio}`)
          return dataB.getTime() - dataA.getTime()
        })
        setAgendamentos(ordenados)
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  const agendamentosFiltrados = agendamentos.filter((agendamento) => {
    if (filtroStatus === "todos") return true
    return agendamento.status === filtroStatus
  })

  const totalPaginas = Math.ceil(agendamentosFiltrados.length / itensPorPagina)
  const indiceInicio = (paginaAtual - 1) * itensPorPagina
  const indiceFim = indiceInicio + itensPorPagina
  const agendamentosPaginados = agendamentosFiltrados.slice(indiceInicio, indiceFim)

  function proximaPagina() {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1)
    }
  }

  function paginaAnterior() {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Carregando agendamentos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-muted-foreground">Status:</div>
          <Select
            value={filtroStatus}
            onValueChange={(value) => {
              setFiltroStatus(value)
              setPaginaAtual(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="cancelado">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          {agendamentosFiltrados.length} {agendamentosFiltrados.length === 1 ? "agendamento" : "agendamentos"}
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-border/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Código</TableHead>
              <TableHead className="font-semibold">Reunião</TableHead>
              <TableHead className="font-semibold">Sala</TableHead>
              <TableHead className="font-semibold">Data</TableHead>
              <TableHead className="font-semibold">Horário</TableHead>
              <TableHead className="font-semibold">Solicitante</TableHead>
              <TableHead className="font-semibold">Participantes</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agendamentosPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground font-medium">Nenhum agendamento encontrado</p>
                    <p className="text-sm text-muted-foreground">Crie um novo agendamento para começar</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              agendamentosPaginados.map((agendamento) => (
                <TableRow
                  key={agendamento.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onClickAgendamento(agendamento)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {agendamento.codigoAgendamento}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{agendamento.nome}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-muted">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{agendamento.sala.nome}</div>
                        <div className="text-xs text-muted-foreground">Cap. {agendamento.sala.capacidade}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(agendamento.data), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-mono">
                        {agendamento.horaInicio.slice(0, 5)} - {agendamento.horaFim.slice(0, 5)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{agendamento.criador.nome}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {agendamento.criador.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{agendamento.participantes?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        agendamento.status === "ativo"
                          ? "default"
                          : agendamento.status === "pendente"
                            ? "secondary"
                            : "outline"
                      }
                      className="font-medium"
                    >
                      {agendamento.status === "ativo"
                        ? "Ativo"
                        : agendamento.status === "pendente"
                          ? "Pendente"
                          : "Cancelado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="font-medium">
                      Ver detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground font-medium">
            Página {paginaAtual} de {totalPaginas}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={paginaAnterior}
              disabled={paginaAtual === 1}
              className="gap-1 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={proximaPagina}
              disabled={paginaAtual === totalPaginas}
              className="gap-1 bg-transparent"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
