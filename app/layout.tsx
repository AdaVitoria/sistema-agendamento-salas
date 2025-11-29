import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BookRoom - Sistema de Agendamento de Salas",
  description:
    "Plataforma completa para gestão e agendamento de salas de reunião com controle de acesso baseado em cargos e aprovações hierárquicas"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.className} antialiased`}>{children}</body>
    </html>
  )
}
