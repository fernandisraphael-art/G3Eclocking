import React from "react";

interface LogListProps {
  logs?: any[];
  onEdit?: (log: any) => void;
  onDelete?: (logId: string) => void;
  title?: string;
  showFilters?: boolean;
}

const LogList: React.FC<LogListProps> = ({ logs = [], onEdit, onDelete, title = "Apontamentos", showFilters = true }) => {
  const getActivityColor = (activity: string) => {
    const colors: { [key: string]: string } = {
      'revisao': '#fbbf24',
      'elaboracao': '#f97316',
      'implementacao': '#10b981',
      'testes': '#3b82f6',
    };
    return colors[activity?.toLowerCase()] || '#fbbf24';
  };

  const formatDateBR = (dateValue?: string) => {
    if (!dateValue) return '-';
    const parts = dateValue.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateValue;
  };

  return (
    <div>
      {title && (
        <h2 style={{
          margin: '0 0 24px 0',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#003057',
          letterSpacing: '0.5px'
        }}>
          {title}
        </h2>
      )}

      {logs.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#999',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Nenhum apontamento encontrado
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {logs.map((log: any) => (
            <div
              key={log.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Horas à esquerda */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '80px'
              }}>
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#003057'
                }}>
                  {log.hours?.toFixed(2) || '0.00'}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '11px',
                  color: '#a0b0c0',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Horas
                </p>
              </div>

              {/* Divisor */}
              <div style={{
                width: '1px',
                backgroundColor: '#e5e7eb',
                minHeight: '80px'
              }} />

              {/* Conteúdo Principal */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#003057'
                  }}>
                    {log.projectName || 'Sem projeto'}
                  </p>
                  <span style={{
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: '600'
                  }}>
                    {formatDateBR(log.date)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    color: '#334155',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    fontWeight: '600'
                  }}>
                    Fase: {log.phase || 'N/A'}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: '#334155',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    fontWeight: '600'
                  }}>
                    Demanda: {log.demandType || 'N/A'}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: '#334155',
                    backgroundColor: '#f8fafc',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    fontWeight: '600'
                  }}>
                    Atividade: {log.activityType || 'N/A'}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getActivityColor(log.activityType)
                  }} />
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#64748b',
                    fontWeight: '500'
                  }}>
                    "{log.observation || log.description || 'Sem observação'}"
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '4px'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#94a3b8',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {log.collaboratorName || 'Usuário'}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                minWidth: 'fit-content'
              }}>
                {onEdit && (
                  <button
                    onClick={() => onEdit(log)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      color: '#a0b0c0',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#003057';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#a0b0c0';
                    }}
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={() => onDelete?.(log.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    color: '#ff6b6b',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ff2a2a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#ff6b6b';
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogList;
