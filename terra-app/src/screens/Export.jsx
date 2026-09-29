import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import '../components/ui.css';
import './screens.css';

const generatePDFBlob = (title, summary, rows) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 20, 20);
  doc.setFontSize(11);
  doc.text(summary, 20, 30);
  
  doc.setFontSize(9);
  let y = 45;
  rows.forEach(line => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 6;
  });
  doc.text("Note: This is a DEMO PDF representing GIS output data.", 20, y + 10);
  
  return doc.output('blob');
};

const DEMO_DATA = {
  cadastral: {
    id: 'cadastral',
    name: 'Gujarat_Sector04_Cadastral.pdf',
    type: 'PDF',
    features: '2,214',
    size: '0.1 MB',
    geom: 'Polygon',
    genText: () => "P001 | 1420 sqm | 92% Conf | APPROVED | AI + Existing GIS\nP002 | 1890 sqm | 75% Conf | APPROVED | Commercial\nP003 | 1735 sqm | 48% Conf | FIELD_VERIFICATION | Mixed\nP004 | 2104 sqm | 88% Conf | APPROVED | Agricultural\nP005 | 1632 sqm | 63% Conf | REVIEWED | Residential",
    genBlob: function() { return generatePDFBlob("Cadastral Parcels - Sector 04", "Total Features: " + this.features, this.genText().split('\n')); }
  },
  buildings: {
    id: 'buildings',
    name: 'Gujarat_Sector04_Buildings.pdf',
    type: 'PDF',
    features: '1,501',
    size: '0.1 MB',
    geom: 'Polygon',
    genText: () => "B001 | 120 sqm | P001 | AI\nB002 | 240 sqm | P002 | AI\nB003 | 180 sqm | P004 | AI",
    genBlob: function() { return generatePDFBlob("Building Footprints - Sector 04", "Total Features: " + this.features, this.genText().split('\n')); }
  },
  roads: {
    id: 'roads',
    name: 'Gujarat_Sector04_Roads.pdf',
    type: 'PDF',
    features: '842',
    size: '0.1 MB',
    geom: 'LineString',
    genText: () => "R001 | Primary | 450.5m\nR002 | Secondary | 120.0m",
    genBlob: function() { return generatePDFBlob("Road Network - Sector 04", "Total Features: " + this.features, this.genText().split('\n')); }
  },
  landuse: {
    id: 'landuse',
    name: 'Gujarat_Sector04_LandUse.pdf',
    type: 'PDF',
    features: '631',
    size: '0.1 MB',
    geom: 'Polygon',
    genText: () => "LU001 | Residential | 45000 sqm | 88% Conf\nLU002 | Commercial | 20000 sqm | 91% Conf",
    genBlob: function() { return generatePDFBlob("Land-Use Classification - Sector 04", "Total Features: " + this.features, this.genText().split('\n')); }
  },
  report: {
    id: 'report',
    name: 'Gujarat_Sector04_Validation_Report.pdf',
    type: 'PDF',
    features: '2,214',
    size: '0.1 MB',
    geom: 'Table',
    genText: () => "Parcel ID | Area | Confidence | Topology Status | Review Status | Source\nP001 | 1420 | 92 | Passed | Approved | AI + Existing GIS\nP002 | 1890 | 75 | Passed | Approved | AI + Existing GIS\nP003 | 1735 | 48 | Issue | Field Verification | AI + Existing GIS\nP004 | 2104 | 88 | Passed | Approved | AI Generated\nP005 | 1632 | 63 | Passed | Reviewed | AI + Existing GIS",
    genBlob: function() { return generatePDFBlob("Validation Report - Sector 04", "Total Parcels: " + this.features, this.genText().split('\n')); }
  }
};

const ORDERED_DATASETS = [DEMO_DATA.cadastral, DEMO_DATA.buildings, DEMO_DATA.roads, DEMO_DATA.landuse, DEMO_DATA.report];

export default function Export() {
  const navigate = useNavigate();
  
  // 'loading' (preparing final output) -> 'ready' (ready to export) -> 'exported' (final view)
  const [phase, setPhase] = useState('loading'); 
  const [loadStage, setLoadStage] = useState(0);
  
  // Download button tracking
  const [downloadStates, setDownloadStates] = useState({}); // { id: 'ready' | 'preparing' | 'downloading' | 'downloaded' }
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Preview Modal
  const [previewItem, setPreviewItem] = useState(null);
  const [showSampleData, setShowSampleData] = useState(false);

  // Map Toggles
  const [mapLayers, setMapLayers] = useState({ parcels: true, buildings: true, roads: true, landuse: false });

  // Initial loading simulation
  useEffect(() => {
    if (phase !== 'loading') return;
    
    let step = 0;
    const tick = setInterval(() => {
      step++;
      setLoadStage(step);
      if (step >= 6) {
        clearInterval(tick);
        setTimeout(() => {
          setPhase('ready');
          // Signal completion for workflow indicator
          window.dispatchEvent(new CustomEvent('workflow-complete'));
        }, 600);
      }
    }, 400);

    return () => clearInterval(tick);
  }, [phase]);

  const triggerDownload = (item) => {
    setDownloadStates(prev => ({ ...prev, [item.id]: 'preparing' }));
    
    setTimeout(() => {
      setDownloadStates(prev => ({ ...prev, [item.id]: 'downloading' }));
      
      const blob = item.genBlob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloadStates(prev => ({ ...prev, [item.id]: 'downloaded' }));
        
        setTimeout(() => {
          setDownloadStates(prev => ({ ...prev, [item.id]: 'ready' }));
        }, 3000);
      }, 100);
    }, 500);
  };

  const handleDownloadAll = () => {
    if (isDownloadingAll) return;
    setIsDownloadingAll(true);
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < ORDERED_DATASETS.length) {
        triggerDownload(ORDERED_DATASETS[index]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsDownloadingAll(false), 2000);
      }
    }, 800);
  };

  const TopAction = () => {
    if (phase === 'loading') {
      return (
        <button className="btn" disabled style={{ padding: '8px 16px', fontSize: 11, fontWeight: 800 }}>
          PREPARE OUTPUT
        </button>
      );
    }
    return (
      <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
        <button className="btn btn-primary" onClick={handleDownloadAll} disabled={isDownloadingAll} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 800, background: 'var(--c-cyan)' }}>
          {isDownloadingAll ? 'DOWNLOADING PACKAGE...' : 'DOWNLOAD COMPLETE PACKAGE'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 6 }} width="16" height="16"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
      </div>
    );
  };

  return (
    <div className="screen-wrap">
      
      {/* Topbar */}
      <div className="screen-topbar" style={{ background: 'var(--surface-panel)', zIndex: 10 }}>
        <div>
          <div className="screen-title">FINAL GIS OUTPUT</div>
          <div className="screen-subtitle">Gujarat &bull; Sector 04</div>
        </div>
        
        {phase !== 'loading' && (
          <div style={{ display: 'flex', gap: 'var(--sp-4)', marginLeft: 'var(--sp-6)' }}>
            {['REVIEW COMPLETE', 'TOPOLOGY ANALYZED', 'CONFIDENCE PROCESSED', 'HUMAN REVIEW COMPLETE'].map(status => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 800, color: 'var(--c-secondary)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
                {status}
              </div>
            ))}
          </div>
        )}

        <div className="screen-topbar-actions" style={{ gap: 'var(--sp-4)', marginLeft: 'auto' }}>
          <TopAction />
        </div>
      </div>

      <div className="screen-body" style={{ overflowY: 'auto', background: 'var(--surface-bg)', padding: 'var(--sp-6)' }}>
        
        {/* Loading Overlay */}
        {phase === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(243,247,242,0.9)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div className="panel" style={{ padding: 'var(--sp-6)', width: 340, boxShadow: 'var(--shadow-lg)' }}>
               <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 'var(--sp-5)', textAlign: 'center', letterSpacing: '.05em' }}>PREPARING FINAL OUTPUT...</div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)' }}>
                 <div style={{ color: loadStage > 0 ? 'var(--c-ink)' : 'inherit' }}>{loadStage > 0 ? '✓' : '○'} Collecting validated parcels...</div>
                 <div style={{ color: loadStage > 1 ? 'var(--c-ink)' : 'inherit' }}>{loadStage > 1 ? '✓' : '○'} Collecting building footprints...</div>
                 <div style={{ color: loadStage > 2 ? 'var(--c-ink)' : 'inherit' }}>{loadStage > 2 ? '✓' : '○'} Collecting road features...</div>
                 <div style={{ color: loadStage > 3 ? 'var(--c-ink)' : 'inherit' }}>{loadStage > 3 ? '✓' : '○'} Collecting land-use layers...</div>
                 <div style={{ color: loadStage > 4 ? 'var(--c-ink)' : 'inherit' }}>{loadStage > 4 ? '✓' : '○'} Preparing validation report...</div>
                 <div style={{ color: loadStage > 5 ? 'var(--c-ink)' : 'inherit' }}>{loadStage > 5 ? '✓' : '○'} Packaging GIS-ready data...</div>
               </div>
             </div>
          </div>
        )}

        {/* Preview Drawer/Modal */}
        {previewItem && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(243,247,242,0.9)', backdropFilter: 'blur(4px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div className="panel" style={{ padding: '0', width: 600, boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
               <div style={{ padding: 'var(--sp-4) var(--sp-5)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-bg)' }}>
                 <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: '.05em' }}>DATASET PREVIEW</div>
                 <button className="btn-ghost" onClick={() => { setPreviewItem(null); setShowSampleData(false); }} style={{ padding: '4px 8px', fontSize: 16 }}>✕</button>
               </div>
               
               <div style={{ padding: 'var(--sp-5)', overflowY: 'auto' }}>
                 <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-primary)', marginBottom: 'var(--sp-4)' }}>{previewItem.name}</div>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
                   <DetailRow label="Type" value={previewItem.type} />
                   <DetailRow label="Features" value={previewItem.features} />
                   <DetailRow label="Geometry Type" value={previewItem.geom} />
                   <DetailRow label="Size" value={previewItem.size} />
                   <DetailRow label="Dataset Status" value="✓ Ready for Export" color="var(--c-secondary)" />
                 </div>

                 {showSampleData ? (
                   <div style={{ background: '#162522', color: '#a0c0b8', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-mono)', fontSize: 11, overflowX: 'auto', maxHeight: 300 }}>
                     <pre style={{ margin: 0 }}>{previewItem.genText()}</pre>
                   </div>
                 ) : (
                   <div style={{ background: 'rgba(90,174,188,0.1)', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', border: '1px solid rgba(90,174,188,0.3)', textAlign: 'center' }}>
                     <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-primary)', marginBottom: 8 }}>DEMO / PROTOTYPE DATA</div>
                     <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink)' }}>This generated file contains a valid representative sample PDF document.</div>
                   </div>
                 )}
               </div>

               <div style={{ padding: 'var(--sp-4)', borderTop: '1px solid var(--border)', background: 'var(--surface-bg)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)' }}>
                 <button className="btn btn-secondary" onClick={() => setShowSampleData(!showSampleData)}>
                   {showSampleData ? 'HIDE SAMPLE DATA' : 'VIEW SAMPLE DATA'}
                 </button>
                 <button className="btn btn-primary" style={{ background: 'var(--c-cyan)' }} onClick={() => { setPreviewItem(null); triggerDownload(previewItem); }}>
                   DOWNLOAD FILE
                 </button>
               </div>
             </div>
          </div>
        )}

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          
          {/* Mission Complete Journey Header */}
          <div className="panel" style={{ padding: 'var(--sp-6)', background: 'var(--c-secondary)', color: 'white' }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 'var(--sp-2)' }}>MISSION COMPLETE &bull; KshetraAI</div>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 'var(--sp-5)' }}>Automated cadastral extraction, validation and review workflow completed.</div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
              {[
                'DATA ACQUIRED', 'AI FEATURES EXTRACTED', 'GIS GENERATED', 'TOPOLOGY CHECKED', 
                'CONFIDENCE ANALYZED', 'SPATIAL DATA STORED', 'WEB GIS REVIEWED', 
                'HUMAN REVIEW COMPLETED', 'GIS OUTPUT PREPARED'
              ].map(step => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.15)', padding: '6px 10px', borderRadius: '4px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Hero Summary */}
          <div className="panel" style={{ padding: 'var(--sp-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: '.02em', marginBottom: 'var(--sp-2)' }}>CADASTRAL DATASET READY</div>
              <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg> SPATIAL DATA READY</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg> REPORT READY</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-6)' }}>
              <Metric label="PARCELS" value="2,214" />
              <Metric label="BUILDINGS" value="1,501" />
              <Metric label="ROADS" value="842" />
              <Metric label="LAND-USE REGIONS" value="631" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--sp-6)' }}>
            
            {/* Left Column - Output Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
              
              <div className="panel">
                <div className="panel-header"><div className="panel-title">GIS-READY DATA DELIVERABLES</div></div>
                <div className="panel-body" style={{ padding: 0 }}>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-bg)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: 'var(--sp-3) var(--sp-4)', fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.05em' }}>FILE</th>
                        <th style={{ padding: 'var(--sp-3) var(--sp-4)', fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.05em' }}>TYPE</th>
                        <th style={{ padding: 'var(--sp-3) var(--sp-4)', fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.05em' }}>FEATURES</th>
                        <th style={{ padding: 'var(--sp-3) var(--sp-4)', fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.05em' }}>SIZE</th>
                        <th style={{ padding: 'var(--sp-3) var(--sp-4)', fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.05em' }}>STATUS</th>
                        <th style={{ padding: 'var(--sp-3) var(--sp-4)', fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.05em', textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ORDERED_DATASETS.map(item => {
                        const dlState = downloadStates[item.id] || 'ready';
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: 'var(--sp-3) var(--sp-4)', fontSize: 12, fontWeight: 700, color: 'var(--c-primary)' }}>{item.name}</td>
                            <td style={{ padding: 'var(--sp-3) var(--sp-4)', fontSize: 11, fontWeight: 600, color: 'var(--c-ink)' }}>{item.type}</td>
                            <td style={{ padding: 'var(--sp-3) var(--sp-4)', fontSize: 11, fontWeight: 600, color: 'var(--c-ink)', fontFamily: 'var(--font-mono)' }}>{item.features}</td>
                            <td style={{ padding: 'var(--sp-3) var(--sp-4)', fontSize: 11, fontWeight: 600, color: 'var(--c-ink)' }}>{item.size}</td>
                            <td style={{ padding: 'var(--sp-3) var(--sp-4)', fontSize: 11, fontWeight: 800, color: 'var(--c-secondary)' }}>✓ Ready</td>
                            <td style={{ padding: 'var(--sp-3) var(--sp-4)', display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end' }}>
                              <button className="btn-ghost" onClick={() => { setPreviewItem(item); setShowSampleData(false); }} style={{ padding: '4px 8px', fontSize: 10 }}>PREVIEW</button>
                              
                              <button 
                                className="btn" 
                                onClick={() => triggerDownload(item)} 
                                disabled={dlState !== 'ready' && dlState !== 'downloaded'}
                                style={{ 
                                  padding: '4px 12px', fontSize: 10, fontWeight: 700, width: 110, justifyContent: 'center',
                                  background: dlState === 'downloaded' ? 'var(--c-secondary)' : 'var(--c-ink)',
                                  color: 'white'
                                }}
                              >
                                {dlState === 'preparing' ? 'PREPARING...' : dlState === 'downloading' ? 'DOWNLOADING...' : dlState === 'downloaded' ? '✓ DOWNLOADED' : 'DOWNLOAD'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                </div>
              </div>

              {/* Metadata */}
              <div className="panel">
                <div className="panel-header"><div className="panel-title">DELIVERY METADATA</div></div>
                <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-4)' }}>
                  <DetailRow label="PROJECT" value="Gujarat Sector 04" stacked />
                  <DetailRow label="CRS" value="EPSG:32643" stacked font="mono" />
                  <DetailRow label="DATA SOURCE" value="AI + Existing GIS" stacked />
                  <DetailRow label="STATUS" value="GIS-READY DEMO DATA" stacked color="var(--c-cyan)" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
              
              {/* GIS Output Preview Map */}
              <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="panel-title">FINALIZED DATASET PREVIEW</div>
                </div>
                
                {/* Toggles */}
                <div style={{ padding: 'var(--sp-3)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                    <input type="checkbox" checked={mapLayers.parcels} onChange={() => setMapLayers(l => ({...l, parcels: !l.parcels}))} /> Parcels
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                    <input type="checkbox" checked={mapLayers.buildings} onChange={() => setMapLayers(l => ({...l, buildings: !l.buildings}))} /> Buildings
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                    <input type="checkbox" checked={mapLayers.roads} onChange={() => setMapLayers(l => ({...l, roads: !l.roads}))} /> Roads
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                    <input type="checkbox" checked={mapLayers.landuse} onChange={() => setMapLayers(l => ({...l, landuse: !l.landuse}))} /> Land-use
                  </label>
                </div>

                <div style={{ height: 260, position: 'relative', background: '#DCE4DD', overflow: 'hidden', borderBottomLeftRadius: 'var(--r-md)', borderBottomRightRadius: 'var(--r-md)' }}>
                  {/* Clean SVG Map */}
                  <svg width="100%" height="100%" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">
                    <rect width="100%" height="100%" fill="#DCE4DD" />
                    
                    {/* Land-use */}
                    {mapLayers.landuse && (
                      <polygon points="-10,-10 410,-10 410,130 -10,130" fill="rgba(213,163,71,0.1)" stroke="none" />
                    )}

                    {/* Roads */}
                    {mapLayers.roads && (
                      <path d="M0 130 L400 110 M150 0 L180 260 M300 0 L270 260" stroke="rgba(22,37,34,0.15)" strokeWidth="8" fill="none" />
                    )}
                    
                    {/* Finalized Parcels */}
                    {mapLayers.parcels && (
                      <g fill="rgba(78,143,115,0.15)" stroke="var(--c-secondary)" strokeWidth="1.5">
                        <polygon points="50,40 140,50 120,130 30,120" />
                        <polygon points="140,50 250,60 230,140 120,130" />
                        <polygon points="250,60 360,70 340,150 230,140" />
                        <polygon points="30,120 120,130 100,210 10,200" />
                        <polygon points="120,130 230,140 210,220 100,210" />
                      </g>
                    )}
                    
                    {/* Buildings */}
                    {mapLayers.buildings && (
                      <g fill="rgba(16,63,58,0.2)" stroke="rgba(16,63,58,0.5)">
                        <rect x="70" y="70" width="30" height="20" />
                        <rect x="170" y="80" width="40" height="30" />
                        <rect x="280" y="90" width="25" height="25" />
                        <rect x="50" y="150" width="35" height="25" />
                        <rect x="150" y="160" width="30" height="30" />
                      </g>
                    )}
                  </svg>
                </div>
              </div>

              {/* Quality Summary */}
              <div className="panel">
                <div className="panel-header"><div className="panel-title">QUALITY SUMMARY</div></div>
                <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <DetailRow label="Parcels analyzed" value="2,214" />
                  <DetailRow label="Topology checks" value="✓ Complete" color="var(--c-secondary)" />
                  <DetailRow label="Flagged areas" value="48" />
                  <DetailRow label="Human reviewed" value="87" />
                  <DetailRow label="Field verification" value="5" />
                  
                  <div style={{ marginTop: 'var(--sp-2)', paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink-muted)' }}>Final status</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-secondary)' }}>READY FOR EXPORT</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-ink)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)' }}>{label}</div>
    </div>
  );
}

function DetailRow({ label, value, color = 'var(--c-ink)', font = 'sans', stacked = false }) {
  if (stacked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-ink-muted)' }}>{label}</div>
        <div style={{ fontSize: 12, fontWeight: 800, color, fontFamily: font === 'mono' ? 'var(--font-mono)' : 'inherit' }}>{value}</div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)' }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color, fontFamily: font === 'mono' ? 'var(--font-mono)' : 'inherit' }}>{value}</div>
    </div>
  );
}
