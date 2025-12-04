"use client";

import { useState } from "react";
import { UserWithoutPassword } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { UserDialog } from "./user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";

interface UserTableProps {
  users: UserWithoutPassword[];
  onUpdate: () => void;
}

export function UserTable({ users, onUpdate }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(
    null
  );
  const [deletingUser, setDeletingUser] = useState<UserWithoutPassword | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        <Button onClick={() => setIsCreating(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.tipoUsuario}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.tipoUsuario === "admin" ? "default" : "secondary"
                    }
                  >
                    {user.tipoUsuario === "admin" ? "Administrador" : "Comum"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingUser(user)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSuccess={onUpdate}
        mode="create"
      />

      <UserDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSuccess={onUpdate}
        mode="edit"
        user={editingUser || undefined}
      />

      <DeleteUserDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        onSuccess={onUpdate}
        user={deletingUser || undefined}
      />
    </div>
  );
}
