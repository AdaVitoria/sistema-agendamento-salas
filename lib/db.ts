import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database query types
export type User = {
  id: number
  email: string
  passwordHash: string
  name: string
  role: 'admin' | 'common'
  createdAt: Date
  updatedAt: Date
}

export type UserWithoutPassword = Omit<User, 'passwordHash'>
