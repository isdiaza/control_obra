import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import type { Worker, WeekAttendance } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: '¡Hola! Soy tu Asistente de Nómina y Asistencia de Obra. Pregúntame sobre la nómina total de la semana, asistencia por día de la semana, inasistencias en obras particulares o sueldos de trabajadores específicos de DIBERSA.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSending, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Client-side local AI parsing logic for construction payroll database
  const generateLocalResponse = (query: string): string => {
    try {
      const storedWorkers = localStorage.getItem('dibersa_workers_obra');
      const storedAttendance = localStorage.getItem('dibersa_attendance_grid');
      
      const workers: Worker[] = storedWorkers ? JSON.parse(storedWorkers) : [];
      const attendance: WeekAttendance[] = storedAttendance ? JSON.parse(storedAttendance) : [];
      
      // Determine active week (e.g. 2026-W25)
      // We will look at Week 25 primarily, but can check what is in state
      const targetWeekId = '2026-W25';

      const q = query.toLowerCase();

      const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 2
        }).format(val);
      };

      // Helper to calculate weekly pay details for the active week
      const getCalculatedRows = () => {
        return workers.map(w => {
          let att = attendance.find(a => a.workerId === w.id && a.weekId === targetWeekId);
          if (!att) {
            att = {
              workerId: w.id,
              weekId: targetWeekId,
              lunes: false,
              martes: false,
              miercoles: false,
              jueves: false,
              viernes: false,
              sabado: false,
            };
          }
          let days = 0;
          if (att.lunes) days++;
          if (att.martes) days++;
          if (att.miercoles) days++;
          if (att.jueves) days++;
          if (att.viernes) days++;
          if (att.sabado) days++;
          return { worker: w, attendance: att, days, pay: days * w.sueldoDiario };
        });
      };

      // 1. Weekly Payroll query ("nómina", "cuánto se gastará", "pago total")
      if (q.includes('nomina') || q.includes('nómina') || q.includes('pago total') || q.includes('total de pago') || q.includes('costo total')) {
        const rows = getCalculatedRows();
        
        // Check if query specifies a specific obra
        let filteredRows = rows;
        let obraFilter = 'Todas las Obras';
        
        if (q.includes('torre alfa')) {
          filteredRows = rows.filter(r => r.worker.obra === 'Torre Alfa');
          obraFilter = 'Torre Alfa';
        } else if (q.includes('plaza central')) {
          filteredRows = rows.filter(r => r.worker.obra === 'Plaza Central');
          obraFilter = 'Plaza Central';
        } else if (q.includes('campestre') || q.includes('residencial')) {
          filteredRows = rows.filter(r => r.worker.obra === 'Residencial Campestre');
          obraFilter = 'Residencial Campestre';
        }

        const totalCost = filteredRows.reduce((sum, r) => sum + r.pay, 0);
        const totalDays = filteredRows.reduce((sum, r) => sum + r.days, 0);
        const workersCount = filteredRows.length;

        return `💰 **Resumen de Nómina (${obraFilter}) - Semana Actual**:\n\n` +
               `• **Total a Pagar:** ${formatCurrency(totalCost)} MXN\n` +
               `• **Trabajadores Activos:** ${workersCount}\n` +
               `• **Jornadas Totales Asistidas:** ${totalDays} días asistidos en total.\n\n` +
               `*Nota: Esto se calcula multiplicando los días marcados con asistencia en la planilla semanal por el sueldo diario de cada trabajador asignado a esta obra.*`;
      }

      // 2. Absences on a given day ("quién faltó el martes", "faltas de ayer", "asistencias del lunes")
      if (q.includes('falta') || q.includes('faltó') || q.includes('no vino') || q.includes('no asistio') || q.includes('no asistió')) {
        const daysMap: Record<string, 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado'> = {
          lunes: 'lunes',
          martes: 'martes',
          miercoles: 'miercoles',
          miércoles: 'miercoles',
          jueves: 'jueves',
          viernes: 'viernes',
          sabado: 'sabado',
          sábado: 'sabado',
        };

        let targetDay: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | null = null;
        for (const [key, value] of Object.entries(daysMap)) {
          if (q.includes(key)) {
            targetDay = value;
            break;
          }
        }

        if (!targetDay) {
          return '¿Sobre qué día de la semana deseas consultar las inasistencias? (Ejemplo: "quién faltó el lunes" o "inasistencias del martes").';
        }

        const rows = getCalculatedRows();
        const absents = rows.filter(r => !r.attendance[targetDay as keyof WeekAttendance]);

        if (absents.length === 0) {
          return `¡Asistencia excelente! El día **${targetDay}** asistieron todos los trabajadores registrados en las obras.`;
        }

        const listStr = absents.map(r => `• **${r.worker.name}** (Obra: ${r.worker.obra}, Puesto: ${r.worker.role})`).join('\n');
        return `❌ **Inasistencias registradas el ${targetDay.toUpperCase()}**:\n\n${listStr}`;
      }

      // 3. Info about a specific worker ("sueldo de israel", "cuánto se le paga a carlos")
      for (const w of workers) {
        const firstName = w.name.split(' ')[0].toLowerCase();
        const lastName = w.name.split(' ').slice(1).join(' ').toLowerCase();
        if (q.includes(firstName) || (lastName && q.includes(lastName))) {
          const rows = getCalculatedRows();
          const target = rows.find(r => r.worker.id === w.id);
          if (target) {
            return `👷 **Ficha del Trabajador: ${w.name}**\n\n` +
                   `• **Puesto / Oficio:** ${w.role}\n` +
                   `• **Obra Asignada:** ${w.obra}\n` +
                   `• **Sueldo Diario:** ${formatCurrency(w.sueldoDiario)} MXN/día\n` +
                   `• **Días Asistidos esta Semana:** ${target.days} / 6 días\n` +
                   `• **Nómina de esta Semana:** **${formatCurrency(target.pay)} MXN**\n` +
                   `• **Nómina Potencial Completa (6 días):** ${formatCurrency(w.sueldoDiario * 6)} MXN`;
          }
        }
      }

      // 4. Construction site overview ("torre alfa", "plaza central", "campestre")
      const sites = ['torre alfa', 'plaza central', 'residencial campestre', 'campestre'];
      let foundSite = '';
      for (const s of sites) {
        if (q.includes(s)) {
          foundSite = s === 'campestre' ? 'Residencial Campestre' : s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          break;
        }
      }

      if (foundSite) {
        // Obra statistics
        const siteWorkers = workers.filter(w => w.obra === foundSite);
        const rows = getCalculatedRows().filter(r => r.worker.obra === foundSite);
        const sitePayroll = rows.reduce((sum, r) => sum + r.pay, 0);
        const siteDaysAttended = rows.reduce((sum, r) => sum + r.days, 0);
        const totalDaysPossible = siteWorkers.length * 6;
        const siteAttendanceRate = totalDaysPossible > 0 ? Math.round((siteDaysAttended / totalDaysPossible) * 100) : 100;

        const workersList = siteWorkers.map(w => `• **${w.name}** (${w.role}, Sueldo: ${formatCurrency(w.sueldoDiario)}/día)`).join('\n');

        return `🏗️ **Ficha de Obra: ${foundSite}**\n\n` +
               `• **Personal Asignado:** ${siteWorkers.length} trabajadores\n` +
               `• **Costo de Nómina Semanal:** **${formatCurrency(sitePayroll)} MXN**\n` +
               `• **Índice de Asistencia:** ${siteAttendanceRate}%\n\n` +
               `**Lista de Personal:**\n${workersList}`;
      }

      // 5. General summary / overview ("resumen", "estadisticas", "asistencia promedio")
      if (q.includes('resumen') || q.includes('estadisticas') || q.includes('estadísticas') || q.includes('general') || q.includes('como vamos') || q.includes('cómo vamos')) {
        const rows = getCalculatedRows();
        const totalPayroll = rows.reduce((sum, r) => sum + r.pay, 0);
        const totalDays = rows.reduce((sum, r) => sum + r.days, 0);
        const totalPossible = workers.length * 6;
        const avgAttendance = totalPossible > 0 ? Math.round((totalDays / totalPossible) * 100) : 100;

        return `📊 **Resumen General de Obras y Nómina - DIBERSA**:\n\n` +
               `• **Total Trabajadores:** ${workers.length}\n` +
               `• **Obras Activas:** ${Array.from(new Set(workers.map(w => w.obra))).length}\n` +
               `• **Nómina Semanal Acumulada (Global):** **${formatCurrency(totalPayroll)} MXN**\n` +
               `• **Tasa de Asistencia de la Semana:** ${avgAttendance}%\n\n` +
               `*Puedes ver el detalle individual y checar asistencia en la pestaña **Planilla de Obra**.*`;
      }

      // Default helper message listing what you can ask
      return `Hola, soy tu asistente de nóminas de obra. Puedes hacerme preguntas como:\n\n` +
             `• *¿Cuánto se pagará de nómina en la obra Torre Alfa?*\n` +
             `• *¿Quién faltó el martes?*\n` +
             `• *¿Cuánto es el sueldo de Sofía Gómez esta semana?*\n` +
             `• *Dame un resumen general de la asistencia*\n` +
             `• *Muéstrame la información de la obra Plaza Central*`;

    } catch (e) {
      console.error(e);
      return 'Disculpa, ocurrió un error al consultar la base de datos de trabajadores y asistencia.';
    }
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isSending) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    // Simulate AI thinking and reply in 600ms
    setTimeout(() => {
      const replyText = generateLocalResponse(text);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: replyText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsSending(false);
      
      // Focus input
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 10);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="chat-widget-trigger no-print"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-primary)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)'}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="card animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '6rem',
            right: '2rem',
            width: 'calc(100vw - 4rem)',
            maxWidth: '420px',
            height: '65vh',
            maxHeight: '700px',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            zIndex: 9998,
            boxShadow: 'var(--shadow-lg), 0 0 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: 'var(--space-md) var(--space-lg)',
            backgroundColor: 'var(--bg-input)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ backgroundColor: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '50%', display: 'flex', color: 'white' }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>Asistente IA de Nóminas</h3>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cálculo y reportes de obra DIBERSA</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: 'rgba(0,0,0,0.1)'
          }}>
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isSystem = msg.role === 'system';
              
              if (isSystem) {
                return (
                  <div key={msg.id} style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger)', backgroundColor: 'var(--danger-bg)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)' }}>
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <div style={{ 
                    width: '28px', height: '28px', borderRadius: '50%', 
                    backgroundColor: isUser ? 'var(--bg-input)' : 'var(--accent-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', flexShrink: 0
                  }}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div style={{
                    maxWidth: '85%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    borderBottomRightRadius: isUser ? '0' : 'var(--radius-lg)',
                    borderBottomLeftRadius: !isUser ? '0' : 'var(--radius-lg)',
                    backgroundColor: isUser ? 'var(--accent-primary)' : 'var(--bg-input)',
                    color: isUser ? 'white' : 'var(--text-primary)',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-line'
                  }}>
                    {msg.text}
                    <div style={{ 
                      fontSize: '0.65rem', 
                      marginTop: '0.4rem', 
                      textAlign: isUser ? 'right' : 'left',
                      color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'
                    }}>
                      {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isSending && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ 
                  width: '28px', height: '28px', borderRadius: '50%', 
                  backgroundColor: 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', flexShrink: 0
                }}>
                  <Bot size={16} />
                </div>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  borderBottomLeftRadius: '0',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
                  Analizando datos...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: 'var(--space-md)',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-end'
          }}>
            <textarea
              ref={inputRef}
              className="input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              placeholder="Pregunta sobre nómina u obras..."
              style={{
                flex: 1,
                minHeight: '44px',
                maxHeight: '120px',
                resize: 'none',
                padding: '0.75rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)'
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={isSending || !inputValue.trim()}
              style={{
                backgroundColor: (isSending || !inputValue.trim()) ? 'var(--bg-input)' : 'var(--accent-primary)',
                color: (isSending || !inputValue.trim()) ? 'var(--text-muted)' : 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (isSending || !inputValue.trim()) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                flexShrink: 0
              }}
            >
              <Send size={18} style={{ transform: 'translateX(2px)' }} />
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile styles override */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .card.animate-fade-in {
            bottom: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            height: 85vh !important;
            max-width: none !important;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
          }
        }
      `}</style>
    </>
  );
};
