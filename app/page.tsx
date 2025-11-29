import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Users, CalendarDays, Building2, Crown } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">BookRoom</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-balance">
              Sistema de Agendamento de Salas Corporativo
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Plataforma completa para gestão e agendamento de salas de reunião com controle de acesso baseado em cargos
              e aprovações hierárquicas
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Começar Agora</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Fazer Login</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <CalendarDays className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Agendamento Inteligente</h3>
              <p className="text-muted-foreground text-pretty">
                Agende salas com validação automática de conflitos, regras de acesso e limites por cargo
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aprovações Hierárquicas</h3>
              <p className="text-muted-foreground text-pretty">
                Sistema de aprovação baseado em cargo: Funcionário → Gerente → Diretor
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gestão de Salas</h3>
              <p className="text-muted-foreground text-pretty">
                Painel administrativo para gerenciar salas, usuários e visualizar todas as reservas
              </p>
            </div>
          </div>

          <div className="mt-16 p-8 rounded-lg border border-border bg-card/50">
            <h2 className="text-2xl font-bold mb-6">Controle de Acesso por Cargo</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Funcionário
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Salas nível 1 e 2</li>
                  <li>• Até 3 dias de antecedência</li>
                  <li>• Máximo 2 horas</li>
                  <li>• Requer aprovação</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Gerente
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Salas nível 1, 2 e 3</li>
                  <li>• Até 7 dias de antecedência</li>
                  <li>• Máximo 4 horas</li>
                  <li>• Aprovação condicional</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Diretor
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Todas as salas</li>
                  <li>• Até 30 dias de antecedência</li>
                  <li>• Sem limite de duração</li>
                  <li>• Aprovação automática</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
