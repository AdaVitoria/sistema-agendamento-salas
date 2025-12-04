"use client";

import { useState, useEffect } from "react";
import { UserWithoutPassword } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  user?: UserWithoutPassword;
}

export function UserDialog({
  open,
  onOpenChange,
  onSuccess,
  mode,
  user,
}: UserDialogProps) {
  // Estado atualizado para os campos em Português
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    cargo: "Funcionario", // Valor padrão
    tipoUsuario: "Comum", // Valor padrão
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && mode === "edit") {
      setFormData({
        nome: user.nome ?? "",
        email: user.email ?? "",
        password: "",
        cargo: user.cargo ?? "Funcionario",
        tipoUsuario: user.tipoUsuario ?? "Comum",
      });
    } else {
      // Reset para modo criar
      setFormData({
        nome: "",
        email: "",
        password: "",
        cargo: "Funcionario",
        tipoUsuario: "Comum",
      });
    }
    setError("");
  }, [user, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "create" ? "/api/users" : `/api/users/${user?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      // Monta o corpo da requisição com os nomes corretos
      const body: any = {
        nome: formData.nome,
        email: formData.email,
        cargo: formData.cargo,
        tipoUsuario: formData.tipoUsuario,
      };

      // Só envia senha se ela foi digitada
      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ocorreu um erro");
        setLoading(false);
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError("Erro ao conectar com o servidor");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Criar Novo Usuário" : "Editar Usuário"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Preencha os dados do novo usuário."
              : "Atualize as informações do usuário."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
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

            <div className="grid gap-2">
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

            <div className="grid gap-2">
              <Label htmlFor="password">
                Senha {mode === "edit" && "(opcional)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={mode === "create"} // Obrigatório apenas na criação
                placeholder={mode === "edit" ? "Deixe vazio para manter" : ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Select
                  value={formData.cargo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cargo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diretor">Diretor</SelectItem>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                    <SelectItem value="Coordenador">Coordenador</SelectItem>
                    <SelectItem value="Funcionario">Funcionário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tipoUsuario">Permissão</Label>
                <Select
                  value={formData.tipoUsuario}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipoUsuario: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comum">Comum</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : mode === "create" ? "Criar" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
