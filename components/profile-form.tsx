"use client";

import { useState, useEffect } from "react";
import { UserWithoutPassword } from "@/lib/db"; // Certifique-se que este tipo está atualizado no db.ts
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation"; // Adicionado para o refresh

interface ProfileFormProps {
  user: UserWithoutPassword;
  onUpdate: () => void;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const router = useRouter(); // Hook para atualizar a página visualmente

  // O erro de "controlled input" acontecia aqui porque user.name era undefined.
  // Agora usamos user.nome e o operador ?? "" para garantir que nunca seja undefined.
  const [formData, setFormData] = useState({
    nome: user.nome ?? "",
    email: user.email ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Atualiza o form se o user mudar (ex: após um save)
  useEffect(() => {
    setFormData({
      nome: user.nome ?? "",
      email: user.email ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validação de senha
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError("As senhas não coincidem");
        setLoading(false);
        return;
      }

      if (formData.newPassword.length < 6) {
        setError("A nova senha deve ter pelo menos 6 caracteres");
        setLoading(false);
        return;
      }
    }

    try {
      // Monta o objeto para enviar para a API
      const body: any = {
        nome: formData.nome, // Enviando como 'nome'
        email: formData.email,
      };

      if (formData.newPassword) {
        body.password = formData.newPassword;
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ocorreu um erro");
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Limpa os campos de senha
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      onUpdate(); // Atualiza o estado local do pai
      router.refresh(); // Força o Next.js a atualizar os dados do servidor na tela
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize suas informações pessoais e senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50 text-green-900">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Perfil atualizado com sucesso!
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Alterar Senha</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Deixe em branco para não alterar"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme a nova senha"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>Detalhes sobre sua conta no sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium text-muted-foreground">
              ID do Usuário
            </span>
            <span className="text-sm">{user.id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium text-muted-foreground">
              Cargo
            </span>
            {/* Corrigido para user.cargo */}
            <span className="text-sm capitalize">{user.cargo}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium text-muted-foreground">
              Tipo de Permissão
            </span>
            {/* Corrigido para user.tipoUsuario */}
            <span className="text-sm capitalize">{user.tipoUsuario}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium text-muted-foreground">
              Membro desde
            </span>
            <span className="text-sm">
              {/* Corrigido para user.createdAt (camelCase) */}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-muted-foreground">
              Última atualização
            </span>
            <span className="text-sm">
              {/* Corrigido para user.updatedAt (camelCase) */}
              {user.updatedAt
                ? new Date(user.updatedAt).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
