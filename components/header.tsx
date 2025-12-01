"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Shield, LogOut, Menu, User } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface Usuario {
  id: number
  nome: string
  email: string
  cargo: string
  tipoUsuario: string
}

interface HeaderProps {
  user: Usuario
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const podeAprovar = user.cargo === "Gerente" || user.cargo === "Diretor"
  const isAdmin = user.tipoUsuario === "Admin"

  const navItems = [
    { href: "/dashboard", label: "Calendário", icon: Calendar, show: true },
    { href: "/aprovacoes", label: "Aprovações", icon: Clock, show: podeAprovar },
    { href: "/admin", label: "Administração", icon: Shield, show: isAdmin },
    { href: "/profile", label: "Perfil", icon: User, show: true },
  ]

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight hidden sm:block">RoomBook</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.href} href={item.href}>
                    <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2 font-medium">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
          </nav>

          {/* User Info & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-none">{user.nome}</p>
              <div className="flex items-center gap-2 justify-end mt-1">
                <p className="text-xs text-muted-foreground">{user.cargo}</p>
                {user.tipoUsuario === "Admin" && (
                  <Badge variant="outline" className="text-xs h-5 px-1.5">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Sair</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col h-full">
                <div className="space-y-1 flex-1">
                  <div className="py-4 border-b mb-4">
                    <p className="font-semibold">{user.nome}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{user.cargo}</Badge>
                      {user.tipoUsuario === "Admin" && <Badge variant="default">Admin</Badge>}
                    </div>
                  </div>

                  {navItems
                    .filter((item) => item.show)
                    .map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href

                      return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                          <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start gap-2">
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Button>
                        </Link>
                      )
                    })}
                </div>

                <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
