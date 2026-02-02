
import React, { useState } from 'react';
import { useApp } from '../store';
import { UserRole } from '../types';

interface LogListProps {
  logs: any[];
  onEdit?: (log: any) => void;
  title?: string;
  showFilters?: boolean;
}

const LogList: React.FC<LogListProps> = ({ logs, onEdit, title, showFilters = true }) => {
  const { currentUser, deleteLog } = useApp();
  const [filterDate, setFilterDate] = useState('');

  const filtered = logs.filter(log => {
    if (filterDate && log.date !== filterDate) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {title && <h2 className="text-2xl font-black text-[#003057] tracking-tight">{title}</h2>}
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="p-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#003057] bg-white shadow-sm"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <p className="font-bold text-slate-300 uppercase tracking-widest text-xs">Nenhum registro encontrado</p>
          </div>
        ) : (
          filtered.map(log => (
            <div key={log.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start transition-all hover:shadow-md hover:border-slate-200">
              <div className="flex-shrink-0 w-full md:w-24 text-center border-b md:border-b-0 md:border-r border-slate-50 pb-4 md:pb-0">
                <div className="text-4xl font-black text-[#003057] leading-none">{log.hours.toFixed(2)}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Horas</div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">{log.demandType}</span>
                  <span className="text-[#003057] font-black text-sm">{new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="text-base font-black text-[#003057] leading-tight">
                  {log.projectName} 
                  <span className="text-slate-400 font-bold ml-2 px-2 py-0.5 bg-slate-50 rounded-lg text-xs tracking-tighter">FASE: {log.phase}</span>
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#FFCD00]"></div>
                   <span className="font-medium">"{log.activityType}"</span>
                </div>
                {log.observation && (
                  <div className="bg-slate-50 p-3 rounded-xl border-l-4 border-slate-200">
                    <p className="text-xs text-slate-500 font-medium italic">{log.observation}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-50">
                   <div className="w-5 h-5 rounded-lg bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500 uppercase">{log.collaboratorName.charAt(0)}</div>
                   <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{log.collaboratorName}</span>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0">
                {log.collaboratorId === currentUser?.id && (
                  <>
                    <button 
                      onClick={() => onEdit?.(log)}
                      className="flex-1 md:w-28 text-[10px] font-black uppercase tracking-widest py-2.5 border-2 border-slate-100 text-slate-500 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => { if(confirm('Deseja realmente excluir este registro?')) deleteLog(log.id) }}
                      className="flex-1 md:w-28 text-[10px] font-black uppercase tracking-widest py-2.5 border-2 border-red-50 text-red-400 rounded-xl hover:bg-red-50 transition-all active:scale-95"
                    >
                      Excluir
                    </button>
                  </>
                )}
                
                {currentUser?.role === UserRole.COORDINATOR && log.collaboratorId !== currentUser.id && (
                   <button 
                    onClick={() => { if(confirm('Remover registro do colaborador?')) deleteLog(log.id) }}
                    className="flex-1 md:w-28 text-[10px] font-black uppercase tracking-widest py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all active:scale-95 shadow-sm"
                   >
                     Admin Del
                   </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogList;
