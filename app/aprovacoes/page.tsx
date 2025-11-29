'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PainelAprovacoes } from '@/components/painel-aprovacoes'

interface Usuario {
  id: number
  nome: string
  email: string
  cargo: string
  tipoUsuario: string
}

export default function AprovacoesPage() {
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

        // Verificar se tem permissão
        if (user.cargo !== 'Gerente' && user.cargo !== 'Diretor') {
          router.push('/dashboard')
          return
        }

        setUsuario(user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
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
      <div>
        <h1 className="text-3xl font-bold text-balance">Solicitações de Aprovação</h1>
        <p className="text-muted-foreground mt-2">
          Aprove ou recuse agendamentos que necessitam de autorização
        </p>
      </div>

      <PainelAprovacoes />
    </div>
  )
}
