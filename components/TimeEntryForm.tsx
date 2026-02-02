
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store';
import { DemandType, ProjectPhase } from '../types';
import { DEMAND_TYPES, PROJECT_PHASES } from '../constants';

interface TimeEntryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editLog?: any;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ onSuccess, onCancel, editLog }) => {
  const { activities, projects, addLog, updateLog, currentUser } = useApp();
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    demandType: DemandType.PROJETO,
    projectId: '',
    projectName: '',
    phase: ProjectPhase.NA,
    activityType: '',
    hours: 1,
    observation: ''
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editLog) {
      setFormData({
        date: editLog.date,
        demandType: editLog.demandType,
        projectId: editLog.projectId,
        projectName: editLog.projectName,
        phase: editLog.phase,
        activityType: editLog.activityType,
        hours: editLog.hours,
        observation: editLog.observation || ''
      });
    }
  }, [editLog]);

  useEffect(() => {
    if (formData.demandType === DemandType.FEL01) {
      setFormData(prev => ({ ...prev, phase: ProjectPhase.FEL01 }));
    } else if (formData.demandType === DemandType.ROTINA || formData.demandType === DemandType.SUPORTE) {
      setFormData(prev => ({ ...prev, projectId: 'NA', projectName: 'N/A', phase: ProjectPhase.NA }));
    } else if (formData.demandType === DemandType.GARANTIA) {
      if (formData.phase === ProjectPhase.NA) {
        setFormData(prev => ({ ...prev, phase: ProjectPhase.POS_OBRA }));
      }
    }
  }, [formData.demandType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.demandType === DemandType.PROJETO && formData.phase === ProjectPhase.NA) {
      setError("Demandas do tipo Projeto exigem uma fase válida.");
      return;
    }

    if (formData.demandType === DemandType.PROJETO && (!formData.projectId || formData.projectId === 'NA')) {
      setError("Selecione um projeto válido.");
      return;
    }

    if (!formData.activityType) {
      setError("Selecione um tipo de atividade.");
      return;
    }

    if (formData.hours <= 0 || formData.hours > 24) {
      setError("Horas devem estar entre 0.25 e 24.");
      return;
    }

    if (formData.hours % 0.25 !== 0) {
      setError("Horas devem ser múltiplos de 0.25.");
      return;
    }

    if (editLog) {
      updateLog(editLog.id, { ...formData });
      onSuccess();
    } else {
      const err = addLog(formData);
      if (err) {
        setError(err);
      } else {
        onSuccess();
      }
    }
  };

  const isLocked = (field: string) => {
    if (formData.demandType === DemandType.ROTINA || formData.demandType === DemandType.SUPORTE) {
      return field === 'projectId' || field === 'phase';
    }
    if (formData.demandType === DemandType.FEL01) {
      return field === 'phase';
    }
    return false;
  };

  const handleOpenPicker = () => {
    if (dateInputRef.current && 'showPicker' in HTMLInputElement.prototype) {
      try {
        dateInputRef.current.showPicker();
      } catch (e) {
        dateInputRef.current.focus();
      }
    } else if (dateInputRef.current) {
      dateInputRef.current.focus();
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
        <div className="w-12 h-12 bg-[#003057] rounded-2xl flex items-center justify-center text-[#FFCD00]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#003057]">
            {editLog ? 'Editar Registro' : 'Novo Apontamento GEEE'}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Controle de Horas Engenharia</p>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 flex items-center gap-3">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {formData.hours > 12 && (
        <div className="mb-6 p-4 bg-amber-50 text-amber-700 text-sm rounded-2xl border border-amber-100 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.515 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd" />
          </svg>
          Aviso: Jornada de trabalho superior a 12h.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Data</label>
            <div 
              className="relative group cursor-pointer"
              onClick={handleOpenPicker}
            >
              <input
                ref={dateInputRef}
                type="date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-0 focus:border-[#003057] outline-none font-medium text-slate-700 transition-all appearance-none"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-[#003057] transition-colors pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Tipo de Demanda</label>
            <select
              value={formData.demandType}
              onChange={e => setFormData(prev => ({ ...prev, demandType: e.target.value as DemandType }))}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-[#003057] outline-none font-medium text-slate-700 transition-all"
              required
            >
              {DEMAND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Projeto</label>
            <select
              disabled={isLocked('projectId')}
              value={formData.projectId}
              onChange={e => {
                const p = projects.find(proj => proj.id === e.target.value);
                setFormData(prev => ({ ...prev, projectId: e.target.value, projectName: p?.name || 'N/A' }));
              }}
              className={`w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-[#003057] outline-none font-medium text-slate-700 transition-all ${isLocked('projectId') ? 'opacity-50 cursor-not-allowed bg-slate-100 border-dashed' : ''}`}
              required
            >
              <option value="">Selecione o projeto...</option>
              <option value="NA">Não Aplicável (N/A)</option>
              {projects.filter(p => p.status === 'ativo').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Fase do Projeto</label>
            <select
              disabled={isLocked('phase')}
              value={formData.phase}
              onChange={e => setFormData(prev => ({ ...prev, phase: e.target.value as ProjectPhase }))}
              className={`w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-[#003057] outline-none font-medium text-slate-700 transition-all ${isLocked('phase') ? 'opacity-50 cursor-not-allowed bg-slate-100 border-dashed' : ''}`}
              required
            >
              {PROJECT_PHASES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Tipo de Atividade</label>
            <select
              value={formData.activityType}
              onChange={e => setFormData(prev => ({ ...prev, activityType: e.target.value }))}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-[#003057] outline-none font-medium text-slate-700 transition-all"
              required
            >
              <option value="">Selecione a atividade...</option>
              {activities.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Horas (Múltiplos de 0.25)</label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              value={formData.hours}
              onChange={e => setFormData(prev => ({ ...prev, hours: parseFloat(e.target.value) }))}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-[#003057] outline-none font-black text-slate-800 text-xl transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Observações Adicionais</label>
          <textarea
            value={formData.observation}
            onChange={e => setFormData(prev => ({ ...prev, observation: e.target.value }))}
            className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-[#003057] outline-none font-medium text-slate-700 h-28 resize-none transition-all"
            placeholder="Detalhes sobre as atividades desenvolvidas..."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-8 py-4 border-2 border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 font-black transition-all uppercase tracking-widest text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-8 py-4 bg-[#FFCD00] text-[#003057] rounded-2xl hover:bg-[#ffe052] shadow-lg shadow-[#FFCD00]/20 font-black transition-all uppercase tracking-widest text-sm border-b-4 border-black/10"
          >
            {editLog ? 'Salvar Alterações' : 'Confirmar Apontamento'}
          </button>
        </div>
      </form>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default TimeEntryForm;
