'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'

interface Usuario {
  id: number
  nome: string
  email: string
  cargo: string
  tipoUsuario: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

        if (user.tipoUsuario !== 'Admin') {
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
    <div className="min-h-screen bg-background">
      <Header user={usuario} />
      <main>{children}</main>
    </div>
  )
}
