import React from "react";

interface LogListProps {
  logs?: any[];
  onEdit?: (log: any) => void;
  title?: string;
  showFilters?: boolean;
}

const LogList: React.FC<LogListProps> = ({ logs = [], onEdit, title = "Apontamentos", showFilters = true }) => {
  const getActivityColor = (activity: string) => {
    const colors: { [key: string]: string } = {
      'revisao': '#fbbf24',
      'elaboracao': '#f97316',
      'implementacao': '#10b981',
      'testes': '#3b82f6',
    };
    return colors[activity?.toLowerCase()] || '#fbbf24';
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
                  gap: '24px',
                  marginBottom: '12px'
                }}>
                  {/* Projeto */}
                  <div>
                    <p style={{
                      margin: '0 0 2px 0',
                      fontSize: '11px',
                      color: '#a0b0c0',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Projeto
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#003057'
                    }}>
                      {log.projectName || 'Sem projeto'}
                    </p>
                  </div>

                  {/* Data */}
                  <div>
                    <p style={{
                      margin: '0 0 2px 0',
                      fontSize: '11px',
                      color: '#a0b0c0',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Data
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#003057'
                    }}>
                      {log.date}
                    </p>
                  </div>
                </div>

                {/* Linha do Projeto Completo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#003057'
                  }}>
                    {log.projectName || 'Sem projeto'}
                  </p>
                  <span style={{
                    fontSize: '12px',
                    color: '#a0b0c0',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {log.phase || 'FASE: N/A'}
                  </span>
                </div>

                {/* Descrição com ponto colorido */}
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
                    "{log.description || log.activityType || 'Sem descrição'}"
                  </p>
                </div>

                {/* Atividade com Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#a0b0c0'
                  }}>
                    A
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#a0b0c0',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {log.collaboratorName || 'Abner Orra'}
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
