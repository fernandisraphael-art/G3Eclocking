import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useApp } from '../store';
import { INITIAL_USERS } from '../constants';
import './Login.css';

const Login: React.FC = () => {
  const { accounts, inProgress, instance } = useMsal();
  const { currentUser, setCurrentUser, users } = useApp();
  const [name, setName] = useState('');

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const account = accounts[0];
      const email = account.username || '';
      const displayName = account.name || 'Usuário';

      const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

      if (existingUser) {
        setCurrentUser(existingUser);
      } else {
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

  if (currentUser) return null;

  const handleEnter = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    
    // Tenta encontrar o usuário na seed data
    const foundUser = INITIAL_USERS.find(u => u.name.toLowerCase() === trimmed.toLowerCase());
    
    if (foundUser) {
      // Se encontrou, usa os dados da seed
      setCurrentUser(foundUser);
    } else {
      // Se não encontrou, cria um usuário local temporário
      const newUser = {
        id: `local-${Date.now()}`,
        name: trimmed,
        email: undefined,
        role: 'Colaborador' as any,
        active: true,
      };
      setCurrentUser(newUser);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      await instance.loginPopup({
        scopes: ['user.read'],
        redirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('Erro ao fazer login com Microsoft:', error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="brand">G3ECLOCKING</div>
          <div className="divider" />
          <div className="login-subtitle">PORTAL DE APONTAMENTO DE HORAS</div>
        </div>

        <label className="form-label">IDENTIFICAÇÃO DO COLABORADOR</label>
        <div className="input-group">
          <span className="input-icon">👤</span>
          <input
            className="text-input"
            placeholder="Nome Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleEnter(); }}
          />
        </div>

        <button className="primary-btn" onClick={handleEnter}>ENTRAR NO SISTEMA</button>

        <button className="ms-btn" onClick={handleMicrosoftLogin} disabled={inProgress !== 'none'} style={{marginTop:12}}>
          {inProgress === 'none' ? 'Entrar com Microsoft' : 'Conectando...'}
        </button>

        <div className="test-area">
          <div style={{fontSize:12, color:'rgba(255,255,255,0.55)', marginBottom:8, textAlign:'center'}}>Modo de teste (remover em produção)</div>
          <select
            className="test-select"
            onChange={(e) => {
              const user = INITIAL_USERS.find(u => u.id === e.target.value);
              if (user) setCurrentUser(user);
            }}
          >
            <option value="">Selecione um usuário de teste</option>
            {INITIAL_USERS.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>

        <div className="login-footer">© 2026 MRS LOGÍSTICA S.A. - ENGENHARIA ELETROELETRÔNICA</div>
      </div>
    </div>
  );
};

export default Login;
