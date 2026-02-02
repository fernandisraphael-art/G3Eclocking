
import React, { useState } from 'react';
import { useApp } from '../store';

const Login: React.FC = () => {
  const { users, setCurrentUser } = useApp();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const user = users.find(u => 
        u.name.toLowerCase() === username.trim().toLowerCase()
      );

      if (user) {
        setCurrentUser(user);
      } else {
        setError('Colaborador não encontrado. Verifique se o nome está correto.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #003057 0%, #004d7a 100%)',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'black',
              color: '#003057',
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              G3Eclocking
            </h1>
            <div style={{
              height: '4px',
              width: '48px',
              background: '#FFCD00',
              margin: '12px auto',
              borderRadius: '2px'
            }} />
            <p style={{
              color: '#003057',
              fontSize: '12px',
              marginTop: '16px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              opacity: 0.6
            }}>
              Portal de Apontamento de Horas
            </p>
          </div>

          {error && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '12px',
              color: '#dc2626',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'shake 0.3s ease-in-out'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#003057',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                marginLeft: '4px',
                opacity: 0.7
              }}>
                Identificação do Colaborador
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nome Completo"
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 40px',
                    background: 'rgba(0, 48, 87, 0.05)',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#003057',
                    fontWeight: '500',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FFCD00';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 205, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px'
                }}>
                  👤
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: isLoading ? '#FFCD00' : '#003057',
                color: isLoading ? '#003057' : 'white',
                padding: '16px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(0, 48, 87, 0.2)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.8 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#FFCD00';
                  e.currentTarget.style.color = '#003057';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#003057';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '3px solid rgba(0, 48, 87, 0.3)',
                    borderTop: '3px solid #003057',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }} />
                  Entrando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>
        </div>

        <p style={{
          marginTop: '32px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          © {new Date().getFullYear()} MRS Logística S.A. - Engenharia Eletroeletrônica
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
