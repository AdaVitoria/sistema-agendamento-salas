"use client"

import { useState, useEffect } from "react"
import { TabelaAgendamentos } from "@/components/tabela-agendamentos"
import { AgendamentoDialog, Usuario } from "@/components/agendamento-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, Plus } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"


interface Agendamento {
  id: number
  codigoAgendamento: string
  nome: string
  data: string
  horaInicio: string
  horaFim: string
  status: string
  criador: {
    id: number
    nome: string
    email: string
  }
  sala: {
    id: number
    nome: string
    capacidade: number
  }
  participantes: Array<{
    usuario: {
      id: number
      nome: string
      email: string
    }
  }>
}

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [dialogAgendamentoAberto, setDialogAgendamentoAberto] = useState(false)
  const [dialogDetalhesAberto, setDialogDetalhesAberto] = useState(false)
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null)

  useEffect(() => {
    carregarUsuario()
  }, [])

  async function carregarUsuario() {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUsuario(data.user)
      }
    } catch (error) {
      console.error("[Erro ao carregar usuário:", error)
    }
  }

  function handleClickAgendamento(agendamento: any) {
    setAgendamentoSelecionado(agendamento)
    setDialogDetalhesAberto(true)
  }

  function handleSuccessAgendamento() {
    window.location.reload()
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-balance">Reuniões Agendadas</h1>
              <p className="text-muted-foreground text-balance">
                Visualize e gerencie todas as reuniões em uma tabela organizada
              </p>
            </div>
            <Button onClick={() => setDialogAgendamentoAberto(true)} size="lg" className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              Nova Reunião
            </Button>
          </div>

          {/* Table Section */}
          <div className="bg-card rounded-lg border border-border/40 p-6">
            <TabelaAgendamentos onClickAgendamento={handleClickAgendamento} />
          </div>
        </div>
      </div>

      <AgendamentoDialog
        open={dialogAgendamentoAberto}
        onOpenChange={setDialogAgendamentoAberto}
        onSuccess={handleSuccessAgendamento}
        usuarioLogado={usuario}
      />

      <Dialog open={dialogDetalhesAberto} onOpenChange={setDialogDetalhesAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes do Agendamento</DialogTitle>
            <DialogDescription>Informações completas sobre este agendamento</DialogDescription>
          </DialogHeader>

          {agendamentoSelecionado && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <h3 className="text-xl font-semibold text-balance">{agendamentoSelecionado.nome}</h3>
                <Badge
                  variant={
                    agendamentoSelecionado.status === "ativo"
                      ? "default"
                      : agendamentoSelecionado.status === "pendente"
                        ? "secondary"
                        : "destructive"
                  }
                  className="px-3 py-1"
                >
                  {agendamentoSelecionado.status === "ativo"
                    ? "Ativo"
                    : agendamentoSelecionado.status === "pendente"
                      ? "Pendente"
                      : "Cancelado"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-md bg-background">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Data</div>
                    <div className="text-sm font-medium">
                      {format(new Date(agendamentoSelecionado.data), "PPP", { locale: ptBR })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-md bg-background">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Horário</div>
                    <div className="text-sm font-medium">
                      {agendamentoSelecionado.horaInicio.slice(0, 5)} - {agendamentoSelecionado.horaFim.slice(0, 5)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-md bg-background">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Sala</div>
                    <div className="text-sm font-medium">{agendamentoSelecionado.sala.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      Capacidade: {agendamentoSelecionado.sala.capacidade}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-md bg-background">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Criado por</div>
                    <div className="text-sm font-medium">{agendamentoSelecionado.criador.nome}</div>
                    <div className="text-xs text-muted-foreground">{agendamentoSelecionado.criador.email}</div>
                  </div>
                </div>
              </div>

              {agendamentoSelecionado.participantes && agendamentoSelecionado.participantes.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-semibold">
                    Participantes ({agendamentoSelecionado.participantes.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {agendamentoSelecionado.participantes.map((p) => (
                      <div key={p.usuario.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {p.usuario.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{p.usuario.nome}</div>
                          <div className="text-xs text-muted-foreground truncate">{p.usuario.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="text-xs text-muted-foreground font-mono">
                  Código: {agendamentoSelecionado.codigoAgendamento}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
