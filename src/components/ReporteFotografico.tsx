import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Printer, ArrowLeft, ArrowRight, MapPin, Phone, Mail, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useReportHistory } from '../hooks/useReportHistory';

interface PhotoItem {
  id: string;
  url: string;
}

export const ReporteFotografico: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [companyName, setCompanyName] = useState('CRABSA');
  const [projectName, setProjectName] = useState('PUNTO MAR');
  const [areaName, setAreaName] = useState('DEPTO 801 C');
  const [reportDate, setReportDate] = useState(
    new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  );
  const [phone, setPhone] = useState('744 207 8035');
  const [email, setEmail] = useState('basich@crabsa.com');
  const [address, setAddress] = useState('Fernando de Magallanes 2931, Costa Azul, Acapulco de Juarez, Gro 39850');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { saveReport } = useReportHistory();
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [photoQuality, setPhotoQuality] = useState<'alta' | 'media' | 'baja'>('media');

  // Comprime una imagen usando Canvas según la calidad seleccionada
  // Esto reduce el peso del PDF final hasta ~90% según el modo sin pérdida visual notable.
  const compressImage = (file: File, quality: 'alta' | 'media' | 'baja'): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        let maxWidth = 900;
        let compressionRatio = 0.65;
        if (quality === 'alta') {
          maxWidth = 1200;
          compressionRatio = 0.75;
        } else if (quality === 'baja') {
          maxWidth = 600;
          compressionRatio = 0.50;
        }

        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', compressionRatio));
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(''); // Evita que la promesa se quede colgada
      };
      img.src = objectUrl;
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const compressed = await Promise.all(
        files.map(async (file) => ({
          id: Math.random().toString(36).substring(7),
          url: await compressImage(file, photoQuality),
        }))
      );
      // Filtrar fotos que fallaron en la compresión
      const validPhotos = compressed.filter(p => p.url !== '');
      setPhotos(prev => [...prev, ...validPhotos]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newPhotos = [...photos];
      const temp = newPhotos[index];
      newPhotos[index] = newPhotos[index - 1];
      newPhotos[index - 1] = temp;
      setPhotos(newPhotos);
    } else if (direction === 'down' && index < photos.length - 1) {
      const newPhotos = [...photos];
      const temp = newPhotos[index];
      newPhotos[index] = newPhotos[index + 1];
      newPhotos[index + 1] = temp;
      setPhotos(newPhotos);
    }
  };

  const handlePrint = async () => {
    setSaving(true);
    try {
      await saveReport({
        companyName,
        projectName,
        areaName,
        reportDate,
        phone,
        email,
        address,
        photos,
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch (err) {
      console.error('Error al guardar el reporte:', err);
    } finally {
      setSaving(false);
    }
    window.print();
  };

  // Split photos into chunks of 8 for pagination
  const chunkSize = 8;
  const photoChunks: PhotoItem[][] = [];
  for (let i = 0; i < photos.length; i += chunkSize) {
    photoChunks.push(photos.slice(i, i + chunkSize));
  }

  // If no photos, at least show one empty page
  if (photoChunks.length === 0) {
    photoChunks.push([]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }} className="photo-report-container">
      
      {/* Toast de guardado exitoso */}
      {savedToast && (
        <div className="no-print" style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#10B981', color: 'white', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '14px', zIndex: 9999, boxShadow: '0 8px 24px rgba(16,185,129,0.4)', animation: 'fadeIn 0.3s ease' }}>
          <CheckCircle size={18} /> Reporte guardado correctamente
        </div>
      )}

      {/* Configuration Panel (No Print) */}
      <div className="card no-print" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={24} color="var(--accent-primary)" />
              Generador de Reporte Fotográfico
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Sube fotos, ajusta la información y genera un PDF profesional.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Calidad:</span>
              <select
                value={photoQuality}
                onChange={(e) => setPhotoQuality(e.target.value as 'alta' | 'media' | 'baja')}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="alta">Alta (1200px)</option>
                <option value="media">Media (900px) 👍</option>
                <option value="baja">Baja / Ligera (600px)</option>
              </select>
            </div>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <Upload size={16} /> Agregar Fotos
            </button>
            <button
              onClick={handlePrint}
              disabled={photos.length === 0 || saving}
              style={{
                backgroundColor: photos.length === 0 ? 'var(--bg-input)' : saving ? '#6D28D9' : 'var(--accent-primary)',
                color: photos.length === 0 ? 'var(--text-muted)' : 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: photos.length === 0 || saving ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: photos.length === 0 ? 'none' : '0 4px 6px rgba(139, 92, 246, 0.2)',
                transition: 'all 0.2s',
                opacity: saving ? 0.8 : 1,
              }}
            >
              <Printer size={16} /> {saving ? 'Guardando...' : 'Imprimir / PDF'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Empresa (Logo Texto):</label>
            <input type="text" className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nombre del Proyecto:</label>
            <input type="text" className="input" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Área / Departamento:</label>
            <input type="text" className="input" value={areaName} onChange={(e) => setAreaName(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fecha del Reporte:</label>
            <input type="text" className="input" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Teléfono (Pie de pág.):</label>
            <input type="text" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email (Pie de pág.):</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dirección (Pie de pág.):</label>
            <input type="text" className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className="report-preview-area" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
        {photoChunks.map((chunk, pageIndex) => (
          <div 
            key={pageIndex} 
            className="print-page" 
            style={{ 
              width: '215.9mm',       // Ancho Carta (Letter)
              height: '279.4mm',      // Alto Carta (Letter)
              overflow: 'hidden',     // Ningún contenido desborda la página
              backgroundColor: 'white', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}
          >
            {/* Header Area */}
            <div style={{ margin: '20px 20px 0 20px' }}>
              
              {/* Top Bracket Line */}
              <div style={{ height: '8px', borderTop: '4px solid #FBB03B', borderLeft: '4px solid #FBB03B', borderRight: '4px solid #FBB03B' }}></div>
              
              {/* Header Content */}
              <div style={{ display: 'flex', height: '110px', width: '100%', padding: '0 15px', boxSizing: 'border-box', alignItems: 'flex-start' }}>
                {/* Left Logo Area */}
                <div style={{ width: '30%', height: '70px', backgroundColor: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginTop: '2px' }}>
                  <h1 style={{ margin: 0, fontSize: '30px', fontWeight: 300, letterSpacing: '7px', fontFamily: '"Century Gothic", Arial, sans-serif' }}>
                    {companyName}
                  </h1>
                </div>

                {/* Center Title Area */}
                <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '38px', color: '#57534E', fontWeight: 900, textShadow: '3px 3px 0px rgba(0,0,0,0.15)', letterSpacing: '1px', fontFamily: 'Impact, sans-serif', transform: 'scaleY(1.1)', whiteSpace: 'nowrap' }}>
                    {projectName}
                  </h2>
                </div>

                {/* Right Info Area */}
                <div style={{ width: '28%', height: '86px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ backgroundColor: '#2D3192', color: 'white', flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>CONSTRUCCIÓN</span>
                  </div>
                  <div style={{ backgroundColor: '#5B76FF', color: 'white', flex: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>ESTATUS ACTUAL</span>
                  </div>
                  <div style={{ backgroundColor: '#FFF5F7', flex: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#FF3366', fontSize: '11px', fontWeight: 800 }}>REPORTE FOTOGRÁFICO</span>
                    <span style={{ color: '#F15A24', fontSize: '12px', fontWeight: 800 }}>{reportDate}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Bracket Line */}
              <div style={{ height: '8px', borderBottom: '4px solid #FBB03B', borderLeft: '4px solid #FBB03B', borderRight: '4px solid #FBB03B' }}></div>
              
              {/* Dark Blue Line (pegada al bracket amarillo) */}
              <div style={{ width: '100%', height: '4px', backgroundColor: '#2D3192' }}></div>
              
              {/* Gap (white space before the thick yellow bar) */}
              <div style={{ width: '100%', height: '3px', backgroundColor: 'white' }}></div>
              
              {/* Thick Yellow Bar with Black Box */}
              <div style={{ width: '100%', backgroundColor: '#FBB03B', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ backgroundColor: '#000000', color: 'white', height: '100%', padding: '0 40px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px' }}>{areaName}</span>
                </div>
              </div>
              {/* Dark Blue Line (pegada a la barra amarilla) */}
              <div style={{ width: '100%', height: '4px', backgroundColor: '#2D3192' }}></div>
            </div>

            {/* Photos Grid — 4 filas × 2 cols, todas iguales en todas las páginas */}
            <div style={{ flex: 1, minHeight: 0, padding: '8px 20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', gap: '6px', overflow: 'hidden' }}>
              {Array.from({ length: Math.ceil(chunkSize / 2) }).map((_, rowIndex) => {
                const leftIdx  = rowIndex * 2;
                const rightIdx = rowIndex * 2 + 1;
                const leftPhoto  = chunk[leftIdx];
                const rightPhoto = chunk[rightIdx];

                const renderCell = (photo: typeof leftPhoto, globalIndex: number) => {
                  if (photo) {
                    return (
                      <div className="photo-cell" style={{ flex: 1, position: 'relative', height: '100%', boxSizing: 'border-box' }}>
                        <img src={photo.url} alt={`Foto ${globalIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div className="photo-controls no-print" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: 0, transition: 'opacity 0.2s' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => movePhoto(globalIndex, 'up')} disabled={globalIndex === 0} style={{ padding: '0.5rem', borderRadius: '50%', border: 'none', cursor: globalIndex === 0 ? 'not-allowed' : 'pointer', backgroundColor: 'white' }}>
                              <ArrowLeft size={16} color="black" />
                            </button>
                            <button onClick={() => movePhoto(globalIndex, 'down')} disabled={globalIndex === photos.length - 1} style={{ padding: '0.5rem', borderRadius: '50%', border: 'none', cursor: globalIndex === photos.length - 1 ? 'not-allowed' : 'pointer', backgroundColor: 'white' }}>
                              <ArrowRight size={16} color="black" />
                            </button>
                          </div>
                          <button onClick={() => removePhoto(photo.id)} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', backgroundColor: 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="photo-cell empty" style={{ flex: 1, height: '100%', border: '1px dashed #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9CA3AF', gap: '0.5rem', boxSizing: 'border-box' }}>
                      <div className="empty-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <ImageIcon size={32} opacity={0.5} />
                        <span style={{ fontSize: '0.8rem' }}>Espacio disponible</span>
                      </div>
                    </div>
                  );
                };

                const globalLeft  = pageIndex * chunkSize + leftIdx;
                const globalRight = pageIndex * chunkSize + rightIdx;

                return (
                  <div key={rowIndex} style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden', alignItems: 'stretch' }}>
                    <div style={{ width: '5px', backgroundColor: '#FBB03B', flexShrink: 0 }}></div>
                    {renderCell(leftPhoto, globalLeft)}
                    <div style={{ width: '6px', flexShrink: 0 }}></div>
                    {renderCell(rightPhoto, globalRight)}
                    <div style={{ width: '5px', backgroundColor: '#FBB03B', flexShrink: 0 }}></div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '4px 20px 12px 20px' }}>
              {/* Thin top border line */}
              <div style={{ width: '100%', height: '1px', backgroundColor: '#9CA3AF', marginBottom: '3px' }}></div>
              {/* Page number */}
              <div style={{ textAlign: 'center', fontSize: '8px', color: '#6B7280', marginBottom: '3px' }}>
                Página {pageIndex + 1} de {photoChunks.length}
              </div>
              {/* Footer content: single row, three columns */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#374151', gap: '0' }}>
                {/* Phone */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 16px' }}>
                  <Phone size={10} color="#374151" />
                  <span>{phone}</span>
                </div>
                {/* Divider */}
                <div style={{ width: '1px', height: '12px', backgroundColor: '#9CA3AF' }}></div>
                {/* Email */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 16px' }}>
                  <Mail size={10} color="#374151" />
                  <span>{email}</span>
                </div>
                {/* Divider */}
                <div style={{ width: '1px', height: '12px', backgroundColor: '#9CA3AF' }}></div>
                {/* Address */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 16px' }}>
                  <MapPin size={10} color="#374151" style={{ flexShrink: 0 }} />
                  <span>{address}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .photo-cell:hover .photo-controls {
          opacity: 1 !important;
        }
        
        @media screen {
          .print-page {
            max-width: 100%;
            height: calc(100vw * 1.294); /* Letter aspect ratio approximation */
            max-height: 279.4mm;
          }
        }

        @media print {
          @page {
            size: letter portrait;
            margin: 0;
          }
          
          body {
            margin: 0;
            padding: 0;
            background-color: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* We need to selectively display the app container and the specific component */
          #root {
            display: block !important;
          }

          .app-layout-container {
            display: block !important;
          }

          header, 
          .sidebar-menu, 
          .chat-widget,
          .no-print {
            display: none !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
          }

          .photo-report-container {
            display: block !important;
            gap: 0 !important;
          }

          .report-preview-area {
            gap: 0 !important;
          }

          .print-page {
            width: 215.9mm !important;
            height: 279.4mm !important;
            min-height: 279.4mm !important;
            max-height: 279.4mm !important;
            box-shadow: none !important;
            page-break-after: always;
            page-break-inside: avoid;
            margin: 0 !important;
          }

          .print-page:last-child {
            page-break-after: auto;
          }

          /* Empty placeholders keep their space but hide borders and text content */
          .photo-cell.empty {
            border: none !important;
            background: transparent !important;
          }
          .photo-cell.empty .empty-content {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
