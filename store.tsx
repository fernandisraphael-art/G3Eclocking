
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, User, Project, TimeLog } from './types';
import { INITIAL_USERS, INITIAL_PROJECTS, ACTIVITIES_SEED } from './constants';

interface AppContextType extends AppState {
  setCurrentUser: (user: User | null) => void;
  login: (user: User) => void;
  allocations: any[];
  addAllocation: (alloc: { project: string; resourceId: string; day: number; hours: number; }) => string;
  updateAllocation: (id: string, updates: Partial<{ project: string; resourceId: string; day: number; hours: number; }>) => void;
  deleteAllocation: (id: string) => void;
  addLog: (log: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt' | 'collaboratorId' | 'collaboratorName'>) => string | null;
  updateLog: (id: string, updates: Partial<TimeLog>) => void;
  deleteLog: (id: string) => void;
  addProject: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('g3eclocking_user');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default test user
    const defaultUser = INITIAL_USERS[0];
    localStorage.setItem('g3eclocking_user', JSON.stringify(defaultUser));
    return defaultUser;
  });

  const [logs, setLogs] = useState<TimeLog[]>(() => {
    const saved = localStorage.getItem('g3eclocking_logs');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default test logs
    const today = new Date().toISOString().split('T')[0];
    const defaultLogs = [
      {
        id: "log-1",
        collaboratorId: INITIAL_USERS[0].id,
        collaboratorName: INITIAL_USERS[0].name,
        date: today,
        projectId: "CBTC – Margem Direita",
        phase: "LS",
        activityType: "revisao",
        hours: 2.00,
        description: "Revisão de código e testes",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "log-2",
        collaboratorId: INITIAL_USERS[0].id,
        collaboratorName: INITIAL_USERS[0].name,
        date: today,
        projectId: "CBTC – Margem Direita",
        phase: "LS",
        activityType: "implementacao",
        hours: 5.00,
        description: "Implementação de novas funcionalidades",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('g3eclocking_logs', JSON.stringify(defaultLogs));
    return defaultLogs;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('g3eclocking_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [allocations, setAllocations] = useState<any[]>(() => {
    const saved = localStorage.getItem('g3eclocking_allocations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('g3eclocking_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('g3eclocking_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('g3eclocking_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('g3eclocking_allocations', JSON.stringify(allocations));
  }, [allocations]);

  const addLog = (data: any) => {
    if (!currentUser) return null;

    // Daily total check
    const dayLogs = logs.filter(l => l.collaboratorId === currentUser.id && l.date === data.date);
    const dailyTotal = dayLogs.reduce((acc, curr) => acc + curr.hours, 0);
    if (dailyTotal + data.hours > 24) {
      return "O total de horas por dia não pode exceder 24h.";
    }

    // Duplicate check
    const duplicate = logs.find(l => 
      l.collaboratorId === currentUser.id && 
      l.date === data.date && 
      l.projectId === data.projectId && 
      l.activityType === data.activityType
    );

    if (duplicate) {
      return "Já existe um apontamento para esta data, projeto e atividade. Verifique se o lançamento é duplicado.";
    }

    const newLog: TimeLog = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      collaboratorId: currentUser.id,
      collaboratorName: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLogs(prev => [newLog, ...prev]);
    return null;
  };

  const updateLog = (id: string, updates: Partial<TimeLog>) => {
    setLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
  };

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const addProject = (name: string) => {
    const newProject: Project = {
      id: `p-${Math.random().toString(36).substr(2, 5)}`,
      name,
      status: 'ativo'
    };
    setProjects(prev => [...prev, newProject]);
  };

  const addLogForUser = (data: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Similar checks to addLog but allows specifying collaboratorId
    const { collaboratorId, date, projectId, activityType, hours } = data as any;
    if (!collaboratorId) return 'collaboratorId required';

    const dayLogs = logs.filter(l => l.collaboratorId === collaboratorId && l.date === date);
    const dailyTotal = dayLogs.reduce((acc, curr) => acc + curr.hours, 0);
    if (dailyTotal + (hours || 0) > 24) {
      return "O total de horas por dia não pode exceder 24h.";
    }

    const duplicate = logs.find(l => l.collaboratorId === collaboratorId && l.date === date && l.projectId === projectId && l.activityType === activityType);
    if (duplicate) return 'duplicated';

    const newLog: TimeLog = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as TimeLog;

    setLogs(prev => [newLog, ...prev]);
    return null;
  };

  const syncAllocationsToLogs = () => {
    // allocations: { id, project, resourceId, day, hours, spanDays? }
    const base = new Date();
    let created = 0;
    allocations.forEach(a => {
      const date = new Date(base);
      date.setDate(base.getDate() + (a.day || 0));
      const iso = date.toISOString().split('T')[0];
      const exists = logs.find(l => l.collaboratorId === a.resourceId && l.date === iso && l.projectId === a.project && l.activityType === 'alocacao');
      if (!exists) {
        const res = addLogForUser({
          collaboratorId: a.resourceId,
          collaboratorName: INITIAL_USERS.find(u => u.id === a.resourceId)?.name || 'Usuário',
          date: iso,
          demandType: (Object as any).values === undefined ? undefined as any : undefined as any,
          projectId: a.project,
          projectName: a.project,
          phase: 'NA' as any,
          activityType: 'alocacao',
          hours: a.hours || 0,
        } as any);
        if (res === null) created++;
      }
    });
    return created;
  };

  const addAllocation = (alloc: { project: string; resourceId: string; day: number; hours: number; }) => {
    const newAlloc = { id: `a-${Math.random().toString(36).substr(2, 6)}`, ...alloc };
    setAllocations(prev => [newAlloc, ...prev]);
    return newAlloc.id;
  };

  const updateAllocation = (id: string, updates: Partial<{ project: string; resourceId: string; day: number; hours: number; }>) => {
    setAllocations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAllocation = (id: string) => {
    setAllocations(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AppContext.Provider value={{
      currentUser, users: INITIAL_USERS, projects, activities: ACTIVITIES_SEED, logs,
      setCurrentUser, login: setCurrentUser, addLog, updateLog, deleteLog, addProject,
      allocations, addAllocation, updateAllocation, deleteAllocation,
      addLogForUser, syncAllocationsToLogs
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
