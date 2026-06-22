import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Eye, FileText, Camera, X, Printer, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { useReportHistory } from '../hooks/useReportHistory';
import type { SavedReport } from '../hooks/useReportHistory';
import { Phone, Mail, MapPin } from 'lucide-react';

const ReportViewer: React.FC<{ report: SavedReport; onClose: () => void }> = ({ report, onClose }) => {
  const chunkSize = 8;
  const photoChunks: { id: string; url: string }[][] = [];
  for (let i = 0; i < report.photos.length; i += chunkSize) {
    photoChunks.push(report.photos.slice(i, i + chunkSize));
  }
  if (photoChunks.length === 0) photoChunks.push([]);
  return (
    <div className="report-viewer-overlay">
      <div className="no-print" style={{ position: 'sticky', top: 0, width: '215.9mm', maxWidth: '95vw', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px', zIndex: 10000 }}>
        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#2D3192', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
          <Printer size={15} /> Imprimir / PDF
        </button>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
          <X size={15} /> Cerrar
        </button>
      </div>
      {photoChunks.map((chunk, pageIndex) => {
        const rowCount = Math.ceil(chunkSize / 2);
        return (
          <div key={pageIndex} className="print-page" style={{ width: '215.9mm', maxWidth: '95vw', backgroundColor: 'white', marginBottom: '24px', display: 'flex', flexDirection: 'column', height: '279.4mm', minHeight: '279.4mm', pageBreakAfter: 'always', fontFamily: 'Arial, sans-serif', boxShadow: '0 4px 32px rgba(0,0,0,0.4)', overflow: 'hidden', position: 'relative', boxSizing: 'border-box' }}>
            <div style={{ padding: '0 20px', boxSizing: 'border-box' }}>
              <div style={{ height: '8px', borderTop: '4px solid #FBB03B', borderLeft: '4px solid #FBB03B', borderRight: '4px solid #FBB03B' }}></div>
              <div style={{ display: 'flex', height: '110px', width: '100%', padding: '0 15px', boxSizing: 'border-box', alignItems: 'flex-start' }}>
                <div style={{ width: '30%', height: '70px', backgroundColor: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginTop: '2px' }}>
                  <h1 style={{ margin: 0, fontSize: '30px', fontWeight: 300, letterSpacing: '7px', fontFamily: '"Century Gothic", Arial, sans-serif' }}>{report.companyName}</h1>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '38px', color: '#57534E', fontWeight: 900, letterSpacing: '1px', fontFamily: 'Impact, sans-serif', whiteSpace: 'nowrap' }}>{report.projectName}</h2>
                </div>
                <div style={{ width: '28%', height: '86px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ backgroundColor: '#2D3192', color: 'white', flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px' }}>CONSTRUCCION</span>
                  </div>
                  <div style={{ backgroundColor: '#5B5EA6', color: 'white', flex: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1px' }}>ESTATUS ACTUAL</span>
                  </div>
                  <div style={{ backgroundColor: '#FFF0F0', flex: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#DC2626' }}>REPORTE FOTOGRAFICO</span>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: '#DC2626', marginTop: '2px' }}>{report.reportDate}</span>
                  </div>
                </div>
              </div>
              <div style={{ height: '8px', borderBottom: '4px solid #FBB03B', borderLeft: '4px solid #FBB03B', borderRight: '4px solid #FBB03B' }}></div>
              <div style={{ width: '100%', height: '4px', backgroundColor: '#2D3192' }}></div>
              <div style={{ width: '100%', height: '3px', backgroundColor: 'white' }}></div>
              <div style={{ width: '100%', backgroundColor: '#FBB03B', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ backgroundColor: '#000000', color: 'white', height: '100%', padding: '0 40px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px' }}>{report.areaName}</span>
                </div>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: '#2D3192' }}></div>
            </div>
            <div style={{ flex: 1, minHeight: 0, padding: '8px 20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', gap: '6px', overflow: 'hidden' }}>
              {Array.from({ length: rowCount }).map((_, rowIndex) => {
                const lp = chunk[rowIndex * 2];
                const rp = chunk[rowIndex * 2 + 1];
                return (
                  <div key={rowIndex} style={{ display: 'flex', flex: 1, alignItems: 'stretch', minHeight: 0, overflow: 'hidden' }}>
                    <div style={{ width: '5px', backgroundColor: '#FBB03B', flexShrink: 0 }}></div>
                    {lp ? (
                      <div className="photo-cell" style={{ flex: 1, position: 'relative', height: '100%', boxSizing: 'border-box' }}>
                        <img src={lp.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    ) : (
                      <div className="photo-cell empty" style={{ flex: 1, height: '100%', boxSizing: 'border-box' }}></div>
                    )}
                    <div style={{ width: '6px', flexShrink: 0 }}></div>
                    {rp ? (
                      <div className="photo-cell" style={{ flex: 1, position: 'relative', height: '100%', boxSizing: 'border-box' }}>
                        <img src={rp.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    ) : (
                      <div className="photo-cell empty" style={{ flex: 1, height: '100%', boxSizing: 'border-box' }}></div>
                    )}
                    <div style={{ width: '5px', backgroundColor: '#FBB03B', flexShrink: 0 }}></div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '4px 20px 12px 20px' }}>
              <div style={{ width: '100%', height: '1px', backgroundColor: '#9CA3AF', marginBottom: '3px' }}></div>
              <div style={{ textAlign: 'center', fontSize: '8px', color: '#6B7280', marginBottom: '3px' }}>Pagina {pageIndex + 1} de {photoChunks.length}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#374151' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 16px' }}><Phone size={10} /><span>{report.phone}</span></div>
                <div style={{ width: '1px', height: '12px', backgroundColor: '#9CA3AF' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 16px' }}><Mail size={10} /><span>{report.email}</span></div>
                <div style={{ width: '1px', height: '12px', backgroundColor: '#9CA3AF' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 16px' }}><MapPin size={10} /><span>{report.address}</span></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ReportCard: React.FC<{ report: SavedReport; onView: () => void; onDelete: () => void }> = ({ report, onView, onDelete }) => {
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-MX', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', backgroundColor: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Camera size={18} color="white" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{report.areaName}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {report.photoCount} foto{report.photoCount !== 1 ? 's' : ''} &middot; {fmtDate(report.savedAt)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <button onClick={onView} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '7px', padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
          <Eye size={13} /> Ver
        </button>
        <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '7px', padding: '6px 10px', cursor: 'pointer' }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

const ObraGroup: React.FC<{ projectName: string; reports: SavedReport[]; onView: (r: SavedReport) => void; onDelete: (id: string) => void }> = ({ projectName, reports, onView, onDelete }) => {
  const [open, setOpen] = useState(true);
  const sorted = [...reports].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <Building2 size={20} color="var(--accent-primary)" />
        <span style={{ flex: 1, fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{projectName}</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: '8px' }}>{sorted.length} reporte{sorted.length !== 1 ? 's' : ''}</span>
        {open ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px 16px 16px' }}>
          {sorted.map(r => <ReportCard key={r.id} report={r} onView={() => onView(r)} onDelete={() => onDelete(r.id)} />)}
        </div>
      )}
    </div>
  );
};

export const HistorialReportes: React.FC = () => {
  const { getReports, deleteReport } = useReportHistory();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [viewing, setViewing] = useState<SavedReport | null>(null);
  const refresh = () => setReports(getReports());
  useEffect(() => { refresh(); }, []);

  const handleDelete = (id: string) => {
    if (!confirm('Eliminar este reporte del historial?')) return;
    deleteReport(id);
    refresh();
  };

  const grouped = reports.reduce<Record<string, SavedReport[]>>((acc, r) => {
    if (!acc[r.projectName]) acc[r.projectName] = [];
    acc[r.projectName].push(r);
    return acc;
  }, {});

  const sortedObras = Object.keys(grouped).sort((a, b) => {
    const latestA = Math.max(...grouped[a].map(r => new Date(r.savedAt).getTime()));
    const latestB = Math.max(...grouped[b].map(r => new Date(r.savedAt).getTime()));
    return latestB - latestA;
  });

  if (viewing) return <ReportViewer report={viewing} onClose={() => setViewing(null)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div className="card" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={24} color="var(--accent-primary)" />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>Historial de Reportes</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {sortedObras.length} obra{sortedObras.length !== 1 ? 's' : ''} &middot; {reports.length} reporte{reports.length !== 1 ? 's' : ''} guardado{reports.length !== 1 ? 's' : ''} &middot; agrupados por obra y fecha
            </p>
          </div>
        </div>
      </div>
      {reports.length === 0 && (
        <div className="card" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', textAlign: 'center', padding: '60px 20px' }}>
          <FileText size={48} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1rem' }}>No hay reportes guardados aun.</p>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0', fontSize: '0.85rem' }}>Los reportes se guardan automaticamente al imprimir o exportar a PDF.</p>
        </div>
      )}
      {sortedObras.map(obra => (
        <ObraGroup key={obra} projectName={obra} reports={grouped[obra]} onView={setViewing} onDelete={handleDelete} />
      ))}
    </div>
  );
};