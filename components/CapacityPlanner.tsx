import React, { useMemo, useState, useEffect, useRef } from 'react';
import './CapacityPlanner.css';
import { useApp } from '../store';

interface Resource {
  id: string;
  name: string;
}

interface Task {
  id: string;
  project: string;
  resourceId: string;
  day: number; // 0..n-1
  hours: number;
}

const TOTAL_DAYS = 10;
const WINDOW_DAYS = 7;
const HOURS_PER_DAY = 8;
const DAY_WIDTH_PX = 160;
const TASK_HEIGHT_PX = 48;
const TASK_GAP_PX = 8;
const TASK_TOP_PADDING_PX = 12;

const makeMockTasks = (resources: Resource[]) => {
  const projects = ['CBTC SERRA', 'CANCELAS AR-4', 'PROJ X', 'MANUTENÇÃO'];
  const tasks: Task[] = [];
  let id = 1;
  for (let r = 0; r < resources.length; r++) {
    const allocations = (r % 3) + 1;
    for (let a = 0; a < allocations; a++) {
      tasks.push({ id: String(id++), project: projects[(r + a) % projects.length], resourceId: resources[r].id, day: (r + a) % TOTAL_DAYS, hours: [2,4,6][a % 3] });
    }
  }
  return tasks;
};

interface Props {
  resources: Resource[];
}

const CapacityPlanner: React.FC<Props> = ({ resources }) => {
  const { allocations, addAllocation, updateAllocation, deleteAllocation, syncAllocationsToLogs } = useApp();
  const [windowStartDay, setWindowStartDay] = useState(() => {
    const todayOffset = 0;
    return Math.max(0, Math.min(TOTAL_DAYS - 1, todayOffset));
  });
  const plannerGridRef = useRef<HTMLDivElement | null>(null);
  const resizeContainerRef = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState<{ id: string } | null>(null);
  const [deleteCandidateTaskId, setDeleteCandidateTaskId] = useState<string | null>(null);
  const [isCreateDemandOpen, setIsCreateDemandOpen] = useState(false);
  const [isEditDemandOpen, setIsEditDemandOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [createDemandForm, setCreateDemandForm] = useState({
    project: 'DEMANDA NOVA',
    hours: '4',
    resourceId: '',
    day: '1',
  });
  const [editDemandForm, setEditDemandForm] = useState({
    project: '',
    hours: '1',
    day: '1',
    resourceId: '',
  });

  const visibleWindowDays = Math.max(1, Math.min(WINDOW_DAYS, TOTAL_DAYS - windowStartDay));

  // initialize mock allocations in store if empty
  useEffect(() => {
    if ((!allocations || allocations.length === 0) && resources.length) {
      const initial = makeMockTasks(resources);
      initial.forEach(t => addAllocation({ project: t.project, resourceId: t.resourceId, day: t.day, hours: t.hours }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  // Helper to format real calendar dates
  const getRealDate = (dayOffset: number) => {
    const today = new Date();
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    return date;
  };

  const formatDay = (dayOffset: number) => {
    const date = getRealDate(dayOffset);
    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
    const dayNum = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'short' }).slice(0, 3);
    return { fullDate: date, dayName: dayName.toUpperCase(), dayNum, month: month.toUpperCase() };
  };

  const byResourceDay = useMemo(() => {
    const map: Record<string, Record<number, Task[]>> = {};
    resources.forEach(r => map[r.id] = {});
    (allocations || []).forEach((t: any) => {
      if (!map[t.resourceId]) return;
      map[t.resourceId][t.day] = map[t.resourceId][t.day] || [];
      map[t.resourceId][t.day].push(t);
    });
    return map;
  }, [allocations, resources]);

  const hoursUsed = (resourceId: string, day: number) => (byResourceDay[resourceId]?.[day] || []).reduce((s, t) => s + t.hours, 0);

  const onDragStart = (e: React.DragEvent, taskId: string, sourceResourceId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.setData('application/x-resource-id', sourceResourceId);
    try { e.currentTarget.classList.add('dragging'); } catch (err) {}
    e.dataTransfer.effectAllowed = 'move';
  };

  const onTaskDrag = (e: React.DragEvent, taskId: string) => {
    const grid = plannerGridRef.current;
    if (!grid) return;

    const rect = grid.getBoundingClientRect();
    const pointerX = e.clientX;
    const pointerY = e.clientY;

    if (pointerX === 0 && pointerY === 0) return;

    const isOutside =
      pointerX < rect.left ||
      pointerX > rect.right ||
      pointerY < rect.top ||
      pointerY > rect.bottom;

    if (isOutside) {
      setDeleteCandidateTaskId(taskId);
    } else if (deleteCandidateTaskId === taskId) {
      setDeleteCandidateTaskId(null);
    }
  };

  const onDragEnd = (e: React.DragEvent, taskId: string) => {
    try { e.currentTarget.classList.remove('dragging'); } catch (err) {}
    if (deleteCandidateTaskId === taskId) {
      deleteAllocation(taskId);
      if (editingTaskId === taskId) {
        setIsEditDemandOpen(false);
        setEditingTaskId(null);
      }
    }
    setDeleteCandidateTaskId(null);
  };

  const onDrop = (e: React.DragEvent, targetResourceId: string, targetDay: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const sourceResourceId = e.dataTransfer.getData('application/x-resource-id');
    if (!id) return;
    if (sourceResourceId && sourceResourceId !== targetResourceId) return;
    setDeleteCandidateTaskId(null);
    updateAllocation(id, { resourceId: targetResourceId, day: targetDay });
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const autoFit = (hours: number) => {
    // find earliest resource/day that can fit `hours` continuously
    for (let d = 0; d < TOTAL_DAYS; d++) {
      for (const r of resources) {
        const isAdminResource = r.id === 'admin-id' || r.name.trim().toLowerCase() === 'admin';
        if (isAdminResource) continue;
        if (hoursUsed(r.id, d) + hours <= HOURS_PER_DAY) return { resourceId: r.id, day: d };
      }
    }
    return null;
  };

  const getResourceAvailableHours = (resourceId: string, day: number) => {
    const used = hoursUsed(resourceId, day);
    return Math.max(0, HOURS_PER_DAY - used);
  };

  const openCreateDemandModal = () => {
    const fit = autoFit(Number(createDemandForm.hours) || 4);
    const defaultResourceId = fit?.resourceId || resources.find(r => r.id !== 'admin-id')?.id || resources[0]?.id || '';
    const defaultDay = String((fit?.day ?? 0) + 1);

    setCreateDemandForm({
      project: 'DEMANDA NOVA',
      hours: '4',
      resourceId: defaultResourceId,
      day: defaultDay,
    });
    setIsCreateDemandOpen(true);
  };

  const handleCreateDemand = () => {
    const hours = Number(createDemandForm.hours);
    const selectedDay = Number(createDemandForm.day) - 1;
    const resource = resources.find(r => r.id === createDemandForm.resourceId);

    if (!resource) {
      alert('Selecione um recurso para receber a demanda.');
      return;
    }
    if (!hours || hours <= 0) {
      alert('Informe uma quantidade de horas válida.');
      return;
    }
    if (selectedDay < 0 || selectedDay >= TOTAL_DAYS) {
      alert('Selecione um dia válido.');
      return;
    }

    const availableHours = getResourceAvailableHours(resource.id, selectedDay);
    if (hours > availableHours) {
      alert(`Capacidade insuficiente para ${resource.name} no Dia ${selectedDay + 1}. Disponível: ${availableHours}h`);
      return;
    }

    addAllocation({
      project: createDemandForm.project.trim() || 'DEMANDA NOVA',
      resourceId: resource.id,
      day: selectedDay,
      hours,
      spanDays: Math.max(1, Math.ceil(hours / HOURS_PER_DAY)),
    });

    alert(`Demanda criada para ${resource.name} no Dia ${selectedDay + 1}.`);
    setIsCreateDemandOpen(false);
  };

  const openEditDemandModal = (task: any) => {
    setEditingTaskId(String(task.id));
    setEditDemandForm({
      project: task.project || '',
      hours: String(task.hours || 1),
      day: String((task.day || 0) + 1),
      resourceId: task.resourceId || '',
    });
    setIsEditDemandOpen(true);
  };

  const handleSaveDemandEdit = () => {
    if (!editingTaskId) return;

    const task = (allocations || []).find((a: any) => String(a.id) === editingTaskId);
    if (!task) {
      setIsEditDemandOpen(false);
      setEditingTaskId(null);
      return;
    }

    const nextHours = Number(editDemandForm.hours);
    const nextDay = Number(editDemandForm.day) - 1;

    if (!nextHours || nextHours <= 0) {
      alert('Informe uma quantidade de horas válida.');
      return;
    }
    if (nextDay < 0 || nextDay >= TOTAL_DAYS) {
      alert('Selecione um dia válido.');
      return;
    }

    const usedOnDayWithoutCurrent = ((byResourceDay[task.resourceId]?.[nextDay] || []) as any[])
      .filter((entry: any) => String(entry.id) !== editingTaskId)
      .reduce((sum, entry: any) => sum + (entry.hours || 0), 0);

    if (usedOnDayWithoutCurrent + nextHours > HOURS_PER_DAY) {
      const available = Math.max(0, HOURS_PER_DAY - usedOnDayWithoutCurrent);
      alert(`Capacidade insuficiente neste dia. Disponível: ${available}h`);
      return;
    }

    updateAllocation(editingTaskId, {
      project: editDemandForm.project.trim() || 'DEMANDA NOVA',
      day: nextDay,
      hours: nextHours,
      spanDays: Math.max(1, Math.ceil(nextHours / HOURS_PER_DAY)),
    });

    setIsEditDemandOpen(false);
    setEditingTaskId(null);
  };

  const handleDeleteDemand = () => {
    if (!editingTaskId) return;
    deleteAllocation(editingTaskId);
    setIsEditDemandOpen(false);
    setEditingTaskId(null);
  };

  // Helpers to compute left/width in pixels for precise positioning
  const computeLeftPx = (day: number) => (day - windowStartDay) * DAY_WIDTH_PX;
  const computeWidthPx = (spanDays: number) => spanDays * DAY_WIDTH_PX;

  const computeTaskLanes = (resourceTasks: any[]) => {
    const sorted = [...resourceTasks].sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return String(a.id).localeCompare(String(b.id));
    });

    const laneEndDay: number[] = [];
    const laneByTaskId: Record<string, number> = {};

    sorted.forEach(task => {
      const startDay = task.day || 0;
      const span = Math.max(1, task.spanDays || 1);
      const endDay = startDay + span - 1;

      let laneIndex = laneEndDay.findIndex(end => startDay > end);
      if (laneIndex === -1) {
        laneIndex = laneEndDay.length;
        laneEndDay.push(endDay);
      } else {
        laneEndDay[laneIndex] = endDay;
      }

      laneByTaskId[String(task.id)] = laneIndex;
    });

    return {
      laneByTaskId,
      laneCount: Math.max(1, laneEndDay.length),
    };
  };

  // Mouse handlers for resizing
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing) return;
      const id = resizing.id;
      const alloc = (allocations || []).find(a => a.id === id);
      const container = resizeContainerRef.current;
      if (!alloc || !container) return;
      const rect = container.getBoundingClientRect();
      const relX = e.clientX - rect.left + container.scrollLeft;
      let targetDay = windowStartDay + Math.floor(relX / DAY_WIDTH_PX);
      targetDay = Math.max(alloc.day, Math.min(TOTAL_DAYS - 1, targetDay));
      const newSpan = Math.max(1, targetDay - alloc.day + 1);
      const newHours = newSpan * HOURS_PER_DAY;
      updateAllocation(id, { spanDays: newSpan, hours: newHours });
    };
    const onUp = () => {
      setResizing(null);
      resizeContainerRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing, allocations, windowStartDay, updateAllocation]);

  return (
    <div className="planner-root">
      <div className="planner-header">
        <h2>Capacity Planner</h2>
        <div className="planner-actions">
          <button
            onClick={() => setWindowStartDay(prev => Math.max(0, prev - WINDOW_DAYS))}
            className="btn btn-outline"
            disabled={windowStartDay === 0}
          >
            ← Semana anterior
          </button>
          <button
            onClick={() => setWindowStartDay(prev => Math.min(TOTAL_DAYS - 1, prev + WINDOW_DAYS))}
            className="btn btn-outline"
            disabled={windowStartDay + WINDOW_DAYS >= TOTAL_DAYS}
          >
            Próxima semana →
          </button>
          <button onClick={openCreateDemandModal} className="btn">Criar Demanda</button>
          <button onClick={() => { const n = syncAllocationsToLogs(); alert(`${n} apontamento(s) criados`); }} className="btn btn-outline">Salvar Alocações</button>
          <div className="legend"><span className="dot blue"/> Alocado &nbsp; <span className="dot green"/> Livre</div>
        </div>
      </div>

      <div className="planner-grid" ref={plannerGridRef}>
        <div className="grid-header">
          <div className="grid-cell resource-col">Recurso / Dia</div>
          <div className="grid-cell days-col">
            <div className="day-track" style={{ width: `${visibleWindowDays * DAY_WIDTH_PX}px` }}>
              {Array.from({ length: visibleWindowDays }).map((_, d) => {
                const absoluteDay = windowStartDay + d;
                const { dayName, dayNum, month } = formatDay(absoluteDay);
                return (
                <div key={absoluteDay} className="day-col" data-day={absoluteDay}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#003057' }}>
                    {absoluteDay === 0 ? 'HOJE' : dayName}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#003057' }}>
                    {dayNum}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6b7280' }}>
                    {month}
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>

        <div className="grid-body">
          {resources.map(r => (
            <div className="grid-row" key={r.id}>
              <div className="grid-cell resource-col">
                <div className="res-name">{r.name}</div>
                <div className="res-cap">Capacidade: {HOURS_PER_DAY}h</div>
              </div>
              <div className="grid-cell days-col" onDragOver={onDragOver} onDrop={e => {
                // compute drop day from clientX in current 7-day window
                const container = e.currentTarget as HTMLDivElement;
                const rect = container.getBoundingClientRect();
                if (!rect) return;
                const relX = e.clientX - rect.left;
                const localDay = Math.floor(relX / DAY_WIDTH_PX);
                const day = windowStartDay + localDay;
                onDrop(e, r.id, Math.max(windowStartDay, Math.min(windowStartDay + visibleWindowDays - 1, day)));
              }}>
                {(() => {
                  const resourceTasks = (allocations || []).filter((a: any) => {
                    if (a.resourceId !== r.id) return false;
                    const span = Math.max(1, a.spanDays || 1);
                    const taskStart = a.day;
                    const taskEnd = a.day + span - 1;
                    const windowEnd = windowStartDay + visibleWindowDays - 1;
                    return taskEnd >= windowStartDay && taskStart <= windowEnd;
                  });
                  const { laneByTaskId, laneCount } = computeTaskLanes(resourceTasks);
                  const dynamicHeight = TASK_TOP_PADDING_PX + (laneCount * TASK_HEIGHT_PX) + ((laneCount - 1) * TASK_GAP_PX) + TASK_TOP_PADDING_PX;

                  return (
                <div className="days-inner" style={{ width: `${visibleWindowDays * DAY_WIDTH_PX}px`, height: `${Math.max(120, dynamicHeight)}px` }}>
                  {/* background day columns */}
                  {Array.from({ length: visibleWindowDays }).map((_, d) => (
                    <div key={windowStartDay + d} className="bg-day" style={{ width: `${DAY_WIDTH_PX}px` }} />
                  ))}

                  {/* render tasks absolutely */}
                  {resourceTasks.map((t: any) => {
                    const span = t.spanDays || 1;
                    const left = computeLeftPx(t.day);
                    const width = computeWidthPx(span);
                    const lane = laneByTaskId[String(t.id)] || 0;
                    const top = TASK_TOP_PADDING_PX + lane * (TASK_HEIGHT_PX + TASK_GAP_PX);
                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={e => onDragStart(e as any, t.id, r.id)}
                        onDrag={e => onTaskDrag(e as any, t.id)}
                        onDragEnd={e => onDragEnd(e as any, t.id)}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('.resizer')) return;
                          openEditDemandModal(t);
                        }}
                        className="task abs"
                        style={{
                          left: `${left}px`,
                          width: `${width}px`,
                          top: `${top}px`,
                          opacity: deleteCandidateTaskId === String(t.id) ? 0.45 : 1,
                          border: deleteCandidateTaskId === String(t.id) ? '1px dashed #ef4444' : undefined,
                          transform: deleteCandidateTaskId === String(t.id) ? 'rotate(5deg)' : 'rotate(0deg)',
                        }}
                      >
                        {deleteCandidateTaskId === String(t.id) && (
                          <span className="task-delete-hint">✕</span>
                        )}
                        <div className="task-content">
                          <div className="task-project">{t.project}</div>
                          <div className="task-hours">{t.hours}h</div>
                        </div>
                        <div className="resizer" onMouseDown={(e) => {
                          e.stopPropagation();
                          resizeContainerRef.current = e.currentTarget.closest('.days-col') as HTMLDivElement | null;
                          setResizing({ id: t.id });
                        }} />
                      </div>
                    );
                  })}
                </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isCreateDemandOpen && (
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
            width: 'min(92vw, 520px)',
            padding: '20px',
            boxShadow: '0 16px 32px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#003057' }}>Criar Demanda</h3>
            <p style={{ margin: '0 0 14px 0', color: '#64748b', fontSize: '13px' }}>
              Defina projeto, horas, recurso responsável e dia da alocação.
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
              <label style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>Projeto / Descrição</label>
              <input
                value={createDemandForm.project}
                onChange={(e) => setCreateDemandForm(prev => ({ ...prev, project: e.target.value }))}
                style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>Horas</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={createDemandForm.hours}
                    onChange={(e) => setCreateDemandForm(prev => ({ ...prev, hours: e.target.value }))}
                    style={{ width: '100%', marginTop: '4px', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>Dia</label>
                  <select
                    value={createDemandForm.day}
                    onChange={(e) => setCreateDemandForm(prev => ({ ...prev, day: e.target.value }))}
                    style={{ width: '100%', marginTop: '4px', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  >
                    {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
                      <option key={i} value={String(i + 1)}>{`Dia ${i + 1}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>Recurso responsável</label>
              <select
                value={createDemandForm.resourceId}
                onChange={(e) => setCreateDemandForm(prev => ({ ...prev, resourceId: e.target.value }))}
                style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option value="">Selecione um recurso</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-outline" onClick={() => setIsCreateDemandOpen(false)}>Cancelar</button>
              <button className="btn" onClick={handleCreateDemand}>Criar</button>
            </div>
          </div>
        </div>
      )}

      {isEditDemandOpen && (
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
            width: 'min(92vw, 520px)',
            padding: '20px',
            boxShadow: '0 16px 32px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#003057' }}>Editar Demanda</h3>
            <p style={{ margin: '0 0 14px 0', color: '#64748b', fontSize: '13px' }}>
              Atualize os dados da tarefa. O recurso é fixo para esta edição.
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
              <label style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>Projeto / Descrição</label>
              <input
                value={editDemandForm.project}
                onChange={(e) => setEditDemandForm(prev => ({ ...prev, project: e.target.value }))}
                style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>Horas</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={editDemandForm.hours}
                    onChange={(e) => setEditDemandForm(prev => ({ ...prev, hours: e.target.value }))}
                    style={{ width: '100%', marginTop: '4px', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>Dia</label>
                  <select
                    value={editDemandForm.day}
                    onChange={(e) => setEditDemandForm(prev => ({ ...prev, day: e.target.value }))}
                    style={{ width: '100%', marginTop: '4px', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  >
                    {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
                      <option key={i} value={String(i + 1)}>{`Dia ${i + 1}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>Recurso responsável</label>
              <input
                value={resources.find(r => r.id === editDemandForm.resourceId)?.name || 'Recurso não encontrado'}
                readOnly
                style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#475569' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={handleDeleteDemand}>Excluir tarefa</button>
              <button className="btn btn-outline" onClick={() => { setIsEditDemandOpen(false); setEditingTaskId(null); }}>Cancelar</button>
              <button className="btn" onClick={handleSaveDemandEdit}>Salvar alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapacityPlanner;
