import bcrypt from 'bcryptjs'
import { prisma } from './db'
import type { User, Usuario } from '@prisma/client'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email }
  })
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'common' = 'common'
) {
  const passwordHash = await hashPassword(password)
  
  return prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

export async function updateUser(
  id: number,
  data: { name?: string; email?: string; password?: string }
) {
  const updateData: any = {}
  
  if (data.name !== undefined) {
    updateData.name = data.name
  }
  
  if (data.email !== undefined) {
    updateData.email = data.email
  }
  
  if (data.password !== undefined) {
    updateData.passwordHash = await hashPassword(data.password)
  }
  
  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

export async function deleteUser(id: number): Promise<void> {
  await prisma.user.delete({
    where: { id }
  })
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function getUsuarioByEmail(email: string): Promise<Usuario | null> {
  return prisma.usuario.findUnique({
    where: { email }
  })
}

export async function getUsuarioById(id: number): Promise<Usuario | null> {
  return prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nome: true,
      cargo: true,
      tipoUsuario: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

export async function createUsuario(
  email: string,
  password: string,
  nome: string,
  cargo: 'Diretor' | 'Gerente' | 'Coordenador' | 'Funcionario' = 'Funcionario',
  tipoUsuario: 'Admin' | 'Comum' = 'Comum'
) {
  const passwordHash = await hashPassword(password)
  
  return prisma.usuario.create({
    data: {
      email,
      passwordHash,
      nome,
      cargo,
      tipoUsuario
    },
    select: {
      id: true,
      email: true,
      nome: true,
      cargo: true,
      tipoUsuario: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

export async function updateUsuario(
  id: number,
  data: { nome?: string; email?: string; password?: string; cargo?: string; tipoUsuario?: string }
) {
  const updateData: any = {}
  
  if (data.nome !== undefined) {
    updateData.nome = data.nome
  }
  
  if (data.email !== undefined) {
    updateData.email = data.email
  }
  
  if (data.password !== undefined) {
    updateData.passwordHash = await hashPassword(data.password)
  }

  if (data.cargo !== undefined) {
    updateData.cargo = data.cargo
  }

  if (data.tipoUsuario !== undefined) {
    updateData.tipoUsuario = data.tipoUsuario
  }
  
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
      updatedAt: true
    }
  })
}

export async function deleteUsuario(id: number): Promise<void> {
  await prisma.usuario.delete({
    where: { id }
  })
}

export async function getAllUsuarios() {
  return prisma.usuario.findMany({
    select: {
      id: true,
      email: true,
      nome: true,
      cargo: true,
      tipoUsuario: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}
