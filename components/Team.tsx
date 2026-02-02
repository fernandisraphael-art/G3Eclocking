import React, { useState } from 'react';
import { useApp } from '../store';
import { UserRole } from '../types';

const Team: React.FC = () => {
  const { users, currentUser, logs } = useApp();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const today = new Date().toISOString().split('T')[0];

  const userHasSubmittedToday = (userId: string) => {
    return logs.some(log => log.collaboratorId === userId && log.date === today);
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const sendReminder = () => {
    const emailsToSend = Array.from(selectedUsers)
      .map(userId => {
        const user = users.find(u => u.id === userId);
        return user?.email;
      })
      .filter(Boolean);

    if (emailsToSend.length === 0) {
      alert('Nenhum usuário selecionado');
      return;
    }

    // Simular envio de email
    console.log('Enviando lembretes para:', emailsToSend);
    alert(`Lembretes enviados para:\n${emailsToSend.join('\n')}`);
    setSelectedUsers(new Set());
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#003057'
        }}>
          Equipe GEEE
        </h1>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '14px'
        }}>
          Gerenciar colaboradores e enviar lembretes
        </p>
      </div>

      {/* Tabela de Colaboradores */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{
                padding: '16px 20px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#a0b0c0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                width: '40px'
              }}>
                <input
                  type="checkbox"
                  checked={selectedUsers.size === users.length}
                  onChange={() => {
                    if (selectedUsers.size === users.length) {
                      setSelectedUsers(new Set());
                    } else {
                      setSelectedUsers(new Set(users.map(u => u.id)));
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    width: '18px',
                    height: '18px',
                    accentColor: '#003057'
                  }}
                />
              </th>
              <th style={{
                padding: '16px 20px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#a0b0c0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Nome
              </th>
              <th style={{
                padding: '16px 20px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#a0b0c0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Email
              </th>
              <th style={{
                padding: '16px 20px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#a0b0c0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Função
              </th>
              <th style={{
                padding: '16px 20px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '600',
                color: '#a0b0c0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Status
              </th>
              <th style={{
                padding: '16px 20px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '600',
                color: '#a0b0c0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Enviou Hoje
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const submitted = userHasSubmittedToday(user.id);
              const roleLabel = user.role === UserRole.DIRECTOR ? 'Diretor' : 
                               user.role === UserRole.COORDINATOR ? 'Coordenador' : 'Colaborador';

              return (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: index < users.length - 1 ? '1px solid #e5e7eb' : 'none',
                    backgroundColor: selectedUsers.has(user.id) ? '#f0f9ff' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      style={{
                        cursor: 'pointer',
                        width: '18px',
                        height: '18px',
                        accentColor: '#003057'
                      }}
                    />
                  </td>
                  <td style={{
                    padding: '16px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827'
                  }}>
                    {user.name}
                  </td>
                  <td style={{
                    padding: '16px 20px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {user.email || '-'}
                  </td>
                  <td style={{
                    padding: '16px 20px',
                    fontSize: '13px',
                    color: '#6b7280'
                  }}>
                    {roleLabel}
                  </td>
                  <td style={{
                    padding: '16px 20px',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: user.active ? '#dcfce7' : '#fee2e2',
                      color: user.active ? '#166534' : '#991b1b'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: user.active ? '#22c55e' : '#ef4444'
                      }} />
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{
                    padding: '16px 20px',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: submitted ? '#dcfce7' : '#fef3c7',
                      color: submitted ? '#166534' : '#92400e'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: submitted ? '#22c55e' : '#f59e0b'
                      }} />
                      {submitted ? 'Sim' : 'Não'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Botão de Enviar Lembretes */}
      {selectedUsers.size > 0 && (
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => setSelectedUsers(new Set())}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            Limpar Seleção
          </button>
          <button
            onClick={sendReminder}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'white',
              backgroundColor: '#003057',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#002041';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#003057';
            }}
          >
            📧 Enviar Lembrete ({selectedUsers.size})
          </button>
        </div>
      )}

      {/* Info sobre não preenchidos */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#fef3c7',
        border: '1px solid #fcd34d',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#92400e'
      }}>
        <strong>💡 Dica:</strong> Use os checkboxes para selecionar colaboradores que não preencheram as horas hoje e envie um lembrete automático por email.
      </div>
    </div>
  );
};

export default Team;
