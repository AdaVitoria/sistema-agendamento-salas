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
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Plus, Shield, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Usuario {
  id: number
  email: string
  nome: string
  cargo: string
  tipoUsuario: string
}

interface GerenciarUsuariosProps {
  usuarioLogadoId: number
}

export function GerenciarUsuarios({ usuarioLogadoId }: GerenciarUsuariosProps) {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [dialogDeleteAberto, setDialogDeleteAberto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null)
  const [usuarioParaDeletar, setUsuarioParaDeletar] = useState<Usuario | null>(null)
  const [processando, setProcessando] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    cargo: '',
    tipoUsuario: '',
    password: ''
  })

  useEffect(() => {
    carregarUsuarios()
  }, [])

  async function carregarUsuarios() {
    setLoading(true)
    try {
      const response = await fetch('/api/usuarios')
      const data = await response.json()
      setUsuarios(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  function abrirDialogNovo() {
    setUsuarioEditando(null)
    setFormData({ email: '', nome: '', cargo: '', tipoUsuario: '', password: '' })
    setDialogAberto(true)
  }

  function abrirDialogEditar(usuario: Usuario) {
    setUsuarioEditando(usuario)
    setFormData({
      email: usuario.email,
      nome: usuario.nome,
      cargo: usuario.cargo,
      tipoUsuario: usuario.tipoUsuario,
      password: ''
    })
    setDialogAberto(true)
  }

  function abrirDialogDeletar(usuario: Usuario) {
    setUsuarioParaDeletar(usuario)
    setDialogDeleteAberto(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setProcessando(true)

    try {
      const url = usuarioEditando ? `/api/usuarios/${usuarioEditando.id}` : '/api/usuarios'
      const method = usuarioEditando ? 'PUT' : 'POST'

      const body: any = { ...formData }
      // Não enviar senha vazia em edição
      if (usuarioEditando && !formData.password) {
        delete body.password
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar usuário')
      }

      toast({
        title: usuarioEditando ? 'Usuário atualizado' : 'Usuário criado',
        description: `O usuário "${formData.nome}" foi ${usuarioEditando ? 'atualizado' : 'criado'} com sucesso`,
      })

      setDialogAberto(false)
      carregarUsuarios()
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o usuário',
        variant: 'destructive'
      })
    } finally {
      setProcessando(false)
    }
  }

  async function confirmarDelete() {
    if (!usuarioParaDeletar) return

    if (usuarioParaDeletar.id === usuarioLogadoId) {
      toast({
        title: 'Erro',
        description: 'Você não pode deletar seu próprio usuário',
        variant: 'destructive'
      })
      return
    }

    setProcessando(true)
    try {
      const response = await fetch(`/api/usuarios/${usuarioParaDeletar.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar usuário')
      }

      toast({
        title: 'Usuário deletado',
        description: `O usuário "${usuarioParaDeletar.nome}" foi deletado com sucesso`,
      })

      setDialogDeleteAberto(false)
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o usuário',
        variant: 'destructive'
      })
    } finally {
      setProcessando(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando usuários...</div>
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Gerenciamento de Usuários</h3>
            <p className="text-sm text-muted-foreground">
              Criar, editar e excluir usuários do sistema
            </p>
          </div>
          <Button onClick={abrirDialogNovo}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map(usuario => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.email}</TableCell>
                  <TableCell>{usuario.nome}</TableCell>
                  <TableCell>{usuario.cargo}</TableCell>
                  <TableCell>
                    <Badge variant={usuario.tipoUsuario === 'Admin' ? 'default' : 'secondary'}>
                      {usuario.tipoUsuario === 'Admin' ? (
                        <Shield className="h-3 w-3 mr-1" />
                      ) : (
                        <User className="h-3 w-3 mr-1" />
                      )}
                      {usuario.tipoUsuario}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirDialogEditar(usuario)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => abrirDialogDeletar(usuario)}
                        disabled={usuario.id === usuarioLogadoId}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do usuário
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@empresa.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do usuário"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha {usuarioEditando && '(deixe em branco para manter)'}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                required={!usuarioEditando}
              />
            </div>

            <div>
              <Label htmlFor="cargo">Cargo</Label>
              <Select 
                value={formData.cargo} 
                onValueChange={(value) => setFormData({ ...formData, cargo: value })}
                required
              >
                <SelectTrigger id="cargo">
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Funcionario">Funcionário</SelectItem>
                  <SelectItem value="Coordenador">Coordenador</SelectItem>
                  <SelectItem value="Gerente">Gerente</SelectItem>
                  <SelectItem value="Diretor">Diretor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipoUsuario">Tipo de Usuário</Label>
              <Select 
                value={formData.tipoUsuario} 
                onValueChange={(value) => setFormData({ ...formData, tipoUsuario: value })}
                required
              >
                <SelectTrigger id="tipoUsuario">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Comum">Comum</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
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
              Tem certeza que deseja deletar o usuário "{usuarioParaDeletar?.nome}"? Esta ação não pode ser desfeita.
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
