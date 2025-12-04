import { NextRequest, NextResponse } from "next/server";
import { createUsuario, getUsuarioByEmail, getAllUsers } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.tipoUsuario !== "Admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const usuarios = await getAllUsers();
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.tipoUsuario !== "Admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, nome, cargo, tipoUsuario } = body;

    if (!email || !password || !nome || !cargo || !tipoUsuario) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const existingUser = await getUsuarioByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      );
    }

    const newUser = await createUsuario(
      email,
      password,
      nome,
      cargo,
      tipoUsuario
    );
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(" Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
