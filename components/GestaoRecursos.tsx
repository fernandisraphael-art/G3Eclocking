import React, { useState, useMemo } from 'react';
import './GestaoRecursos.css';
import CapacityPlanner from './CapacityPlanner';

interface Collaborator {
  id: string;
  name: string;
  profile: string;
  status: 'ATIVO' | 'INATIVO';
}

const NAMES = [
  'Raphael','Abner Orra','Adalberto Kumagaia','Alan Wliam','Alexandre Meneghel','Antônio Leal','Barbara Diolindo',
  'Guilherme Rodrigues','Hygor Teodoro','Iago Marques','Jesus Figueredo','João Paulo Rocha','Jonatas Cedro','Lucas Abreu',
  'Marcio Moreira','Marcos Reinh','Paulo Henrique','Pedro Melo','Pedro Pinto','Pedro Santana','Rodrigo Gonçalves','Tiago Gomes',
  'Tony Dornelas','Vinicius Rodrigues','Marcos Taninho'
];

const makeMock = (count = NAMES.length) => {
  const profiles = ['Colaborador', 'Coordenador', 'Especialista IV', 'Diretoria/Visor'];
  return Array.from({ length: count }).map((_, i) => ({
    id: String(i + 1),
    name: NAMES[i % NAMES.length],
    profile: profiles[i % profiles.length],
    status: i % 7 === 0 ? 'INATIVO' : 'ATIVO'
  }));
};

const PAGE_SIZE = 6;

const GestaoRecursos: React.FC = () => {
  const [items, setItems] = useState<Collaborator[]>(() => makeMock());
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Collaborator | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i => !q || i.name.toLowerCase().includes(q) || i.profile.toLowerCase().includes(q));
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openNew = () => { setEditing({ id: '', name: '', profile: 'Colaborador', status: 'ATIVO' }); setModalOpen(true); };

  const openEdit = (c: Collaborator) => { setEditing(c); setModalOpen(true); };

  const saveItem = (payload: Collaborator) => {
    if (!payload.name.trim()) { alert('Nome é obrigatório'); return; }
    if (payload.id) {
      setItems(prev => prev.map(p => p.id === payload.id ? payload : p));
    } else {
      const nextId = String((Math.max(0, ...items.map(i => Number(i.id))) + 1));
      setItems(prev => [{ ...payload, id: nextId }, ...prev]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const toggleStatus = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: i.status === 'ATIVO' ? 'INATIVO' : 'ATIVO' } : i));
  };

  const remove = (id: string) => {
    if (confirm('Remover colaborador?')) setItems(prev => prev.filter(i => i.id !== id));
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
          <button className="btn btn-outline" onClick={() => alert('Importar lista...')}>IMPORTAR LISTA</button>
          <button className="btn btn-outline" onClick={() => setPlannerOpen(true)}>CAPACITY PLANNER</button>
          <button className="btn btn-primary" onClick={openNew}>+ INCLUIR</button>
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
