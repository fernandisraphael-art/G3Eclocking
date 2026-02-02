import React, { useState } from 'react';
import { useApp } from '../store';
import { DEMAND_TYPES, PROJECT_PHASES, ACTIVITIES_SEED } from '../constants';

interface TimeEntryFormProps {
  editLog?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ editLog, onSuccess, onCancel }) => {
  const { currentUser, addLog, projects } = useApp();
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    data: editLog?.data || today,
    demandType: editLog?.demandType || DEMAND_TYPES[0],
    projectId: editLog?.projectId || '',
    phase: editLog?.phase || '',
    activityType: editLog?.activityType || ACTIVITIES_SEED[0],
    hours: editLog?.hours?.toString() || '',
    observation: editLog?.observation || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.data) newErrors.data = 'Data é obrigatória';
    if (!formData.projectId) newErrors.projectId = 'Projeto é obrigatório';
    if (!formData.phase) newErrors.phase = 'Fase é obrigatória';
    if (!formData.hours || isNaN(parseFloat(formData.hours)) || parseFloat(formData.hours) <= 0) {
      newErrors.hours = 'Horas deve ser um número maior que 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !currentUser) return;

    const selectedProject = projects.find(p => p.id === formData.projectId);
    const newLog = {
      collaboratorId: currentUser.id,
      collaboratorName: currentUser.name,
      date: formData.data,
      demandType: formData.demandType,
      projectId: formData.projectId,
      projectName: selectedProject?.name || '',
      phase: formData.phase,
      activityType: formData.activityType,
      hours: parseFloat(formData.hours),
      observation: formData.observation,
    };

    addLog(newLog);

    setFormData({
      data: today,
      demandType: DEMAND_TYPES[0],
      projectId: '',
      phase: '',
      activityType: ACTIVITIES_SEED[0],
      hours: '',
      observation: '',
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '32px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        maxWidth: '56rem',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#003057',
            marginBottom: '8px',
          }}>
            Novo Lançamento
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
          }}>
            Registre suas horas de trabalho
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Date and Demand Type */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px',
          }}>
            {/* Data */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '8px',
              }}>
                Data <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: errors.data ? '2px solid #dc2626' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              {errors.data && (
                <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.data}
                </p>
              )}
            </div>

            {/* Demand Type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '8px',
              }}>
                Tipo de Demanda
              </label>
              <select
                name="demandType"
                value={formData.demandType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                }}
              >
                {DEMAND_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project and Phase */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px',
          }}>
            {/* Project */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '8px',
              }}>
                Projeto <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: errors.projectId ? '2px solid #dc2626' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Selecionar projeto</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.projectId}
                </p>
              )}
            </div>

            {/* Phase */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '8px',
              }}>
                Fase <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="phase"
                value={formData.phase}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: errors.phase ? '2px solid #dc2626' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Selecionar fase</option>
                {PROJECT_PHASES.map(phase => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
              {errors.phase && (
                <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.phase}
                </p>
              )}
            </div>
          </div>

          {/* Activity Type and Hours */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px',
          }}>
            {/* Activity Type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '8px',
              }}>
                Tipo de Atividade
              </label>
              <select
                name="activityType"
                value={formData.activityType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                }}
              >
                {ACTIVITIES_SEED.map(activity => (
                  <option key={activity} value={activity}>
                    {activity}
                  </option>
                ))}
              </select>
            </div>

            {/* Hours */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '8px',
              }}>
                Horas <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="number"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                step="0.5"
                min="0.5"
                placeholder="Ex: 2.5"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: errors.hours ? '2px solid #dc2626' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              {errors.hours && (
                <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.hours}
                </p>
              )}
            </div>
          </div>

          {/* Observation */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#111827',
              marginBottom: '8px',
            }}>
              Observação
            </label>
            <textarea
              name="observation"
              value={formData.observation}
              onChange={handleChange}
              placeholder="Descreva sua atividade (opcional)"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: '#003057',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#002041';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#003057';
              }}
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeEntryForm;
