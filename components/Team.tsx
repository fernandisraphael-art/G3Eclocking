import React, { useState } from 'react';
import { useApp } from '../store';
import CapacityPlanner from './CapacityPlanner';
import { UserRole } from '../types';

interface CollaboratorForm {
  id: string;
  name: string;
  profile: string;
  status: 'ATIVO' | 'INATIVO';
}

const Team: React.FC = () => {
  const { users, addUser, updateUser } = useApp();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CollaboratorForm | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const planningResources = users
    .filter(u => u.active)
    .filter(u => u.id !== 'admin-id' && u.name.trim().toLowerCase() !== 'admin')
    .map(u => ({ id: u.id, name: u.name }));

  const openNew = () => {
    setEditing({ id: '', name: '', profile: 'Colaborador', status: 'ATIVO' });
    setModalOpen(true);
  };

  const saveItem = (payload: CollaboratorForm) => {
    if (!payload.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }
    addUser({
      name: payload.name,
      role: payload.profile as UserRole,
      active: payload.status === 'ATIVO',
    });
    setModalOpen(false);
    setEditing(null);
  };

  const handleImportList = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split('\n');
        let imported = 0;

        lines.forEach((line, idx) => {
          if (idx === 0 && (line.toLowerCase().includes('nome') || line.toLowerCase().includes('name'))) return;

          const parts = line.split(',').map(p => p.trim());
          if (parts.length >= 2) {
            const name = parts[0];
            const profile = parts[1];
            if (name) {
              addUser({
                name,
                role: (profile || 'Colaborador') as UserRole,
                active: true,
              });
              imported++;
            }
          }
        });

        alert(`${imported} colaborador(es) importado(s) com sucesso!`);
      } catch (error) {
        alert('Erro ao importar arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, color: '#003057' }}>Equipe</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Capacity Planner — veja alocações e movimente tarefas</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={handleImportList}>IMPORTAR LISTA</button>
          <button className="btn btn-primary" onClick={openNew}>+ INCLUIR</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileSelected}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <CapacityPlanner resources={planningResources} />

      {isModalOpen && editing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: 'min(92vw, 400px)',
            padding: '20px',
            boxShadow: '0 16px 32px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#003057' }}>{editing.id ? 'Editar Colaborador' : 'Incluir Colaborador'}</h3>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#334155', fontWeight: 600, marginBottom: 4 }}>Nome</label>
                <input
                  value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#334155', fontWeight: 600, marginBottom: 4 }}>Perfil</label>
                <input
                  value={editing.profile}
                  onChange={e => setEditing({ ...editing, profile: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#334155', fontWeight: 600, marginBottom: 4 }}>Status</label>
                <select
                  value={editing.status}
                  onChange={e => setEditing({ ...editing, status: e.target.value as any })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }}
                >
                  <option value="ATIVO">ATIVO</option>
                  <option value="INATIVO">INATIVO</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setModalOpen(false);
                  setEditing(null);
                }}
              >
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={() => saveItem(editing)}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
