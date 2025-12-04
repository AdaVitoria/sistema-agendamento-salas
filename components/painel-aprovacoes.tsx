"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Agendamento {
  id: number;
  codigoAgendamento: string;
  nome: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  status: string;
  criador: {
    id: number;
    nome: string;
    email: string;
  };
  sala: {
    id: number;
    nome: string;
    capacidade: number;
  };
}

export function PainelAprovacoes() {
  const { toast } = useToast();
  const [agendamentosPendentes, setAgendamentosPendentes] = useState<
    Agendamento[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dialogRecusaAberto, setDialogRecusaAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] =
    useState<Agendamento | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    carregarPendentes();
  }, []);

  async function carregarPendentes() {
    setLoading(true);
    try {
      const response = await fetch("/api/agendamentos?status=pendente");
      const data = await response.json();
      setAgendamentosPendentes(data);
    } catch (error) {
      console.error("Erro ao carregar pendentes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações pendentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function aprovarAgendamento(agendamento: Agendamento) {
    setProcessando(true);
    try {
      const response = await fetch(`/api/agendamentos/${agendamento.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ativo" }),
      });

      if (!response.ok) {
        throw new Error("Erro ao aprovar agendamento");
      }

      toast({
        title: "Agendamento aprovado",
        description: `A reunião "${agendamento.nome}" foi aprovada com sucesso`,
      });

      // Remover da lista
      setAgendamentosPendentes((prev) =>
        prev.filter((a) => a.id !== agendamento.id)
      );
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o agendamento",
        variant: "destructive",
      });
    } finally {
      setProcessando(false);
    }
  }

  function abrirDialogRecusa(agendamento: Agendamento) {
    setAgendamentoSelecionado(agendamento);
    setMotivoRecusa("");
    setDialogRecusaAberto(true);
  }

  async function confirmarRecusa() {
    if (!agendamentoSelecionado) return;

    setProcessando(true);
    try {
      const response = await fetch(
        `/api/agendamentos/${agendamentoSelecionado.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "cancelado",
            motivo: motivoRecusa || "Sem motivo especificado",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao recusar agendamento");
      }

      toast({
        title: "Agendamento recusado",
        description: `A solicitação de "${agendamentoSelecionado.nome}" foi recusada`,
      });

      // Remover da lista
      setAgendamentosPendentes((prev) =>
        prev.filter((a) => a.id !== agendamentoSelecionado.id)
      );
      setDialogRecusaAberto(false);
    } catch (error) {
      console.error("Erro ao recusar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível recusar o agendamento",
        variant: "destructive",
      });
    } finally {
      setProcessando(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">
              Carregando solicitações...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Solicitações Pendentes
              </CardTitle>
              <CardDescription>
                Aprovar ou recusar agendamentos que precisam de autorização
              </CardDescription>
            </div>
            {agendamentosPendentes.length > 0 && (
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {agendamentosPendentes.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {agendamentosPendentes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma solicitação pendente no momento
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reunião</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Sala</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agendamentosPendentes.map((agendamento) => (
                    <TableRow key={agendamento.id}>
                      <TableCell className="font-medium">
                        {agendamento.nome}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">
                            {agendamento.criador.nome}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {agendamento.criador.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{agendamento.sala.nome}</TableCell>
                      <TableCell>
                        {format(new Date(agendamento.data), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(agendamento.horaInicio), "HH:mm", {
                          locale: ptBR,
                        })}{" "}
                        -{" "}
                        {format(new Date(agendamento.horaFim), "HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => aprovarAgendamento(agendamento)}
                            disabled={processando}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => abrirDialogRecusa(agendamento)}
                            disabled={processando}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de recusa */}
      <Dialog open={dialogRecusaAberto} onOpenChange={setDialogRecusaAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar Agendamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja recusar esta solicitação? Você pode
              fornecer um motivo opcional.
            </DialogDescription>
          </DialogHeader>

          {agendamentoSelecionado && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <div className="font-semibold">
                  {agendamentoSelecionado.nome}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Solicitado por: {agendamentoSelecionado.criador.nome}
                </div>
              </div>

              <div>
                <Label htmlFor="motivo">Motivo da recusa (opcional)</Label>
                <Textarea
                  id="motivo"
                  value={motivoRecusa}
                  onChange={(e) => setMotivoRecusa(e.target.value)}
                  placeholder="Ex: Sala já possui outro agendamento..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogRecusaAberto(false)}
              disabled={processando}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarRecusa}
              disabled={processando}
            >
              {processando ? "Recusando..." : "Confirmar Recusa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
