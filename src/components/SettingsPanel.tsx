import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, RefreshCw, Trash2, ShieldAlert, Info, CheckCircle, Building } from 'lucide-react';
import type { CompanyInfo } from '../types';

interface SettingsPanelProps {
  onResetData: () => void;
  onClearData: () => void;
  workersCount: number;
  transactionsCount: number;
  attendanceCount: number;
  companyInfo: CompanyInfo;
  onUpdateCompanyInfo: (info: CompanyInfo) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onResetData,
  onClearData,
  workersCount,
  transactionsCount,
  attendanceCount,
  companyInfo,
  onUpdateCompanyInfo,
}) => {
  const [dbSize, setDbSize] = useState('0 KB');
  const [importSuccess, setImportSuccess] = useState(false);

  // Local state for editing company info
  const [companyName, setCompanyName] = useState(companyInfo.name);
  const [companySubtitle, setCompanySubtitle] = useState(companyInfo.subtitle);
  const [companySaveSuccess, setCompanySaveSuccess] = useState(false);

  useEffect(() => {
    setCompanyName(companyInfo.name);
    setCompanySubtitle(companyInfo.subtitle);
  }, [companyInfo]);

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyInfo({
      name: companyName,
      subtitle: companySubtitle
    });
    setCompanySaveSuccess(true);
    setTimeout(() => {
      setCompanySaveSuccess(false);
    }, 2000);
  };

  // Calculate approximate LocalStorage size
  useEffect(() => {
    let totalLength = 0;
    const keys = [
      'dibersa_workers_obra',
      'dibersa_attendance_grid',
      'dibersa_financial_transactions',
      'dibersa_obras_catalogue',
      'dibersa_company_info',
      'dibersa_initialized'
    ];
    
    keys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) {
        totalLength += val.length;
      }
    });

    // LocalStorage stores UTF-16, so 2 bytes per char
    const kb = ((totalLength * 2) / 1024).toFixed(2);
    setDbSize(`${kb} KB`);
  }, [workersCount, transactionsCount, attendanceCount]);

  // Export JSON Backup
  const handleExportBackup = () => {
    const backup = {
      workers: JSON.parse(localStorage.getItem('dibersa_workers_obra') || '[]'),
      attendance: JSON.parse(localStorage.getItem('dibersa_attendance_grid') || '[]'),
      transactions: JSON.parse(localStorage.getItem('dibersa_financial_transactions') || '[]'),
      obras: JSON.parse(localStorage.getItem('dibersa_obras_catalogue') || '[]'),
      companyInfo: JSON.parse(localStorage.getItem('dibersa_company_info') || 'null'),
      initialized: localStorage.getItem('dibersa_initialized') || 'false'
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `DIBERSA_Respaldo_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.workers && parsed.attendance && parsed.transactions) {
          localStorage.setItem('dibersa_workers_obra', JSON.stringify(parsed.workers));
          localStorage.setItem('dibersa_attendance_grid', JSON.stringify(parsed.attendance));
          localStorage.setItem('dibersa_financial_transactions', JSON.stringify(parsed.transactions));
          if (parsed.obras) {
            localStorage.setItem('dibersa_obras_catalogue', JSON.stringify(parsed.obras));
          }
          if (parsed.companyInfo) {
            localStorage.setItem('dibersa_company_info', JSON.stringify(parsed.companyInfo));
          }
          localStorage.setItem('dibersa_initialized', parsed.initialized || 'true');
          setImportSuccess(true);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          alert("Error: El archivo de respaldo no contiene el formato esperado (trabajadores, asistencia o transacciones faltantes).");
        }
      } catch (err) {
        alert("Error al leer el archivo de respaldo: " + err);
      }
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
          Configuración del Sistema
        </h2>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Gestiona las copias de seguridad de las obras, finanzas y los estados de la base de datos local.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-lg)' }}>
        
        {/* Section 0: Company Information Editing */}
        <div className="card" style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Building size={16} color="var(--accent-primary)" />
            Datos de la Empresa
          </h3>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Personaliza el nombre de tu empresa y el subtítulo comercial que se muestran en el panel superior y en los reportes impresos de asistencia y finanzas.
          </div>

          <form onSubmit={handleCompanySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '500px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nombre de la Empresa:</label>
              <input
                type="text"
                className="input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                required
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Giro o Descripción de la Empresa:</label>
              <input
                type="text"
                className="input"
                value={companySubtitle}
                onChange={(e) => setCompanySubtitle(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 6px rgba(139, 92, 246, 0.2)'
                }}
                onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
              >
                Guardar Cambios
              </button>
              
              {companySaveSuccess && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
                  <CheckCircle size={14} />
                  ¡Cambios guardados con éxito!
                </span>
              )}
            </div>
          </form>
        </div>
        
        {/* Section 1: Database Administration */}
        <div className="card" style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Database size={16} color="var(--accent-primary)" />
            Administración de Base de Datos
          </h3>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Puedes restablecer el entorno de DIBERSA a los valores simulados de demostración (Semanas 24 y 25) o vaciar por completo la base de datos para comenzar tu registro real.
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {/* Load Mock Simulation Button */}
            <button
              onClick={() => {
                if (window.confirm("¿Deseas restaurar los datos simulados de demostración? Esto sobrescribirá tus cambios actuales.")) {
                  onResetData();
                }
              }}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-input)'}
            >
              <RefreshCw size={14} />
              Cargar Datos de Simulación
            </button>

            {/* Clear Database (Zero Slate) */}
            <button
              onClick={() => {
                if (window.confirm("⚠️ ¿Estás absolutamente seguro de que deseas borrar toda la información? Se eliminarán todos los colaboradores, registros de asistencia y balances financieros.")) {
                  onClearData();
                }
              }}
              style={{
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
            >
              <Trash2 size={14} />
              Limpiar Todo (Dejar en ceros)
            </button>
          </div>
        </div>

        {/* Section 2: Backup and Restore */}
        <div className="card" style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <ShieldAlert size={16} color="var(--accent-primary)" />
            Respaldos y Copias de Seguridad (JSON)
          </h3>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Exporta toda tu información actual en un archivo de texto JSON para descargarlo y conservarlo como copia de seguridad en tu computadora. Puedes restaurar ese archivo más adelante si es necesario.
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
            {/* Export Button */}
            <button
              onClick={handleExportBackup}
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(139, 92, 246, 0.2)'
              }}
              onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
            >
              <Download size={14} />
              Exportar Respaldo (.json)
            </button>

            {/* Import Button & File Input Wrapper */}
            <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
              <button
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Upload size={14} />
                Importar Respaldo
              </button>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                style={{
                  position: 'absolute',
                  fontSize: '100px',
                  opacity: 0,
                  right: 0,
                  top: 0,
                  cursor: 'pointer'
                }}
              />
            </div>

            {importSuccess && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
                <CheckCircle size={14} />
                Base de datos restaurada. Recargando...
              </span>
            )}
          </div>
        </div>

        {/* Section 3: System Stats & Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
          
          {/* Storage usage */}
          <div className="card" style={{ padding: 'var(--space-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', color: 'var(--accent-primary)', display: 'flex' }}>
              <Info size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tamaño en LocalStorage</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{dbSize}</div>
            </div>
          </div>

          {/* Workers Count */}
          <div className="card" style={{ padding: 'var(--space-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', color: 'var(--success)', display: 'flex' }}>
              <Info size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Colaboradores en Catálogo</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{workersCount} trabajadores</div>
            </div>
          </div>

          {/* Transactions Count */}
          <div className="card" style={{ padding: 'var(--space-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', color: 'var(--accent-secondary)', display: 'flex' }}>
              <Database size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Movimientos Financieros</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{transactionsCount} txs</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
