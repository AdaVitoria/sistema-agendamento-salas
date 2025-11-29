'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Sala {
  id: number
  nome: string
  capacidade: number
  tipoSala: string
  nivelAcesso: string
}

export function GerenciarSalas() {
  const { toast } = useToast()
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [dialogDeleteAberto, setDialogDeleteAberto] = useState(false)
  const [salaEditando, setSalaEditando] = useState<Sala | null>(null)
  const [salaParaDeletar, setSalaParaDeletar] = useState<Sala | null>(null)
  const [processando, setProcessando] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    capacidade: '',
    tipoSala: '',
    nivelAcesso: ''
  })

  useEffect(() => {
    carregarSalas()
  }, [])

  async function carregarSalas() {
    setLoading(true)
    try {
      const response = await fetch('/api/salas')
      const data = await response.json()
      setSalas(data)
    } catch (error) {
      console.error('Erro ao carregar salas:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as salas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  function abrirDialogNova() {
    setSalaEditando(null)
    setFormData({ nome: '', capacidade: '', tipoSala: '', nivelAcesso: '' })
    setDialogAberto(true)
  }

  function abrirDialogEditar(sala: Sala) {
    setSalaEditando(sala)
    setFormData({
      nome: sala.nome,
      capacidade: sala.capacidade.toString(),
      tipoSala: sala.tipoSala,
      nivelAcesso: sala.nivelAcesso
    })
    setDialogAberto(true)
  }

  function abrirDialogDeletar(sala: Sala) {
    setSalaParaDeletar(sala)
    setDialogDeleteAberto(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setProcessando(true)

    try {
      const url = salaEditando ? `/api/salas/${salaEditando.id}` : '/api/salas'
      const method = salaEditando ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar sala')
      }

      toast({
        title: salaEditando ? 'Sala atualizada' : 'Sala criada',
        description: `A sala "${formData.nome}" foi ${salaEditando ? 'atualizada' : 'criada'} com sucesso`,
      })

      setDialogAberto(false)
      carregarSalas()
    } catch (error) {
      console.error('Erro ao salvar sala:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a sala',
        variant: 'destructive'
      })
    } finally {
      setProcessando(false)
    }
  }

  async function confirmarDelete() {
    if (!salaParaDeletar) return

    setProcessando(true)
    try {
      const response = await fetch(`/api/salas/${salaParaDeletar.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar sala')
      }

      toast({
        title: 'Sala deletada',
        description: `A sala "${salaParaDeletar.nome}" foi deletada com sucesso`,
      })

      setDialogDeleteAberto(false)
      carregarSalas()
    } catch (error) {
      console.error('Erro ao deletar sala:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar a sala',
        variant: 'destructive'
      })
    } finally {
      setProcessando(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando salas...</div>
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Gerenciamento de Salas</h3>
            <p className="text-sm text-muted-foreground">
              Criar, editar e excluir salas do sistema
            </p>
          </div>
          <Button onClick={abrirDialogNova}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Sala
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salas.map(sala => (
                <TableRow key={sala.id}>
                  <TableCell className="font-medium">{sala.nome}</TableCell>
                  <TableCell>{sala.capacidade} pessoas</TableCell>
                  <TableCell className="capitalize">{sala.tipoSala}</TableCell>
                  <TableCell>{sala.nivelAcesso}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirDialogEditar(sala)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => abrirDialogDeletar(sala)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog Criar/Editar */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{salaEditando ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
            <DialogDescription>
              Preencha os dados da sala
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Sala de Reunião 1"
                required
              />
            </div>

            <div>
              <Label htmlFor="capacidade">Capacidade</Label>
              <Input
                id="capacidade"
                type="number"
                value={formData.capacidade}
                onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                placeholder="Ex: 10"
                required
              />
            </div>

            <div>
              <Label htmlFor="tipoSala">Tipo de Sala</Label>
              <Select 
                value={formData.tipoSala} 
                onValueChange={(value) => setFormData({ ...formData, tipoSala: value })}
                required
              >
                <SelectTrigger id="tipoSala">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="trabalho">Trabalho</SelectItem>
                  <SelectItem value="treinamento">Treinamento</SelectItem>
                  <SelectItem value="videoconferencia">Videoconferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nivelAcesso">Nível de Acesso</Label>
              <Select 
                value={formData.nivelAcesso} 
                onValueChange={(value) => setFormData({ ...formData, nivelAcesso: value })}
                required
              >
                <SelectTrigger id="nivelAcesso">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Funcionario">Qualquer Funcionário</SelectItem>
                  <SelectItem value="Coordenador">Coordenador ou superior</SelectItem>
                  <SelectItem value="Gerente">Gerente ou superior</SelectItem>
                  <SelectItem value="Diretor">Apenas Diretoria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogAberto(false)}
                disabled={processando}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={processando}>
                {processando ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <Dialog open={dialogDeleteAberto} onOpenChange={setDialogDeleteAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a sala "{salaParaDeletar?.nome}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogDeleteAberto(false)}
              disabled={processando}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarDelete}
              disabled={processando}
            >
              {processando ? 'Deletando...' : 'Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
