import React, { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useApp } from '../store';
import { INITIAL_USERS } from '../constants';

const Login: React.FC = () => {
  const { accounts, inProgress } = useMsal();
  const { currentUser, setCurrentUser, users } = useApp();

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const account = accounts[0];
      const email = account.username || '';
      const displayName = account.name || 'Usuário';

      // Tenta encontrar o usuário no sistema pelo email
      const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

      if (existingUser) {
        setCurrentUser(existingUser);
      } else {
        // Se não encontrar, cria um novo usuário com dados do Microsoft
        const newUser = {
          id: account.localAccountId || `ms-${Date.now()}`,
          name: displayName,
          email: email,
          role: 'Colaborador' as any,
          active: true,
        };
        setCurrentUser(newUser);
      }
    }
  }, [accounts]);

  // Se já está autenticado, mostra loading
  if (currentUser) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #003057 0%, #0047a3 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '400px',
        width: '100%',
      }}>
        {/* Logo */}
        <div style={{
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}>
            ⏱️
          </div>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#003057',
          }}>
            G3Eclocking
          </h1>
          <p style={{
            margin: '0 0 24px 0',
            color: '#6b7280',
            fontSize: '13px',
          }}>
            Gestão de Horas - MRS Logística
          </p>
        </div>

        {/* Informações */}
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '13px',
          color: '#0369a1',
          lineHeight: '1.6',
        }}>
          <strong>🔐 Autenticação via Microsoft</strong><br/>
          Use sua conta Office 365 da MRS Logística para acessar o sistema.
        </div>

        {/* Botão Microsoft Login */}
        <button
          disabled={inProgress !== 'none'}
          style={{
            width: '100%',
            padding: '12px 24px',
            backgroundColor: '#0078d4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: inProgress !== 'none' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: inProgress !== 'none' ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (inProgress === 'none') {
              e.currentTarget.style.backgroundColor = '#106ebe';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0078d4';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: '18px' }}>🔐</span>
          {inProgress === 'none' ? 'Entrar com Microsoft' : 'Conectando...'}
        </button>

        {/* Nota sobre configuração */}
        <div style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#92400e',
          border: '1px solid #fcd34d',
        }}>
          <strong>⚙️ Configuração necessária:</strong><br/>
          Para usar este login, você precisa configurar uma aplicação no Azure AD. Veja o arquivo <code style={{backgroundColor: '#fff', padding: '2px 6px', borderRadius: '4px'}}>config/authConfig.ts</code> para instruções.
        </div>

        {/* Teste Local - Remover em Produção */}
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb',
        }}>
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
          }}>
            Modo de teste (remover em produção)
          </p>
          <select
            onChange={(e) => {
              const user = INITIAL_USERS.find(u => u.id === e.target.value);
              if (user) {
                setCurrentUser(user);
              }
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '13px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontFamily: 'inherit',
              backgroundColor: 'white',
              boxSizing: 'border-box',
              color: '#6b7280',
            }}
          >
            <option value="">Selecione um usuário de teste</option>
            {INITIAL_USERS.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Login;
