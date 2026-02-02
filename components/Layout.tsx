
import React from 'react';
import { useApp } from '../store';
import { UserRole } from '../types';

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'row',
      background: '#f8fafc'
    }}>
      {/* Sidebar - Desktop */}
      <aside style={{
        width: '254px',
        backgroundColor: '#003057',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundColor: '#001b2e'
        }}>
          <h2 style={{
            margin: '0',
            fontSize: '16px',
            fontWeight: 'black',
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            G3Eclocking
          </h2>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '10px',
            color: '#FFCD00',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            MRS Logística
          </p>
        </div>
        
        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginTop: '24px'
        }}>
          {filteredItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? '#FFCD00' : 'transparent',
                  color: isActive ? '#003057' : '#a0b0c0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s ease',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#a0b0c0';
                  }
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'black',
                  background: isActive ? '#003057' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? 'white' : 'rgba(255, 255, 255, 0.3)'
                }}>
                  {item.icon}
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundColor: '#001b2e'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#FFCD00',
              color: '#003057',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'black',
              fontSize: '18px',
              flexShrink: 0
            }}>
              {currentUser.name.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 'black',
                color: 'white',
                margin: '0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentUser.name}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#FFCD00',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '2px'
              }}>
                {currentUser.role}
              </div>
            </div>
          </div>
          <button 
            onClick={() => { setCurrentUser(null); setActiveTab('my-day'); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#ff6b6b',
              background: 'transparent',
              border: '1px solid #ff6b6b',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '32px',
        maxWidth: '1600px',
        width: '100%',
        overflowX: 'hidden'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
