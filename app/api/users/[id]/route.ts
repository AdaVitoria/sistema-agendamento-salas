import { NextRequest, NextResponse } from "next/server";

import { getSession, createUsuarioSession } from "@/lib/session";
import { getUserById, updateUser, deleteUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ... (código do GET continua igual)
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    // Corrigido: tipoUsuario minúsculo ou maiúsculo dependendo do seu banco,
    // mas mantendo sua lógica atual:
    if (session.user.tipoUsuario !== "admin" && session.user.id !== userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[v0] Get user error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (session.user.tipoUsuario !== "admin" && session.user.id !== userId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();

    // 1. Atualiza no Banco de Dados
    const updatedUser = await updateUser(userId, body);

    // 2. LÓGICA NOVA: Atualizar a sessão se for o próprio usuário
    // Se um Admin estiver editando outro usuário, NÃO atualizamos a sessão do Admin
    // Se o usuário estiver editando a si mesmo, atualizamos o cookie dele
    if (session.user.id === userId) {
      // Convertemos para 'any' ou o tipo correto pois o updateUser retorna um objeto
      // compatível com o que o createUsuarioSession espera
      await createUsuarioSession(updatedUser as any);
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ... (código do DELETE continua igual)
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (session.user.tipoUsuario !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado: apenas administradores" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    await deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Delete user error:", error);
    return NextResponse.json(
      { error: "Erro ao deletar usuário" },
      { status: 500 }
    );
  }
}
