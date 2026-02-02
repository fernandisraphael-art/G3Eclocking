
import React, { useState } from 'react';
import { useApp } from '../store';
import { DemandType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard: React.FC = () => {
  const { logs, projects, users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const totalHours = logs.reduce((acc, l) => acc + l.hours, 0);

  // Data for Project Chart
  const projectDataMap = logs.reduce((acc: any, log) => {
    acc[log.projectName] = (acc[log.projectName] || 0) + log.hours;
    return acc;
  }, {});
  const projectChartData = Object.entries(projectDataMap)
    .map(([name, hours]) => ({ name, hours: hours as number }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 10);

  // Data for Demand Chart
  const demandDataMap = logs.reduce((acc: any, log) => {
    acc[log.demandType] = (acc[log.demandType] || 0) + log.hours;
    return acc;
  }, {});
  const demandChartData = Object.entries(demandDataMap).map(([name, value]) => ({ name, value: value as number }));

  // Routine vs Project Ratio
  const routineHours = logs.filter(l => l.demandType === DemandType.ROTINA || l.demandType === DemandType.SUPORTE).reduce((acc, l) => acc + l.hours, 0);
  const projectActiveHours = logs.filter(l => l.demandType === DemandType.PROJETO || l.demandType === DemandType.FEL01).reduce((acc, l) => acc + l.hours, 0);
  const totalRelevant = routineHours + projectActiveHours || 1;
  const routinePercent = (routineHours / totalRelevant) * 100;
  const projectPercent = (projectActiveHours / totalRelevant) * 100;

  // Collaborator Summary
  const collabDataMap = logs.reduce((acc: any, log) => {
    acc[log.collaboratorName] = (acc[log.collaboratorName] || 0) + log.hours;
    return acc;
  }, {});
  const collabSummary = Object.entries(collabDataMap)
    .map(([name, hours]) => ({ name, hours: hours as number }))
    .sort((a, b) => b.hours - a.hours);

  // Filtered Logs for Consolidation Table
  const filteredLogs = logs.filter(l => 
    l.collaboratorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.activityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Corporate Colors
  const COLORS = ['#003057', '#FFCD00', '#0058a3', '#ffd940', '#001b31', '#d9af00'];

  const exportCSV = () => {
    const headers = ['Colaborador,Data,Demanda,Projeto,Fase,Atividade,Horas,Observação\n'];
    const rows = logs.map(l => `${l.collaboratorName},${l.date},${l.demandType},${l.projectName},${l.phase},${l.activityType},${l.hours},${l.observation?.replace(/,/g, ';') || ''}\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `consolidado_geee_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Administrativo */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#003057] rounded-3xl flex items-center justify-center text-[#FFCD00] shadow-lg shadow-blue-900/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-4xl font-black text-[#003057] tracking-tighter">Administrativo</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">Consolidação e Gestão GEEE</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <button 
            onClick={exportCSV}
            className="flex-1 lg:flex-none bg-[#FFCD00] text-[#003057] px-10 py-4 rounded-2xl hover:bg-[#ffe052] transition-all shadow-xl shadow-[#FFCD00]/10 font-black uppercase tracking-widest text-xs border-b-4 border-black/10 flex items-center justify-center gap-3 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Baixar Lançamentos (CSV)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#003057] p-8 rounded-[2.5rem] shadow-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full group-hover:scale-125 transition-transform"></div>
          <div className="text-blue-200/50 text-[10px] font-black uppercase tracking-widest mb-3">Total de Horas Consolidadas</div>
          <div className="text-5xl font-black text-[#FFCD00] tabular-nums">{totalHours.toFixed(1)}</div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter italic">Base de dados completa</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Projetos Monitorados</div>
            <div className="text-5xl font-black text-[#003057] tabular-nums">{projects.filter(p => p.status === 'ativo').length}</div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase">
             <span>Em Execução</span>
             <span className="text-[#003057]">{projects.length} Total</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Equipe Ativa</div>
            <div className="text-5xl font-black text-[#003057] tabular-nums">{new Set(logs.map(l => l.collaboratorId)).size}</div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase">
             <span>Com Lançamentos</span>
             <span className="text-[#003057]">{users.length} Colaboradores</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Eficiência Projeto vs Rotina</div>
           <div className="flex h-12 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 p-1">
              <div 
                style={{ width: `${projectPercent}%` }} 
                className="bg-[#003057] h-full flex items-center justify-center text-[9px] font-black text-white transition-all duration-1000 rounded-xl"
              >
                {projectPercent.toFixed(0)}%
              </div>
              <div 
                style={{ width: `${routinePercent}%` }} 
                className="bg-[#FFCD00] h-full flex items-center justify-center text-[9px] font-black text-[#003057] transition-all duration-1000 rounded-xl ml-1"
              >
                {routinePercent.toFixed(0)}%
              </div>
           </div>
           <div className="mt-4 grid grid-cols-2 gap-2 text-[9px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-1.5 text-[#003057]"><div className="w-2 h-2 rounded-full bg-[#003057]"></div> Engenharia</div>
              <div className="flex items-center gap-1.5 text-slate-400"><div className="w-2 h-2 rounded-full bg-[#FFCD00]"></div> Apoio/Geral</div>
           </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
            <h3 className="text-xl font-black text-[#003057] uppercase tracking-tighter">Horas por Projeto (Top 10)</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acumulado</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}} width={120} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="hours" fill="#003057" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
            <h3 className="text-xl font-black text-[#003057] uppercase tracking-tighter">Mix de Categoria</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribuição %</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={demandChartData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={120} 
                  innerRadius={80}
                  paddingAngle={8}
                >
                  {demandChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '20px' }} />
                <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingTop: '20px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ranking and Consolidated Table */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
             <h3 className="text-lg font-black text-[#003057] uppercase tracking-tighter">Ranking de Produtividade</h3>
             <div className="px-4 py-2 bg-white rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                Total: {users.length} Colaboradores
             </div>
          </div>
          <div className="p-4 overflow-x-auto">
             <table className="w-full text-left">
                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                   <tr>
                      <th className="px-6 py-4">Colaborador</th>
                      <th className="px-6 py-4 text-right">Horas Totais</th>
                      <th className="px-6 py-4 text-right">Diferencial/Período</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {collabSummary.map((collab, idx) => (
                     <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-black text-[#003057]">
                           <span className="mr-3 text-slate-300 font-mono text-xs group-hover:text-[#FFCD00] transition-colors">{String(idx + 1).padStart(2, '0')}</span>
                           {collab.name}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-black text-[#003057]">{collab.hours.toFixed(2)}h</td>
                        <td className="px-6 py-4 text-right">
                           <div className="inline-flex px-3 py-1 rounded-lg bg-green-50 text-green-600 text-[10px] font-black">
                              {(collab.hours / Math.max(1, new Set(logs.filter(l => l.collaboratorName === collab.name).map(l => l.date)).size)).toFixed(1)}h avg/dia
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* FULL CONSOLIDATION TABLE */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 bg-[#003057] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter">Histórico Geral Consolidado</h3>
                <p className="text-blue-300/60 text-[10px] font-black uppercase tracking-widest">Base Auditável completa</p>
             </div>
             <div className="relative w-full sm:w-72">
                <input 
                  type="text" 
                  placeholder="Filtrar por nome, projeto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-[#FFCD00] placeholder:text-white/20"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-white/30 absolute left-3.5 top-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
             </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50 bg-slate-50/30">
                   <tr>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Colaborador</th>
                      <th className="px-6 py-4">Projeto / Atividade</th>
                      <th className="px-6 py-4 text-center">Tipo</th>
                      <th className="px-6 py-4 text-right">Horas</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {filteredLogs.slice(0, 100).map((log, idx) => (
                     <tr key={log.id} className="hover:bg-slate-50/80 transition-all border-l-4 border-transparent hover:border-[#FFCD00]">
                        <td className="px-6 py-4 whitespace-nowrap text-[11px] font-black text-slate-400">{new Date(log.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4">
                           <div className="text-xs font-black text-[#003057]">{log.collaboratorName}</div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-xs font-bold text-[#003057] truncate max-w-[200px]">{log.projectName}</div>
                           <div className="text-[10px] text-slate-400 italic truncate max-w-[200px]">{log.activityType}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[8px] font-black text-slate-500 uppercase">{log.demandType}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-black text-[#003057]">{log.hours.toFixed(2)}</td>
                     </tr>
                   ))}
                   {filteredLogs.length === 0 && (
                     <tr>
                        <td colSpan={5} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Nenhum registro encontrado nos filtros</td>
                     </tr>
                   )}
                </tbody>
             </table>
             {filteredLogs.length > 100 && (
               <div className="p-6 bg-slate-50 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Exibindo os primeiros 100 registros. Use o Excel para análise completa.
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
