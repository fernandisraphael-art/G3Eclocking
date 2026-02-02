
import { DemandType, ProjectPhase, UserRole, User, Project } from './types';

export const DEMAND_TYPES = Object.values(DemandType);
export const PROJECT_PHASES = Object.values(ProjectPhase);

export const ACTIVITIES_SEED = [
  'RGP/RDG', 'Periódico', 'Relatório de Despesa', 'Deslocamento', 
  'Evento/Congresso/WS', 'Treinamento', 'TI', 'Elaboração', 
  'Revisão', 'Validação', 'Reunião', 'Falha de manutenção', 
  'Acompanhamento de performance', 'Análise de log', 'Atividades de rescaldo', 
  'Elaboração Planilha Teste', 'Elaboração Roteiro CO', 'Comissionamento'
];

export const COLLABORATORS_SEED: string[] = [
  'Admin', // Novo usuário administrativo
  'Abner Orra', 'Adalberto Kumagala', 'Alan Wliam', 'Alexandre Meneghel', 
  'Antônio Leal', 'Bárbara Doinoldo', 'Guilherme Rodrigues', 'Hygor Teodoro', 
  'Iago Marques', 'Jesus Prieto', 'João Paulo Rocha', 'Jonatas Cedro', 
  'Lucas Abreu', 'Marcio Moreira', 'Marcos Rehn', 'Paulo Henrique', 
  'Pedro Melo', 'Pedro Pinto', 'Pedro Santana', 'Rodrigo Gonçalves', 
  'Tiago Gomes', 'Tony Dornelas', 'Vinicius Rodrigues', 'Marcos Taninho'
];

export const PROJECTS_SEED: string[] = [
  'CBTC – Margem Direita', 'Pátio de cruzamento de Aparecida', 
  'Pátio de Manobras de Campo Grande', 'Pátio Regulador Jurubatuba', 
  'Pátio Regulador Prainha', 'Remotas 2025/2026', 'Subestação de Cremalheira', 
  '272 – CBTC Serra do MAR', '272 – Adequações de pátios (FOS – Santa Rosa)', 
  'Automação Cremalheira', 'Cancelas Automáticas Ar-4', 'CTC–Vale do Paraíba', 
  'Expansão Terminal Casa de Pedra', 'Intercâmbio EFVM', 'Metrô BH', 
  '272 – Comunicação UHF', 'Pátio Integrado de Santos Fase Ampliada', 
  'Viaduto Mário Campos 1', 'Drenagem de Santos', 'Expansão Brismarr (TECAR)', 
  'Requalificação Urbana da via ferroviária (Ciclovia)', 'Trecho 1 (Campo Limpo e Jundiaí – Segregações)', 
  'PROJETONOVO'
];

// Map seed data to types
export const INITIAL_USERS: User[] = COLLABORATORS_SEED.map((name, index) => ({
  id: name === 'Admin' ? 'admin-id' : `u-${index}`,
  name,
  role: name === 'Admin' ? UserRole.DIRECTOR :
        name === 'Alexandre Meneghel' ? UserRole.COORDINATOR : 
        name === 'Guilherme Rodrigues' ? UserRole.DIRECTOR : UserRole.COLLABORATOR,
  active: true
}));

export const INITIAL_PROJECTS: Project[] = PROJECTS_SEED.map((name, index) => ({
  id: `p-${index}`,
  name,
  status: 'ativo'
}));
