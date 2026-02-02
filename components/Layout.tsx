
import React from 'react';
import { useApp } from '../store';
import { UserRole } from '../types';
import { LogoCompact } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, setCurrentUser } = useApp();

  if (!currentUser) return null;

  const navItems = [
    { id: 'my-day', label: 'Meu Dia', icon: 'M', roles: [UserRole.COLLABORATOR, UserRole.COORDINATOR] },
    { id: 'history', label: 'Minhas Horas', icon: 'H', roles: [UserRole.COLLABORATOR, UserRole.COORDINATOR] },
    { id: 'team', label: 'Equipe', roles: [UserRole.COORDINATOR, UserRole.DIRECTOR], icon: 'E' },
    { id: 'reports', label: 'Administrativo', roles: [UserRole.COORDINATOR, UserRole.DIRECTOR], icon: 'A' },
  ];

  const filteredItems = navItems.filter(item => !item.roles || item.roles.includes(currentUser.role));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-[#002544] text-white flex-col sticky top-0 h-screen shadow-2xl border-r border-white/5">
        <div className="p-6 border-b border-white/5 bg-[#001b31]">
          <LogoCompact />
        </div>
        
        <nav className="flex-1 p-4 space-y-3 mt-6">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center gap-4 ${
                activeTab === item.id 
                ? 'bg-[#FFCD00] text-[#003057] shadow-lg shadow-black/20 translate-x-1 font-black' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white font-bold'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                activeTab === item.id 
                ? 'bg-[#003057] text-white shadow-inner' 
                : 'bg-white/5 text-white/40'
              }`}>
                {item.icon}
              </div>
              <span className="text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-[#001b31]">
          <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-12 rounded-2xl bg-[#FFCD00] text-[#003057] flex items-center justify-center font-black text-lg border-2 border-white/10 shadow-lg">
               {currentUser.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
               <div className="text-sm font-black truncate text-white">{currentUser.name}</div>
               <div className="text-[10px] text-[#FFCD00] font-bold uppercase tracking-widest mt-0.5 opacity-80">{currentUser.role}</div>
             </div>
          </div>
          <button 
            onClick={() => { setCurrentUser(null); setActiveTab('my-day'); }}
            className="w-full text-center py-3.5 text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-red-400/20 active:scale-95"
          >
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-[#003057] text-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-white/5 shadow-lg">
        <LogoCompact />
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentUser(null)}
            className="p-3 bg-white/10 rounded-xl text-red-400 border border-white/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {filteredItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 min-w-[70px] transition-all ${
              activeTab === item.id ? 'text-[#003057] scale-105' : 'text-slate-400'
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black ${
              activeTab === item.id ? 'bg-[#FFCD00] shadow-md text-[#003057]' : 'bg-slate-100 text-slate-400'
            }`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;
