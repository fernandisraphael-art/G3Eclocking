import React, { useState } from 'react';
import { useApp } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard: React.FC = () => {
  const { logs, projects, users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const totalHours = logs.reduce((acc, l) => acc + l.hours, 0);

  // Project Chart Data
  const projectDataMap = logs.reduce((acc: any, log) => {
    acc[log.projectId] = (acc[log.projectId] || 0) + log.hours;
    return acc;
  }, {});
  const projectChartData = Object.entries(projectDataMap)
    .map(([name, hours]) => ({ name, hours: hours as number }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 10);

  // Demand Chart Data
  const demandDataMap = logs.reduce((acc: any, log) => {
    acc[log.activityType] = (acc[log.activityType] || 0) + log.hours;
    return acc;
  }, {});
  const demandChartData = Object.entries(demandDataMap).map(([name, value]) => ({ name, value: value as number }));

  // Collaborator Summary
  const collabDataMap = logs.reduce((acc: any, log) => {
    acc[log.collaboratorName] = (acc[log.collaboratorName] || 0) + log.hours;
    return acc;
  }, {});
  const collabSummary = Object.entries(collabDataMap)
    .map(([name, hours]) => ({ name, hours: hours as number }))
    .sort((a, b) => b.hours - a.hours);

  const filteredLogs = logs.filter(l =>
    l.collaboratorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.activityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ['#003057', '#FFCD00', '#0058a3', '#ffd940', '#001b31', '#d9af00'];

  const exportCSV = () => {
    const headers = 'Colaborador,Data,Projeto,Fase,Atividade,Horas,Descrição\n';
    const rows = logs.map(l => `${l.collaboratorName},${l.date},${l.projectId},${l.phase},${l.activityType},${l.hours},"${l.description}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `consolidado_geee_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        background: 'white',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#003057',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFCD00',
            boxShadow: '0 4px 12px rgba(0, 48, 87, 0.2)',
            fontSize: '32px'
          }}>
            📊
          </div>
          <div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'black',
              color: '#003057',
              margin: '0 0 4px 0',
              letterSpacing: '-0.5px'
            }}>
              Administrativo
            </h2>
            <p style={{
              fontSize: '12px',
              color: '#a0b0c0',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0'
            }}>
              Consolidação e Gestão GEEE
            </p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          style={{
            background: '#FFCD00',
            color: '#003057',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 12px rgba(255, 205, 0, 0.2)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ffe052';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFCD00';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ⬇️ BAIXAR LANÇAMENTOS (CSV)
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: '#003057',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0, 48, 87, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 12px 0'
          }}>
            Total de Horas Consolidadas
          </p>
          <p style={{
            fontSize: '48px',
            fontWeight: 'black',
            color: '#FFCD00',
            margin: '0 0 12px 0'
          }}>
            {totalHours.toFixed(1)}
          </p>
          <p style={{
            fontSize: '9px',
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0'
          }}>
            Base de dados completa
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#a0b0c0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 12px 0'
          }}>
            Projetos Monitorados
          </p>
          <p style={{
            fontSize: '48px',
            fontWeight: 'black',
            color: '#003057',
            margin: '0'
          }}>
            {projects.filter(p => p.status === 'ativo').length}
          </p>
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#a0b0c0',
            textTransform: 'uppercase'
          }}>
            <span>Em Execução</span>
            <span style={{ color: '#003057' }}>{projects.length} Total</span>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#a0b0c0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 12px 0'
          }}>
            Equipe Ativa
          </p>
          <p style={{
            fontSize: '48px',
            fontWeight: 'black',
            color: '#003057',
            margin: '0'
          }}>
            {collabSummary.length}
          </p>
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#a0b0c0',
            textTransform: 'uppercase'
          }}>
            <span>Com Lançamentos</span>
            <span style={{ color: '#003057' }}>{users.length} Colaboradores</span>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#a0b0c0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 16px 0'
          }}>
            Eficiência Projeto vs Rotina
          </p>
          <div style={{
            width: '100%',
            height: '12px',
            background: '#e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: '#003057',
              borderRadius: '8px'
            }} />
          </div>
          <div style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '9px',
              fontWeight: 'bold',
              color: '#003057',
              textTransform: 'uppercase'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: '#003057'
              }} />
              Engenharia
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '9px',
              fontWeight: 'bold',
              color: '#a0b0c0',
              textTransform: 'uppercase'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: '#FFCD00'
              }} />
              Apoio/Geral
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 'black',
              color: '#003057',
              margin: '0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Horas por Projeto (Top 10)
            </h3>
            <span style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#a0b0c0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Acumulado
            </span>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectChartData} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="hours" fill="#003057" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 'black',
              color: '#003057',
              margin: '0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Mix de Categoria
            </h3>
            <span style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#a0b0c0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Distribuição %
            </span>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demandChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={4}
                >
                  {demandChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ranking and Table */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb',
        marginBottom: '32px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 'black',
            color: '#003057',
            margin: '0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Ranking de Produtividade
          </h3>
          <div style={{
            padding: '8px 16px',
            background: '#f8fafc',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#a0b0c0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Total: {users.length} Colaboradores
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px'
          }}>
            <thead>
              <tr style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#a0b0c0',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Colaborador
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: '#a0b0c0',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Horas Totais
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: '#a0b0c0',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Diferencial/Período
                </th>
              </tr>
            </thead>
            <tbody>
              {collabSummary.map((collab, idx) => {
                const daysWorked = new Set(logs.filter(l => l.collaboratorName === collab.name).map(l => l.date)).size;
                const avgPerDay = (collab.hours / Math.max(1, daysWorked)).toFixed(1);
                return (
                  <tr key={idx} style={{
                    borderBottom: '1px solid #e5e7eb',
                    background: idx % 2 === 0 ? 'white' : '#f8fafc',
                    transition: 'background 0.2s ease'
                  }}>
                    <td style={{
                      padding: '12px 16px',
                      color: '#003057',
                      fontWeight: '600'
                    }}>
                      <span style={{
                        marginRight: '12px',
                        color: '#a0b0c0',
                        fontFamily: 'monospace',
                        fontSize: '11px'
                      }}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      {collab.name}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      color: '#003057',
                      fontWeight: '600'
                    }}>
                      {collab.hours.toFixed(2)}h
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      textAlign: 'right'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        background: '#f0fdf4',
                        color: '#16a34a',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {avgPerDay}h avg/dia
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consolidation Table */}
      <div style={{
        background: '#003057',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0, 48, 87, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 'black',
              color: 'white',
              margin: '0 0 4px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Histórico Geral Consolidado
            </h3>
            <p style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: 'rgba(255, 255, 255, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0'
            }}>
              Base Auditável completa
            </p>
          </div>
          <input
            type="text"
            placeholder="Filtrar por nome, projeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px',
              outline: 'none',
              width: '280px',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.borderColor = '#FFCD00';
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Data
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Colaborador
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Projeto / Atividade
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Tipo
                </th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Horas
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.slice(0, 100).map((log, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    borderLeft: '4px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderLeftColor = '#FFCD00';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderLeftColor = 'transparent';
                    e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent';
                  }}
                >
                  <td style={{
                    padding: '12px 16px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {new Date(log.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{
                    padding: '12px 16px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {log.collaboratorName}
                  </td>
                  <td style={{
                    padding: '12px 16px',
                    color: 'white'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '2px'
                    }}>
                      {log.projectId}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontStyle: 'italic'
                    }}>
                      {log.activityType}
                    </div>
                  </td>
                  <td style={{
                    padding: '12px 16px',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      padding: '4px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      color: 'rgba(255, 255, 255, 0.7)',
                      textTransform: 'uppercase'
                    }}>
                      Projeto
                    </span>
                  </td>
                  <td style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    color: '#FFCD00',
                    fontWeight: 'bold'
                  }}>
                    {log.hours.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length > 100 && (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '16px'
          }}>
            Exibindo os primeiros 100 registros. Use o Excel para análise completa.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
