import { AuthForm } from '@/components/auth-form'
import { Shield } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-center">Sistema de Gestão</h1>
          <p className="text-muted-foreground text-center">
            Gerenciamento de usuários com controle de acesso
          </p>
        </div>

        <AuthForm mode="login" />

        <div className="text-center text-sm text-muted-foreground">
          <p className="font-medium">Credenciais de teste:</p>
          <p>Admin: admin@example.com / admin123</p>
          <p>Usuário: user@example.com / user123</p>
        </div>
      </div>
    </div>
  )
}
