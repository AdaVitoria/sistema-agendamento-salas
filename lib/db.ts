import { PrismaClient } from "@prisma/client";

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

// --- Tipos atualizados para o schema em Português ---

export type User = {
  id: number;
  email: string;
  passwordHash: string;
  nome: string; // Mudamos de 'name' para 'nome'
  cargo: string; // Mudamos de 'role' para 'cargo'
  tipoUsuario: string; // Adicionamos este campo
  createdAt: Date;
  updatedAt: Date;
};

// O Omit remove o 'passwordHash' para não trafegar a senha no front-end
export type UserWithoutPassword = Omit<User, "passwordHash">;
