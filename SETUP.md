# Setup Local - Sistema de Agendamento de Salas

Este projeto usa **Prisma ORM** para gerenciar o banco de dados PostgreSQL (Neon) de um sistema completo de agendamento de salas corporativo.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Uma conta no [Neon](https://neon.tech) (ou outro PostgreSQL)

## 🚀 Passos para Rodar Localmente


### 1. Configure as Variáveis de Ambiente

Crie um arquivo **`.env`** na raiz do projeto:

\`\`\`env
# URL do banco de dados Neon (PostgreSQL)
DATABASE_URL="postgresql://usuario:senha@host/database?sslmode=require"

# Secret para JWT (use uma string aleatória e segura)
JWT_SECRET="minha-chave-super-secreta-123456"
\`\`\`

**Como obter a DATABASE_URL do Neon:**
1. Acesse [console.neon.tech](https://console.neon.tech)
2. Selecione seu projeto
3. Vá em "Connection Details"
4. Copie a "Connection String"


### 2. Instale as Dependências

\`\`\`bash
npm install
\`\`\`

Isso irá instalar todas as dependências e gerar o Prisma Client automaticamente.

### 3. Crie as Tabelas no Banco de Dados

**Opção A: Usando Prisma Push (Mais rápido)**
\`\`\`bash
# Sincroniza o schema direto com o banco
npx prisma db push
\`\`\`

**Opção B: Usando Prisma Migrate (Recomendado para produção)**
\`\`\`bash
# Cria as tabelas automaticamente
npx prisma migrate dev --name init
\`\`\`

### 5. Popule o Banco com Dados Iniciais

Execute o script SQL para criar usuários e salas de teste:

\`\`\`bash
# No Windows (PowerShell/CMD)
type scripts\002_seed_salas_usuarios.sql | psql %DATABASE_URL%

# No Mac/Linux
psql $DATABASE_URL -f scripts/002_seed_salas_usuarios.sql
\`\`\`

**Ou use o Neon SQL Editor:**
1. Abra o [Neon Console](https://console.neon.tech)
2. Vá em "SQL Editor"
3. Copie e cole o conteúdo de `scripts/002_seed_salas_usuarios.sql`
4. Execute

Este script cria:
- 4 usuários de teste (Admin, Diretor, Gerente, Funcionário)
- 6 salas de reunião de diferentes níveis
- Alguns agendamentos de exemplo

### 6. Execute o Servidor de Desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

✅ Acesse: **[http://localhost:3000](http://localhost:3000)**

## 🔑 Credenciais de Teste

Após popular o banco, você pode fazer login com:

| Cargo | Email | Senha | Acesso |
|-------|-------|-------|--------|
| **Admin** | admin@empresa.com | senha123 | Painel administrativo completo |
| **Diretor** | diretor@empresa.com | senha123 | Todas as salas, aprovações |
| **Gerente** | gerente@empresa.com | senha123 | Salas nível 1-3, aprovações |
| **Funcionário** | funcionario@empresa.com | senha123 | Salas nível 1-2 |

## 🎯 O que Testar

### Como Funcionário
1. Login com `funcionario@empresa.com`
2. Ver agendamentos no Dashboard
3. Criar nova reunião (apenas salas nível 1 e 2)
4. Verificar que precisa de aprovação

### Como Gerente
1. Login com `gerente@empresa.com`
2. Criar reunião em sala nível 3
3. Ir em "Aprovações" e aprovar solicitações de funcionários

### Como Diretor
1. Login com `diretor@empresa.com`
2. Criar reunião em qualquer sala (aprovação automática)
3. Aprovar/recusar solicitações de gerentes e funcionários

### Como Admin
1. Login com `admin@empresa.com`
2. Ir em "Admin"
3. Gerenciar salas e usuários

## 🛠️ Comandos Úteis do Prisma

\`\`\`bash
# Gerar Prisma Client (após alterar schema.prisma)
npx prisma generate

# Criar uma nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Abrir Prisma Studio (GUI visual do banco)
npx prisma studio

# Ver status das migrations
npx prisma migrate status

# Formatar schema.prisma
npx prisma format

# Resetar banco (CUIDADO: apaga tudo!)
npx prisma migrate reset
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
sistema-agendamento-salas/
├── prisma/
│   └── schema.prisma              # Schema do banco (Usuario, Sala, Agendamento)
├── app/
│   ├── api/
│   │   ├── auth/                  # Login, registro, sessão
│   │   ├── usuarios/              # CRUD de usuários
│   │   ├── salas/                 # CRUD de salas
│   │   └── agendamentos/          # CRUD de agendamentos
│   ├── dashboard/                 # Tabela de reuniões
│   ├── aprovacoes/                # Painel de aprovações
│   ├── admin/                     # Painel administrativo
│   ├── login/                     # Login
│   └── register/                  # Registro
├── components/
│   ├── tabela-agendamentos.tsx    # Tabela com filtros e paginação
│   ├── agendamento-dialog.tsx     # Modal de agendamento
│   ├── painel-aprovacoes.tsx      # Aprovar/recusar solicitações
│   ├── admin/
│   │   ├── gerenciar-salas.tsx    # CRUD de salas
│   │   └── gerenciar-usuarios.tsx # CRUD de usuários
│   └── header.tsx                 # Navegação principal
├── lib/
│   ├── db.ts                      # Prisma Client singleton
│   ├── auth.ts                    # Autenticação e hash
│   ├── types.ts                   # Tipos e regras de negócio
│   └── session.ts                 # JWT e cookies
├── middleware.ts                  # Proteção de rotas
└── scripts/
    └── 002_seed_salas_usuarios.sql # Seed completo
\`\`\`

## 🐛 Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"
✅ **Solução:** Certifique-se de criar o arquivo `.env` na raiz com a `DATABASE_URL`

### Erro: "PrismaClient is unable to connect to the database"
✅ **Solução:** 
- Verifique se a URL do banco está correta
- Teste a conexão: `npx prisma db pull`
- Certifique-se que o banco Neon está ativo

### Erro: "Table 'Usuario' does not exist"
✅ **Solução:** Execute as migrations:
\`\`\`bash
npx prisma db push
\`\`\`

### Erro: "Prisma Client não foi gerado"
✅ **Solução:**
\`\`\`bash
npx prisma generate
\`\`\`

### Não consigo fazer login
✅ **Solução:** Execute o script SQL para criar os usuários de teste:
\`\`\`bash
psql $DATABASE_URL -f scripts/002_seed_salas_usuarios.sql
\`\`\`

### Não aparecem salas no agendamento
✅ **Solução:** Certifique-se de executar o seed completo que cria as salas


## 📚 Recursos

- [Documentação Prisma](https://www.prisma.io/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Neon PostgreSQL](https://neon.tech/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 💡 Próximos Passos

- [ ] Adicionar notificações por email
- [ ] Implementar calendário visual alternativo
- [ ] Adicionar relatórios de uso de salas
- [ ] Criar dashboard com métricas
- [ ] Adicionar recurso de recorrência (reuniões semanais)
- [ ] Integrar com calendário do Google/Outlook
