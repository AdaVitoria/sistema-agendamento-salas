import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAllUsers, createUsuario } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // 1. Correção: Aceitar "Admin" ou "admin" para evitar bloqueio acidental
    const isUserAdmin =
      session.user.tipoUsuario === "Admin" ||
      session.user.tipoUsuario === "admin";

    // Se quiser que APENAS admins vejam a lista, mantenha isso.
    // Se todos puderem ver (ex: para selecionar num campo), remova ou ajuste.
    /*
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }
    */

    const usuarios = await getAllUsers();

    // 2. Correção: Retornar o array direto.
    // O front-end faz 'Array.isArray(data)', então isso garante que funcione.
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("[v0] Get users error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificação de permissão robusta
    const isUserAdmin =
      session.user.tipoUsuario === "Admin" ||
      session.user.tipoUsuario === "admin";

    if (!isUserAdmin) {
      return NextResponse.json(
        { error: "Acesso negado: apenas administradores" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // 3. CRUCIAL: Ler os campos em Português que o formulário envia
    // Antes você lia 'name' e 'role', que chegavam undefined
    const { email, password, nome, cargo, tipoUsuario } = body;

    // Validação
    if (!email || !password || !nome) {
      return NextResponse.json(
        { error: "Email, senha e nome são obrigatórios" },
        { status: 400 }
      );
    }

    // Passar os argumentos corretos para a função createUsuario
    const user = await createUsuario(
      email,
      password,
      nome,
      cargo, // Ex: "Gerente", "Funcionario"
      tipoUsuario // Ex: "Admin", "Comum"
    );

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("[v0] Create user error:", error);

    // Tratamento específico para erro de email duplicado do Prisma
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado no sistema." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
