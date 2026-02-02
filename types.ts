
export enum UserRole {
  COLLABORATOR = 'Colaborador',
  COORDINATOR = 'Coordenador',
  DIRECTOR = 'Diretoria/Visor'
}

export enum DemandType {
  FEL01 = 'FEL 0 / FEL 1',
  GARANTIA = 'Garantia',
  ROTINA = 'Rotina',
  SUPORTE = 'Suporte de Engenharia',
  PROJETO = 'Projeto'
}

export enum ProjectPhase {
  FEL01 = 'FEL 0 / FEL 1',
  PE = 'PE',
  PC = 'PC',
  POS_OBRA = 'Pós obra',
  CO = 'CO',
  LS = 'LS',
  NA = 'N/A'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  active: boolean;
}

export interface Project {
  id: string;
  name: string;
  code?: string;
  status: 'ativo' | 'encerrado';
}

export interface TimeLog {
  id: string;
  collaboratorId: string;
  collaboratorName: string;
  date: string;
  demandType: DemandType;
  projectId: string; // "NA" if not applicable
  projectName: string;
  phase: ProjectPhase;
  activityType: string;
  hours: number;
  observation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  activities: string[];
  logs: TimeLog[];
}
