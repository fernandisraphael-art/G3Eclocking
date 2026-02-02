
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

    const getDayName = () => {
      const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const today = new Date();
      const dayName = days[today.getDay()];
      const dayNum = today.getDate().toString().padStart(2, '0');
      const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      const monthName = months[today.getMonth()];
      return `${dayName.toUpperCase()}, ${dayNum} DE ${monthName.toUpperCase()}`;
    };

    switch (activeTab) {
      case 'my-day':
        return (
          <div>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '32px'
            }}>
              <div>
                <h1 style={{
                  margin: '0 0 8px 0',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#003057'
                }}>
                  Meu Dia
                </h1>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#a0b0c0',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  {getDayName()}
                </p>
              </div>
              <button 
                onClick={() => setShowForm(true)}
                style={{
                  backgroundColor: '#003057',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#002544';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#003057';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '18px' }}>+</span>
                LANÇAR HORAS
              </button>
            </div>
            <LogList logs={logsToday} onEdit={handleEdit} title="Apontamentos de Hoje" showFilters={false} />
          </div>
        );
      case 'history':
        return <LogList logs={myLogs} onEdit={handleEdit} title="Minhas Horas" />;
      case 'team':
        return (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <h1 style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#003057'
              }}>
                Equipe GEEE
              </h1>
              {(currentUser?.role === UserRole.COORDINATOR) && (
                <button 
                  onClick={handleNewProject}
                  style={{
                    backgroundColor: '#FFCD00',
                    color: '#003057',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffe052';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFCD00';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
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
      <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
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
