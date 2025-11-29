import { AuthForm } from '@/components/auth-form'
import { UserPlus } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary">
            <UserPlus className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-center">Criar Nova Conta</h1>
          <p className="text-muted-foreground text-center">
            Junte-se ao sistema de gestão de usuários
          </p>
        </div>

        <AuthForm mode="register" />
      </div>
    </div>
  )
}
