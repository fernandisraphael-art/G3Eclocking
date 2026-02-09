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

const DAYS = 10; // visible days
const HOURS_PER_DAY = 8;

const makeMockTasks = (resources: Resource[]) => {
  const projects = ['CBTC SERRA', 'CANCELAS AR-4', 'PROJ X', 'MANUTENÇÃO'];
  const tasks: Task[] = [];
  let id = 1;
  for (let r = 0; r < resources.length; r++) {
    const allocations = (r % 3) + 1;
    for (let a = 0; a < allocations; a++) {
      tasks.push({ id: String(id++), project: projects[(r + a) % projects.length], resourceId: resources[r].id, day: (r + a) % DAYS, hours: [2,4,6][a % 3] });
    }
  }
  return tasks;
};

interface Props {
  resources: Resource[];
}

const CapacityPlanner: React.FC<Props> = ({ resources }) => {
  const { allocations, addAllocation, updateAllocation, syncAllocationsToLogs } = useApp();
  const [visibleDays] = useState(DAYS);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [resizing, setResizing] = useState<{ id: string } | null>(null);

  // initialize mock allocations in store if empty
  useEffect(() => {
    if ((!allocations || allocations.length === 0) && resources.length) {
      const initial = makeMockTasks(resources);
      initial.forEach(t => addAllocation({ project: t.project, resourceId: t.resourceId, day: t.day, hours: t.hours }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);

  const byResourceDay = useMemo(() => {
    const map: Record<string, Record<number, Task[]>> = {};
    resources.forEach(r => map[r.id] = {});
    (allocations || []).forEach((t: any) => {
      map[t.resourceId][t.day] = map[t.resourceId][t.day] || [];
      map[t.resourceId][t.day].push(t);
    });
    return map;
  }, [allocations, resources]);

  const hoursUsed = (resourceId: string, day: number) => (byResourceDay[resourceId][day] || []).reduce((s, t) => s + t.hours, 0);

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    try { e.currentTarget.classList.add('dragging'); } catch (err) {}
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = (e: React.DragEvent, targetResourceId: string, targetDay: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    updateAllocation(id, { resourceId: targetResourceId, day: targetDay });
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const autoFit = (hours: number) => {
    // find earliest resource/day that can fit `hours` continuously
    for (let d = 0; d < visibleDays; d++) {
      for (const r of resources) {
        if (hoursUsed(r.id, d) + hours <= HOURS_PER_DAY) return { resourceId: r.id, day: d };
      }
    }
    return null;
  };

  const handleCreateDemand = () => {
    const hours = Number(prompt('Horas da demanda (ex: 4):', '4')) || 0;
    if (!hours) return;
    const fit = autoFit(hours);
    if (!fit) return alert('Nenhum espaço disponível nos próximos dias.');
    const project = prompt('Projeto/descrição:', 'DEMANDA NOVA') || 'DEMANDA NOVA';
    addAllocation({ project, resourceId: fit.resourceId, day: fit.day, hours, spanDays: Math.max(1, Math.ceil(hours / HOURS_PER_DAY)) });
    alert(`Alocado em ${resources.find(r => r.id === fit.resourceId)?.name} dia ${fit.day + 1}`);
  };

  // Helpers to compute left/width percent for absolute positioning
  const computeLeft = (day: number) => (day / visibleDays) * 100;
  const computeWidth = (spanDays: number) => (spanDays / visibleDays) * 100;

  // Mouse handlers for resizing
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing) return;
      const id = resizing.id;
      const alloc = (allocations || []).find(a => a.id === id);
      if (!alloc || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const dayWidth = rect.width / visibleDays;
      let targetDay = Math.floor(relX / dayWidth);
      targetDay = Math.max(alloc.day, Math.min(visibleDays - 1, targetDay));
      const newSpan = Math.max(1, targetDay - alloc.day + 1);
      const newHours = newSpan * HOURS_PER_DAY;
      updateAllocation(id, { spanDays: newSpan, hours: newHours });
    };
    const onUp = () => setResizing(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing, allocations, visibleDays, updateAllocation]);

  return (
    <div className="planner-root">
      <div className="planner-header">
        <h2>Capacity Planner</h2>
        <div className="planner-actions">
          <button onClick={handleCreateDemand} className="btn">Criar Demanda</button>
          <button onClick={() => { const n = syncAllocationsToLogs(); alert(`${n} apontamento(s) criados`); }} className="btn btn-outline">Salvar Alocações</button>
          <div className="legend"><span className="dot blue"/> Alocado &nbsp; <span className="dot green"/> Livre</div>
        </div>
      </div>

      <div className="planner-grid">
        <div className="grid-header">
          <div className="grid-cell resource-col">Recurso / Dia</div>
          <div className="grid-cell days-col">
            {Array.from({ length: visibleDays }).map((_, d) => (
              <div key={d} className="day-col" data-day={d}>Dia {d + 1}</div>
            ))}
          </div>
        </div>

        <div className="grid-body">
          {resources.map(r => (
            <div className="grid-row" key={r.id}>
              <div className="grid-cell resource-col">
                <div className="res-name">{r.name}</div>
                <div className="res-cap">Capacidade: {HOURS_PER_DAY}h</div>
              </div>
              <div className="grid-cell days-col" ref={wrapperRef} onDragOver={onDragOver} onDrop={e => {
                // compute drop day from clientX
                const rect = wrapperRef.current?.getBoundingClientRect();
                if (!rect) return;
                const relX = e.clientX - rect.left;
                const day = Math.floor((relX / rect.width) * visibleDays);
                onDrop(e, r.id, Math.max(0, Math.min(visibleDays - 1, day)));
              }}>
                <div className="days-inner" style={{ width: `${visibleDays * 160}px` }}>
                  {/* background day columns */}
                  {Array.from({ length: visibleDays }).map((_, d) => (
                    <div key={d} className="bg-day" style={{ width: `${100 / visibleDays}%` }} />
                  ))}

                  {/* render tasks absolutely */}
                  {(allocations || []).filter((a: any) => a.resourceId === r.id).map((t: any) => {
                    const span = t.spanDays || 1;
                    const left = computeLeft(t.day);
                    const width = computeWidth(span);
                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={e => onDragStart(e as any, t.id)}
                        className="task abs"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        <div className="task-content">
                          <div className="task-project">{t.project}</div>
                          <div className="task-hours">{t.hours}h</div>
                        </div>
                        <div className="resizer" onMouseDown={(e) => { e.stopPropagation(); setResizing({ id: t.id }); }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CapacityPlanner;
