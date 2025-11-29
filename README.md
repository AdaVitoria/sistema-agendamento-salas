# 📅 Sistema de Agendamento de Salas Corporativo

Sistema completo de gestão e agendamento de salas de reunião com controle de acesso baseado em cargos e aprovações hierárquicas usando Next.js 15, TypeScript, Prisma ORM e PostgreSQL.

## ✨ Funcionalidades

### 🔑 Autenticação e Controle de Acesso
- Login e registro de usuários
- Sessões persistentes com JWT
- Senhas criptografadas com bcrypt
- Controle de acesso baseado em cargos (Diretor, Gerente, Funcionário)
- Controle de acesso baseado em tipo de usuário (Admin, Comum)

### 📅 Agendamento de Salas
- Visualização em tabela de todas as reuniões agendadas
- Filtros por status (Ativo, Pendente, Recusado)
- Criação de agendamentos com validação de regras de negócio
- Adição de participantes às reuniões
- Cancelamento de agendamentos

### 🔐 Níveis de Acesso por Cargo
**Funcionário (Nível 1)**
- Acesso a salas de nível 1 e 2
- Pode agendar com até 3 dias de antecedência
- Agendamentos de até 2 horas
- Requer aprovação do Gerente

**Gerente (Nível 2)**
- Acesso a salas de nível 1, 2 e 3
- Pode agendar com até 7 dias de antecedência
- Agendamentos de até 4 horas
- Requer aprovação do Diretor para salas nível 3
- Pode aprovar/recusar solicitações de Funcionários

**Diretor (Nível 3)**
- Acesso a todas as salas (nível 1, 2, 3 e 4)
- Pode agendar com até 30 dias de antecedência
- Sem limite de duração
- Agendamentos aprovados automaticamente
- Pode aprovar/recusar todas as solicitações

### ✅ Sistema de Aprovações
- Painel dedicado para Gerentes e Diretores
- Visualização de solicitações pendentes
- Aprovar ou recusar com motivo
- Notificações visuais de pendências

### 👨‍💼 Painel Administrativo
- CRUD completo de salas (nome, capacidade, recursos, nível)
- CRUD completo de usuários (nome, email, cargo, tipo)
- Controle total do sistema (apenas para Admin)

### 🎨 Interface Moderna
- Design profissional com tema escuro
- Componentes do shadcn/ui
- Tabelas interativas com paginação
- Badges coloridos para status
- Feedback visual de ações
- Layout responsivo

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Autenticação**: JWT + bcrypt
- **UI**: Tailwind CSS + shadcn/ui
- **Ícones**: Lucide React
- **Deploy**: Vercel

## 🚀 Como Rodar

Veja o guia completo em **[SETUP.md](./SETUP.md)**

**Resumo rápido:**
\`\`\`bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
echo 'DATABASE_URL="postgresql://..."' > .env
echo 'JWT_SECRET="sua-chave"' >> .env

# 3. Criar tabelas
npx prisma db push

# 4. Popular banco (opcional)
psql $DATABASE_URL -f scripts/002_seed_salas_usuarios.sql

# 5. Rodar projeto
npm run dev
\`\`\`

## 📸 Funcionalidades por Perfil

### 👨‍💼 Admin
- Acesso ao painel administrativo completo
- Gerenciar todas as salas (criar, editar, deletar)
- Gerenciar todos os usuários (criar, editar, deletar)
- Visualizar todos os agendamentos

### 🏢 Diretor
- Agendar qualquer sala sem aprovação
- Agendar com até 30 dias de antecedência
- Sem limite de duração
- Aprovar/recusar solicitações de Gerentes e Funcionários
- Acesso ao painel de aprovações

### 📊 Gerente
- Agendar salas nível 1, 2 e 3
- Agendar com até 7 dias de antecedência
- Máximo 4 horas por agendamento
- Aprovar/recusar solicitações de Funcionários
- Acesso ao painel de aprovações

### 👤 Funcionário
- Agendar salas nível 1 e 2
- Agendar com até 3 dias de antecedência
- Máximo 2 horas por agendamento
- Agendamentos requerem aprovação do Gerente

## 🔒 Regras de Negócio

### Acesso a Salas por Cargo
| Cargo | Salas Permitidas | Dias de Antecedência | Duração Máxima | Aprovação |
|-------|------------------|----------------------|----------------|-----------|
| Funcionário | Nível 1 e 2 | 3 dias | 2 horas | Gerente |
| Gerente | Nível 1, 2 e 3 | 7 dias | 4 horas | Diretor (sala nível 3) |
| Diretor | Todas (1-4) | 30 dias | Ilimitada | Automática |

### Validações Automáticas
- Verificação de conflitos de horário
- Validação de nível de acesso à sala
- Validação de limite de antecedência
- Validação de duração máxima
- Verificação de disponibilidade

## 📁 Estrutura de Pastas

\`\`\`
├── app/
│   ├── api/
│   │   ├── auth/              # Autenticação (login, registro)
│   │   ├── usuarios/          # CRUD de usuários
│   │   ├── salas/             # CRUD de salas
│   │   └── agendamentos/      # CRUD de agendamentos
│   ├── dashboard/             # Painel principal (tabela de reuniões)
│   ├── aprovacoes/            # Painel de aprovações
│   ├── admin/                 # Painel administrativo
│   ├── login/                 # Página de login
│   └── register/              # Página de registro
├── components/
│   ├── tabela-agendamentos.tsx    # Tabela de reuniões
│   ├── agendamento-dialog.tsx     # Modal de agendamento
│   ├── painel-aprovacoes.tsx      # Painel de aprovações
│   └── admin/                     # Componentes admin
├── lib/
│   ├── db.ts                  # Prisma Client
│   ├── auth.ts                # Autenticação
│   ├── types.ts               # Tipos e regras de negócio
│   └── session.ts             # Sessões JWT
├── prisma/
│   └── schema.prisma          # Schema do banco
└── middleware.ts              # Proteção de rotas
\`\`\`

## 🎯 Casos de Uso

### Funcionário quer agendar uma sala
1. Fazer login
2. Acessar Dashboard
3. Clicar em "Nova Reunião"
4. Selecionar sala disponível (nível 1 ou 2)
5. Escolher data (até 3 dias) e horário (máx 2h)
6. Adicionar participantes
7. Aguardar aprovação do Gerente

### Gerente aprovando solicitações
1. Fazer login
2. Acessar "Aprovações" (badge mostra pendências)
3. Visualizar detalhes da solicitação
4. Aprovar ou Recusar com motivo

### Admin gerenciando o sistema
1. Fazer login
2. Acessar "Admin"
3. Gerenciar salas (adicionar nova sala de reunião)
4. Gerenciar usuários (criar novo funcionário)

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Tokens JWT com expiração (24h)
- ✅ Middleware para proteção de rotas
- ✅ Validação de permissões no backend
- ✅ SQL injection prevenido (Prisma)
- ✅ Variáveis de ambiente para secrets
- ✅ Validação de regras de negócio no servidor

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📄 Licença

MIT License - sinta-se livre para usar em seus projetos!

---

**Credenciais de Teste (após executar seed):**
- Diretor: `diretor@empresa.com` / `senha123`
- Gerente: `gerente@empresa.com` / `senha123`
- Funcionário: `funcionario@empresa.com` / `senha123`
- Admin: `admin@empresa.com` / `senha123`
