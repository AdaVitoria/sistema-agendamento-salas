'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GerenciarSalas } from '@/components/admin/gerenciar-salas'
import { GerenciarUsuarios } from '@/components/admin/gerenciar-usuarios'
import { Settings, Users, Building } from 'lucide-react'

interface Usuario {
  id: number
  nome: string
  email: string
  cargo: string
  tipoUsuario: string
}

export default function AdminPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarUsuario()
  }, [])

  async function carregarUsuario() {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        const user = data.user

        // Verificar se é admin
        if (user.tipoUsuario !== 'Admin') {
          router.push('/dashboard')
          return
        }

        setUsuario(user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error(' Erro ao carregar usuário:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  if (!usuario) {
    return null
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold text-balance">Administração</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie salas e usuários do sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="salas" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="salas" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Salas
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="salas" className="mt-6">
          <GerenciarSalas />
        </TabsContent>

        <TabsContent value="usuarios" className="mt-6">
          <GerenciarUsuarios usuarioLogadoId={usuario.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
