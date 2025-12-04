import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Configuração do Prisma Client (Singleton)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// --- Funções de Autenticação e Usuário ---

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Busca usuário por email (usando a tabela correta 'usuario')
export async function getUserByEmail(email: string) {
  return prisma.usuario.findUnique({
    where: { email },
  });
}

// Busca usuário por ID
export async function getUserById(id: number) {
  return prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nome: true, // Note que o banco usa 'nome', não 'name'
      cargo: true,
      tipoUsuario: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// Criação de usuário
export async function createUser(
  email: string,
  password: string,
  nome: string,
  cargo: "Diretor" | "Gerente" | "Coordenador" | "Funcionario" = "Funcionario",
  tipoUsuario: "Admin" | "Comum" = "Comum"
) {
  const passwordHash = await hashPassword(password);

  return prisma.usuario.create({
    data: {
      email,
      passwordHash,
      nome,
      cargo,
      tipoUsuario,
    },
    select: {
      id: true,
      email: true,
      nome: true,
      cargo: true,
      tipoUsuario: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// Atualização de usuário
// A função aceita 'any' no data para ser flexível com o que vem do frontend,
// mas mapeia corretamente para os campos do banco em português.
export async function updateUser(
  id: number,
  data: {
    nome?: string;
    name?: string;
    email?: string;
    password?: string;
    cargo?: string;
    tipoUsuario?: string;
  }
) {
  const updateData: any = {};

  // Mapeia 'name' (se vier do frontend em inglês) ou 'nome' para o campo 'nome' do banco
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.name !== undefined) updateData.nome = data.name;

  if (data.email !== undefined) updateData.email = data.email;

  if (data.password !== undefined) {
    updateData.passwordHash = await hashPassword(data.password);
  }

  if (data.cargo !== undefined) updateData.cargo = data.cargo;
  if (data.tipoUsuario !== undefined) updateData.tipoUsuario = data.tipoUsuario;

  return prisma.usuario.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      nome: true,
      cargo: true,
      tipoUsuario: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// Deleção de usuário
export async function deleteUser(id: number): Promise<void> {
  await prisma.usuario.delete({
    where: { id },
  });
}

// Listar todos os usuários
export async function getAllUsers() {
  return prisma.usuario.findMany({
    select: {
      id: true,
      email: true,
      nome: true,
      cargo: true,
      tipoUsuario: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
