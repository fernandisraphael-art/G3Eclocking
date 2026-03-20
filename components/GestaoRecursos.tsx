import React, { useState, useMemo } from 'react';
import './GestaoRecursos.css';
import CapacityPlanner from './CapacityPlanner';
import { useApp } from '../store';
import { UserRole } from '../types';

interface Collaborator {
  id: string;
  name: string;
  profile: string;
  status: 'ATIVO' | 'INATIVO';
}

const PAGE_SIZE = 6;

const GestaoRecursos: React.FC = () => {
  const { users, addUser, updateUser, toggleUserStatus, removeUser } = useApp();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVO' | 'INATIVO'>('TODOS');
  const [profileFilter, setProfileFilter] = useState('TODOS');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Collaborator | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const items = useMemo<Collaborator[]>(() => {
    return users
      .filter(u => u.id !== 'admin-id')
      .map(u => ({
        id: u.id,
        name: u.name,
        profile: u.role,
        status: u.active ? 'ATIVO' : 'INATIVO',
      }));
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i => {
      const matchesText = !q || i.name.toLowerCase().includes(q) || i.profile.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'TODOS' || i.status === statusFilter;
      const matchesProfile = profileFilter === 'TODOS' || i.profile === profileFilter;
      return matchesText && matchesStatus && matchesProfile;
    });
  }, [items, query, statusFilter, profileFilter]);

  const profileOptions = useMemo(() => {
    const uniqueProfiles = Array.from(new Set(items.map(i => i.profile)));
    return uniqueProfiles.sort((a, b) => a.localeCompare(b));
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openNew = () => { setEditing({ id: '', name: '', profile: 'Colaborador', status: 'ATIVO' }); setModalOpen(true); };

  const openEdit = (c: Collaborator) => { setEditing(c); setModalOpen(true); };

  const saveItem = (payload: Collaborator) => {
    if (!payload.name.trim()) { alert('Nome é obrigatório'); return; }
    if (payload.id) {
      updateUser(payload.id, {
        name: payload.name,
        role: payload.profile as UserRole,
        active: payload.status === 'ATIVO',
      });
    } else {
      addUser({
        name: payload.name,
        role: payload.profile as UserRole,
        active: payload.status === 'ATIVO',
      });
    }
    setModalOpen(false);
    setEditing(null);
  };

  const toggleStatus = (id: string) => {
    toggleUserStatus(id);
  };

  const remove = (id: string) => {
    if (confirm('Remover colaborador?')) removeUser(id);
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
        setPage(1);
      } catch (error) {
        alert('Erro ao importar arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <div className="gr-header">
        <div>
          <h1>Gestão de Recursos</h1>
          <p className="muted">Gestão de colaboradores</p>
        </div>
        <div className="gr-actions">
          <input className="gr-search" placeholder="Buscar nome ou perfil" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
          <select className="gr-search" value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}>
            <option value="TODOS">Status: Todos</option>
            <option value="ATIVO">Status: Ativos</option>
            <option value="INATIVO">Status: Inativos</option>
          </select>
          <select className="gr-search" value={profileFilter} onChange={e => { setProfileFilter(e.target.value); setPage(1); }}>
            <option value="TODOS">Perfil: Todos</option>
            {profileOptions.map(profile => (
              <option key={profile} value={profile}>{`Perfil: ${profile}`}</option>
            ))}
          </select>
          <button className="btn btn-outline" onClick={handleImportList}>IMPORTAR LISTA</button>
          <button className="btn btn-outline" onClick={() => setPlannerOpen(true)}>CAPACITY PLANNER</button>
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

      <div className="gr-card">
        <table className="gr-table">
          <thead>
            <tr>
              <th>COLABORADOR</th>
              <th>PERFIL / ESPECIALIDADE</th>
              <th>STATUS</th>
              <th style={{ width: 140 }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(item => (
              <tr key={item.id}>
                <td className="strong">{item.name}</td>
                <td className="muted">{item.profile}</td>
                <td>
                  <span className={`badge ${item.status === 'ATIVO' ? 'badge-success' : 'badge-danger'}`}>{item.status}</span>
                </td>
                <td>
                  <div className="actions">
                    <button className="icon" onClick={() => openEdit(item)}>✏️</button>
                    <button className="icon" onClick={() => toggleStatus(item.id)}>🚫</button>
                    <button className="icon" onClick={() => remove(item.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#9aa8b6' }}>Nenhum colaborador encontrado.</td></tr>
            )}
          </tbody>
        </table>

        <div className="gr-footer">
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Próxima</button>
          </div>
          <div className="summary">Total: {filtered.length} colaborador(es)</div>
        </div>
      </div>

      {isModalOpen && editing && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{editing.id ? 'Editar Colaborador' : 'Incluir Colaborador'}</h3>
            <div className="form-row">
              <label>Nome</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Perfil</label>
              <input value={editing.profile} onChange={e => setEditing({ ...editing, profile: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Status</label>
              <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as any })}>
                <option value="ATIVO">ATIVO</option>
                <option value="INATIVO">INATIVO</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => { setModalOpen(false); setEditing(null); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => saveItem(editing)}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {plannerOpen && (
        <div className="modal-backdrop">
          <div style={{ width: '95%', maxHeight: '90vh', overflow: 'auto', padding: 12 }}>
            <button style={{ float: 'right', marginBottom: 8 }} className="btn btn-outline" onClick={() => setPlannerOpen(false)}>Fechar</button>
            <CapacityPlanner resources={items.map(i => ({ id: i.id, name: i.name }))} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoRecursos;
