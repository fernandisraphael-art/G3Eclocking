import React from 'react';
import { useApp } from '../store';
import CapacityPlanner from './CapacityPlanner';

const Team: React.FC = () => {
  const { users } = useApp();

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, color: '#003057' }}>Equipe</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Capacity Planner — veja alocações e movimente tarefas</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => alert('Importar lista...')}>IMPORTAR LISTA</button>
          <button className="btn btn-primary" onClick={() => alert('Incluir colaborador')}>+ INCLUIR</button>
        </div>
      </div>

      <CapacityPlanner resources={users.map(u => ({ id: u.id, name: u.name }))} />
    </div>
  );
};

export default Team;
