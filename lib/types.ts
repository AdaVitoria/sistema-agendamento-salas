export type TipoUsuario = 'Admin' | 'Comum'
export type Cargo = 'Diretor' | 'Gerente' | 'Coordenador' | 'Funcionario'
export type TipoSala = 'reuniao' | 'trabalho' | 'treinamento' | 'videoconferencia'
export type NivelAcesso = 'Funcionario' | 'Coordenador' | 'Gerente' | 'Diretor'
export type StatusAgendamento = 'pendente' | 'ativo' | 'cancelado'

export interface Usuario {
  id: number
  email: string
  nome: string
  cargo: Cargo
  tipoUsuario: TipoUsuario
  createdAt: Date
  updatedAt: Date
}

export interface Sala {
  id: number
  nome: string
  capacidade: number
  tipoSala: TipoSala
  nivelAcesso: NivelAcesso
  criadorId: number
}

export interface Agendamento {
  id: number
  codigoAgendamento: string
  nome: string
  data: Date
  horaInicio: string
  horaFim: string
  status: StatusAgendamento
  criadorId: number
  salaId: number
  criador?: Usuario
  sala?: Sala
  participantes?: Usuario[]
}

// Lógica de permissões
export const cargoHierarchy: Record<Cargo, number> = {
  Funcionario: 1,
  Coordenador: 2,
  Gerente: 3,
  Diretor: 4,
}

export const nivelAcessoToCargoMap: Record<NivelAcesso, Cargo> = {
  Funcionario: 'Funcionario',
  Coordenador: 'Coordenador',
  Gerente: 'Gerente',
  Diretor: 'Diretor',
}

// Verifica se o usuário tem acesso a uma sala
export function temAcessoSala(cargoUsuario: Cargo, nivelAcessoSala: NivelAcesso): boolean {
  return cargoHierarchy[cargoUsuario] >= cargoHierarchy[nivelAcessoToCargoMap[nivelAcessoSala]]
}

// Retorna o limite de dias de antecedência para agendamento
export function getLimiteDiasAgendamento(cargo: Cargo): number | null {
  switch (cargo) {
    case 'Funcionario':
      return 7
    case 'Coordenador':
      return 30
    case 'Gerente':
    case 'Diretor':
      return null // Sem limite
  }
}

// Retorna o limite de horas de duração
export function getLimiteDuracaoHoras(cargo: Cargo): number | null {
  switch (cargo) {
    case 'Funcionario':
      return 1
    case 'Coordenador':
      return 2
    case 'Gerente':
    case 'Diretor':
      return null // Sem limite
  }
}

// Verifica se o agendamento precisa de aprovação
export function precisaAprovacao(cargo: Cargo): boolean {
  return cargo !== 'Gerente' && cargo !== 'Diretor'
}
