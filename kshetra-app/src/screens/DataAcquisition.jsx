import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/ui.css';
import './screens.css';

const PREVIOUS_UPLOADS = [
  { id: 'p1', file: 'sector04_orthophoto.tif', type: 'GeoTIFF', size: '482 MB', date: 'Today, 10:42', status: 'ready' },
  { id: 'p2', file: 'sector04_dsm.tif', type: 'GeoTIFF', size: '218 MB', date: 'Today, 10:44', status: 'ready' },
  { id: 'p3', file: 'existing_parcels.geojson', type: 'GeoJSON', size: '18 MB', date: 'Today, 10:46', status: 'ready' },
  { id: 'p10', file: 'corrupted_flight_log.txt', type: 'TXT', size: '12 KB', date: 'Yesterday, 09:12', status: 'failed' },
  { id: 'p4', file: 'gujarat_sector_04.tif', type: 'GeoTIFF', size: '4.2 GB', date: 'Yesterday, 14:20', status: 'ready' },
  { id: 'p5', file: 'gnss_points.csv', type: 'CSV', size: '12 KB', date: 'Yesterday, 14:25', status: 'ready' },
  { id: 'p6', file: 'sector03_ortho.tif', type: 'GeoTIFF', size: '310 MB', date: 'Oct 12, 09:10', status: 'ready' },
  { id: 'p7', file: 'sector03_dsm.tif', type: 'GeoTIFF', size: '150 MB', date: 'Oct 12, 09:15', status: 'ready' },
  { id: 'p8', file: 'old_parcels.shp', type: 'Shapefile', size: '45 MB', date: 'Oct 10, 11:00', status: 'ready' },
  { id: 'p9', file: 'old_dsm.tif', type: 'GeoTIFF', size: '89 MB', date: 'Oct 09, 16:30', status: 'ready' }
];

export default function DataAcquisition() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [currentUploads, setCurrentUploads] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [page, setPage] = useState(1);

  const processFiles = (files) => {
    const newFiles = Array.from(files).map(file => {
      // Simple mock validation rule
      const ext = file.name.split('.').pop().toLowerCase();
      const supported = ['tif', 'tfw', 'las', 'geojson', 'shp', 'csv', 'png', 'jpg'].includes(ext);
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: ext.toUpperCase(),
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        status: supported ? 'uploading' : 'failed',
        validation: supported ? 'Validating...' : 'Unsupported format',
        progress: 0
      };
    });

    setCurrentUploads(prev => [...newFiles, ...prev]);

    newFiles.forEach(nf => {
      if (nf.status === 'failed') return;
      let p = 0;
      const interval = setInterval(() => {
        p += Math.floor(Math.random() * 25) + 10;
        if (p >= 100) {
          clearInterval(interval);
          setCurrentUploads(prev => prev.map(f => f.id === nf.id ? { ...f, status: 'ready', validation: '✓ File ready', progress: 100 } : f));
        } else {
          setCurrentUploads(prev => prev.map(f => f.id === nf.id ? { ...f, progress: p, validation: 'Uploading & Validating...' } : f));
        }
      }, 350);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) processFiles(e.target.files);
  };

  const removeFile = (id) => {
    setCurrentUploads(prev => prev.filter(f => f.id !== id));
  };

  // Pagination logic
  const itemsPerPage = 7;
  const totalPages = Math.ceil(PREVIOUS_UPLOADS.length / itemsPerPage);
  const paginatedPrev = PREVIOUS_UPLOADS.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Readiness logic (Prototype shortcut: any successful upload satisfies the prototype requirement)
  const baseReadyCount = currentUploads.filter(f => f.status === 'ready').length;
  const isReady = baseReadyCount > 0;
  
  const reqs = {
    imagery: isReady,
    dsm: isReady,
    gis: isReady,
    gnss: isReady
  };
  
  const readyCount = isReady ? 4 : 0;

  const handleStart = () => {
    setIsProcessing(true);
    setTimeout(() => {
      navigate('/ai-processing');
    }, 1500);
  };

  const ReadinessRow = ({ label, ready }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: ready ? 'var(--c-ink)' : 'var(--c-ink-muted)' }}>
      <span>{label}</span>
      {ready ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-secondary)" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <div style={{ width: 14, height: 14, border: '1.5px solid var(--border-strong)', borderRadius: '50%' }} />
      )}
    </div>
  );

  return (
    <div className="screen-wrap">
      
      {/* Sticky Topbar with Contextual Next Step */}
      <div className="screen-topbar" style={{ background: 'var(--surface-panel)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div className="screen-title">Data Acquisition Workspace</div>
          <div className="screen-subtitle">Survey data intake and geospatial file verification</div>
        </div>
        
        <div className="screen-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          {/* Contextual Hint */}
          {isReady ? (
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-secondary)', textAlign: 'right', lineHeight: 1.3 }}>
              Datasets ready.<br/>Continue to AI Processing.
            </div>
          ) : (
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--c-ink-muted)', textAlign: 'right', lineHeight: 1.3 }}>
              {readyCount} of 4 data sources ready<br/>Complete required inputs to continue.
            </div>
          )}

          <button 
            className="btn btn-primary" 
            onClick={handleStart}
            disabled={!isReady || isProcessing}
            style={{ 
              padding: '10px 24px', 
              fontSize: 12, 
              letterSpacing: '.04em',
              background: isReady ? 'var(--c-cyan)' : 'transparent',
              color: isReady ? '#fff' : 'var(--c-ink-muted)',
              border: isReady ? 'none' : '1px solid var(--border-strong)',
              transition: 'all 0.2s',
              minWidth: 200,
              justifyContent: 'center'
            }}
          >
            {isProcessing ? 'Preparing datasets...' : 'START AI PROCESSING'}
          </button>
        </div>
      </div>

      <div className="screen-body screen-body--pad scroll-y" style={{ maxWidth: 1040, margin: '0 auto', width: '100%', paddingBottom: 'var(--sp-10)' }}>
        
        <div style={{ display: 'flex', gap: 'var(--sp-6)', marginBottom: 'var(--sp-6)', alignItems: 'flex-start' }}>
          
          {/* LEFT: Multi-file Upload Area */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
            
            {/* First-time user guidance */}
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-ink)', marginBottom: 'var(--sp-3)' }}>
              Upload drone imagery, elevation data and existing GIS layers to begin automated cadastral extraction.
            </div>

            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                padding: 'var(--sp-6)', 
                border: isDragging ? '1.5px dashed var(--c-cyan)' : '1px dashed var(--border-strong)', 
                borderRadius: 'var(--r-md)',
                background: isDragging ? 'rgba(90,174,188,0.05)' : 'var(--surface-panel)', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(90,174,188,0.1)', color: 'var(--c-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--sp-3)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 4 }}>Drag &amp; Drop Geospatial Files Here</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--c-ink-muted)', marginBottom: 'var(--sp-4)' }}>Supports .tif, .geojson, .csv, .shp (Max 50GB per mission)</div>
              <div className="btn btn-secondary">Browse Local Files</div>
            </div>

            {/* Current Uploads List */}
            {currentUploads.length > 0 && (
              <div style={{ marginTop: 'var(--sp-5)', background: 'var(--surface-panel)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                {currentUploads.map((f, idx) => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: idx < currentUploads.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingRight: 'var(--sp-3)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--c-ink-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{f.type} &bull; {f.size}</div>
                    </div>
                    
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: f.status === 'ready' ? 'var(--c-secondary)' : f.status === 'failed' ? 'var(--c-coral)' : 'var(--c-warning)' }}>
                        {f.validation}
                      </div>
                      {f.status === 'uploading' && (
                        <div style={{ height: 4, background: 'rgba(90,174,188,0.2)', width: '100%', maxWidth: 160, borderRadius: 2 }}>
                          <div style={{ height: '100%', background: 'var(--c-cyan)', width: `${f.progress}%`, borderRadius: 2, transition: 'width 0.2s' }} />
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      {f.status === 'failed' ? (
                        <button className="btn btn-ghost" style={{ color: 'var(--c-coral)', padding: '4px 8px', fontSize: 11 }} onClick={(e) => { e.stopPropagation(); processFiles([f]); }}>Retry</button>
                      ) : (
                        <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}>Remove</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Readiness Status */}
          <div style={{ flex: 1 }}>
            <div className="panel" style={{ padding: 'var(--sp-5)' }}>
              <div className="sec-heading">DATA READINESS</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
                <ReadinessRow label="Drone Imagery" ready={reqs.imagery} />
                <ReadinessRow label="DSM / DTM" ready={reqs.dsm} />
                <ReadinessRow label="Existing GIS Layer" ready={reqs.gis} />
                <ReadinessRow label="GNSS / CORS" ready={reqs.gnss} />
              </div>

              {isReady ? (
                <div style={{ background: 'rgba(78,143,115,0.1)', color: 'var(--c-secondary)', padding: '8px', textAlign: 'center', fontSize: 11, fontWeight: 800, borderRadius: 'var(--r-sm)', letterSpacing: '.04em' }}>
                  READY FOR PROCESSING
                </div>
              ) : (
                <div style={{ background: 'var(--c-mist)', color: 'var(--c-ink-muted)', padding: '8px', textAlign: 'center', fontSize: 11, fontWeight: 700, borderRadius: 'var(--r-sm)' }}>
                  Awaiting missing datasets
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PREVIOUSLY UPLOADED DATA */}
        <div style={{ marginTop: 'var(--sp-4)' }}>
          <div className="sec-heading">PREVIOUSLY UPLOADED DATA</div>
          <div className="panel" style={{ overflow: 'hidden' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>FILE</th>
                  <th>TYPE</th>
                  <th>SIZE</th>
                  <th>UPLOADED</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPrev.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: 'var(--c-ink)' }}>{p.file}</td>
                    <td style={{ color: 'var(--c-ink-muted)', fontSize: 11 }}>{p.type}</td>
                    <td className="td-mono" style={{ color: 'var(--c-ink)' }}>{p.size}</td>
                    <td className="td-mono" style={{ color: 'var(--c-ink-muted)' }}>{p.date}</td>
                    <td style={{ color: p.status === 'ready' ? 'var(--c-secondary)' : 'var(--c-coral)', fontWeight: 700, fontSize: 11 }}>
                      {p.status === 'ready' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg> Ready
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Failed
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10 }}>Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px var(--sp-5)', background: 'var(--surface-bg)', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)' }}>
                Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, PREVIOUS_UPLOADS.length)} of {PREVIOUS_UPLOADS.length} records
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(page-1)} style={{ padding: '4px 10px', fontSize: 11 }}>Previous</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(i+1)} style={{ padding: '4px 12px', fontSize: 11 }}>{i + 1}</button>
                ))}
                <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage(page+1)} style={{ padding: '4px 10px', fontSize: 11 }}>Next</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
