
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store';
import Layout from './components/Layout';
import Login from './components/Login';
import TimeEntryForm from './components/TimeEntryForm';
import LogList from './components/LogList';
import Dashboard from './components/Dashboard';
import { UserRole } from './types';

const MainApp: React.FC = () => {
  const { currentUser, logs, addProject } = useApp();
  const [activeTab, setActiveTab] = useState('my-day');
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);

  // Auto-redirect Admin/Director to Team page
  useEffect(() => {
    if (currentUser?.role === UserRole.DIRECTOR && activeTab === 'my-day') {
      setActiveTab('team');
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Login />;
  }

  const myLogs = logs.filter(l => l.collaboratorId === currentUser?.id);
  const today = new Date().toISOString().split('T')[0];
  const logsToday = myLogs.filter(l => l.date === today);

  const handleEdit = (log: any) => {
    setEditingLog(log);
    setShowForm(true);
  };

  const handleNewProject = () => {
    const name = prompt('Nome do novo projeto (Tipo FEL 0/1):');
    if (name) {
      addProject(name);
      alert('Projeto criado com sucesso!');
    }
  };

  const renderContent = () => {
    if (showForm) {
      return (
        <TimeEntryForm 
          editLog={editingLog}
          onSuccess={() => { setShowForm(false); setEditingLog(null); }}
          onCancel={() => { setShowForm(false); setEditingLog(null); }}
        />
      );
    }

    switch (activeTab) {
      case 'my-day':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div>
                <h2 className="text-3xl font-black text-[#003057] tracking-tight">Meu Dia</h2>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-[#003057] text-white px-6 py-4 rounded-2xl hover:bg-[#002544] transition-all shadow-xl shadow-blue-900/10 flex items-center gap-2 font-black active:scale-95 border-b-4 border-black/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden sm:inline">LANÇAR HORAS</span>
              </button>
            </div>
            <LogList logs={logsToday} onEdit={handleEdit} title="Apontamentos de Hoje" showFilters={false} />
          </div>
        );
      case 'history':
        return <LogList logs={myLogs} onEdit={handleEdit} title="Minhas Horas" />;
      case 'team':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-3xl font-black text-[#003057] tracking-tight">Equipe GEEE</h2>
              {(currentUser?.role === UserRole.COORDINATOR) && (
                <button 
                  onClick={handleNewProject}
                  className="text-[#003057] bg-[#FFCD00] px-6 py-3 rounded-xl hover:bg-[#ffe052] font-black transition-all shadow-md shadow-black/5"
                >
                  + NOVO PROJETO
                </button>
              )}
            </div>
            <LogList logs={logs} title="" />
          </div>
        );
      case 'reports':
        return <Dashboard />;
      default:
        return <div>Em breve...</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setShowForm(false); }}>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {renderContent()}
      </div>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
