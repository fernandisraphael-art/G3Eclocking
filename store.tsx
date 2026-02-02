
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, User, Project, TimeLog } from './types';
import { INITIAL_USERS, INITIAL_PROJECTS, ACTIVITIES_SEED } from './constants';

interface AppContextType extends AppState {
  setCurrentUser: (user: User | null) => void;
  login: (user: User) => void;
  addLog: (log: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt' | 'collaboratorId' | 'collaboratorName'>) => string | null;
  updateLog: (id: string, updates: Partial<TimeLog>) => void;
  deleteLog: (id: string) => void;
  addProject: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('g3eclocking_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [logs, setLogs] = useState<TimeLog[]>(() => {
    const saved = localStorage.getItem('g3eclocking_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('g3eclocking_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
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

  return (
    <AppContext.Provider value={{
      currentUser, users: INITIAL_USERS, projects, activities: ACTIVITIES_SEED, logs,
      setCurrentUser, login: setCurrentUser, addLog, updateLog, deleteLog, addProject
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
