'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Users, Crown, Star } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { 
  getLimiteDiasAgendamento, 
  getLimiteDuracaoHoras,
  temAcessoSala 
} from '@/lib/types'
import type { Cargo, NivelAcesso } from '@/lib/types'

export interface Usuario {
  id: number
  nome: string
  email: string
  cargo: Cargo
  tipoUsuario: string
}

interface Sala {
  id: number
  nome: string
  capacidade: number
  tipoSala: string
  nivelAcesso: NivelAcesso
}

interface AgendamentoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salaIdPre?: number
  dataPre?: Date
  horaInicioPre?: number
  onSuccess: () => void
  usuarioLogado: Usuario
}

export function AgendamentoDialog({
  open,
  onOpenChange,
  salaIdPre,
  dataPre,
  horaInicioPre,
  onSuccess,
  usuarioLogado
}: AgendamentoDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [salas, setSalas] = useState<Sala[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  // Campos do formulário
  const [nome, setNome] = useState('')
  const [salaId, setSalaId] = useState<string>(salaIdPre?.toString() || '')
  const [data, setData] = useState<Date | undefined>(dataPre)
  const [horaInicio, setHoraInicio] = useState(horaInicioPre ? `${horaInicioPre}:00` : '')
  const [horaFim, setHoraFim] = useState('')
  const [participantesIds, setParticipantesIds] = useState<number[]>([])
  const [erroValidacao, setErroValidacao] = useState('')

  // Calcular limites baseados no cargo
  const limiteDias = getLimiteDiasAgendamento(usuarioLogado.cargo)
  const limiteDuracao = getLimiteDuracaoHoras(usuarioLogado.cargo)

  useEffect(() => {
    if (open) {
      carregarDados()
      // Resetar campos se não houver pré-preenchimento
      if (!salaIdPre) setSalaId('')
      if (!dataPre) setData(undefined)
      if (!horaInicioPre) setHoraInicio('')
      setNome('')
      setHoraFim('')
      setParticipantesIds([])
      setErroValidacao('')
    }
  }, [open, salaIdPre, dataPre, horaInicioPre])

  async function carregarDados() {
    try {
      // Carregar salas filtradas por acesso
      const resSalas = await fetch('/api/salas?filtrarPorAcesso=true')
      const salasData = await resSalas.json()
      setSalas(salasData)

      // Carregar usuários para participantes
      const resUsuarios = await fetch('/api/usuarios')
      if (resUsuarios.ok) {
        const usuariosData = await resUsuarios.json()
        setUsuarios(usuariosData.filter((u: Usuario) => u.id !== usuarioLogado.id))
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  // Validar duração em tempo real
  useEffect(() => {
    if (horaInicio && horaFim) {
      const [hI, mI] = horaInicio.split(':').map(Number)
      const [hF, mF] = horaFim.split(':').map(Number)
      
      const duracaoMinutos = (hF * 60 + mF) - (hI * 60 + mI)
      const duracaoHoras = duracaoMinutos / 60

      if (duracaoMinutos <= 0) {
        setErroValidacao('A hora de término deve ser posterior à hora de início')
      } else if (limiteDuracao !== null && duracaoHoras > limiteDuracao) {
        setErroValidacao(`A duração máxima para seu cargo é de ${limiteDuracao} hora(s)`)
      } else {
        setErroValidacao('')
      }
    } else {
      setErroValidacao('')
    }
  }, [horaInicio, horaFim, limiteDuracao])

  // Desabilitar datas no calendário baseado no cargo
  function isDiaDesabilitado(dia: Date): boolean {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // Não pode agendar no passado
    if (dia < hoje) return true

    // Verificar limite de dias
    if (limiteDias !== null) {
      const diasDiferenca = Math.ceil((dia.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      return diasDiferenca > limiteDias
    }

    return false
  }

  function toggleParticipante(id: number) {
    setParticipantesIds(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id)
        : [...prev, id]
    )
  }

  function getSalaIcon(nivelAcesso: NivelAcesso) {
    if (nivelAcesso === 'Diretor') return <Crown className="h-3 w-3 text-yellow-600" />
    if (nivelAcesso === 'Gerente') return <Star className="h-3 w-3 text-blue-600" />
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (erroValidacao) {
      toast({
        title: 'Erro de validação',
        description: erroValidacao,
        variant: 'destructive'
      })
      return
    }

    if (!nome || !salaId || !data || !horaInicio || !horaFim) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          salaId: parseInt(salaId),
          data: data.toISOString().split('T')[0],
          horaInicio,
          horaFim,
          participantesIds
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar agendamento')
      }

      // Mensagem baseada no status
      if (result.precisouAprovacao) {
        toast({
          title: 'Solicitação enviada',
          description: 'Seu agendamento está aguardando aprovação.',
          variant: 'default',
          className: 'bg-yellow-500 text-yellow-950'
        })
      } else {
        toast({
          title: 'Agendamento confirmado',
          description: 'Seu agendamento foi criado com sucesso!',
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error)
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados para agendar uma reunião
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Nome da Reunião */}
          <div>
            <Label htmlFor="nome">Nome da Reunião</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Reunião de Equipe"
              required
            />
          </div>

          {/* Sala */}
          <div>
            <Label htmlFor="sala">Sala</Label>
            <Select value={salaId} onValueChange={setSalaId} required>
              <SelectTrigger id="sala">
                <SelectValue placeholder="Selecione uma sala" />
              </SelectTrigger>
              <SelectContent>
                {salas.map(sala => (
                  <SelectItem key={sala.id} value={sala.id.toString()}>
                    <div className="flex items-center gap-2">
                      {getSalaIcon(sala.nivelAcesso)}
                      <span>{sala.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        (Cap: {sala.capacidade})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {limiteDias !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                Seu cargo permite ver apenas salas disponíveis para seu nível
              </p>
            )}
          </div>

          {/* Data */}
          <div>
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !data && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data ? format(data, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={data}
                  onSelect={setData}
                  disabled={isDiaDesabilitado}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            {limiteDias !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                Seu cargo permite agendar até {limiteDias} dias no futuro
              </p>
            )}
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horaInicio">Hora de Início</Label>
              <Input
                id="horaInicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="horaFim">Hora de Término</Label>
              <Input
                id="horaFim"
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Erro de validação de duração */}
          {erroValidacao && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
              {erroValidacao}
            </div>
          )}

          {limiteDuracao !== null && !erroValidacao && (
            <p className="text-xs text-muted-foreground">
              Duração máxima permitida: {limiteDuracao} hora(s)
            </p>
          )}

          {/* Participantes */}
          <div>
            <Label>Participantes (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  {participantesIds.length > 0 
                    ? `${participantesIds.length} participante(s) selecionado(s)`
                    : 'Adicionar participantes'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {usuarios.map(usuario => (
                    <label
                      key={usuario.id}
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={participantesIds.includes(usuario.id)}
                        onChange={() => toggleParticipante(usuario.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{usuario.nome}</div>
                        <div className="text-xs text-muted-foreground">{usuario.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !!erroValidacao}>
              {loading ? 'Agendando...' : 'Agendar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
