import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../components/ui.css';
import './screens.css';

const PIPELINE = [
  { id: 'tiling', label: 'Image Tiling', section: 'A' },
  { id: 'geometric', label: 'Geometric Correction & Alignment', section: 'A' },
  { id: 'noise', label: 'Noise Removal & Enhancement', section: 'A' },
  { id: 'segmentation', label: 'Semantic Segmentation', section: 'B' },
  { id: 'building', label: 'Building Extraction', section: 'B' },
  { id: 'road', label: 'Road Extraction', section: 'B' },
  { id: 'vegetation', label: 'Vegetation Extraction', section: 'B' },
  { id: 'land', label: 'Open Land Extraction', section: 'B' }
];

export default function AIProcessing() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [phase, setPhase] = useState('initial'); // initial | preparing | processing | completed
  const [demoAlert, setDemoAlert] = useState(null); // 'warning' | 'error' | null
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const [metrics, setMetrics] = useState({
    tiles: 0, time: 0, buildings: 0, roads: 0, veg: 0, land: 0
  });

  // Start processing sequence
  const startProcessing = () => {
    setPhase('preparing');
    setTimeout(() => {
      setPhase('processing');
      setCurrentIdx(0);
      setProgress(0);
    }, 2000);
  };

  // Processing loop
  useEffect(() => {
    if (phase !== 'processing' || demoAlert === 'error') return;
    
    let advanced = false;

    const tick = setInterval(() => {
      if (demoAlert === 'warning' || advanced) return;

      setProgress(p => {
        if (p >= 100) return 100; // block duplicate increments
        const nextP = p + Math.floor(Math.random() * 8) + 2;
        
        // Update metrics progressively
        setMetrics(m => ({
          ...m,
          time: m.time + 1,
          tiles: currentIdx >= 0 ? Math.min(1842, m.tiles + 15) : 0,
          buildings: currentIdx >= 4 ? Math.min(1501, m.buildings + 12) : m.buildings,
          roads: currentIdx >= 5 ? Math.min(842, m.roads + 8) : m.roads,
          veg: currentIdx >= 6 ? Math.min(2184, m.veg + 25) : m.veg,
          land: currentIdx >= 7 ? Math.min(631, m.land + 5) : m.land
        }));

        if (nextP >= 100) {
          advanced = true;
          if (currentIdx < PIPELINE.length - 1) {
            setTimeout(() => {
              setCurrentIdx(idx => Math.min(idx + 1, PIPELINE.length - 1));
              setProgress(0);
            }, 400); // brief pause between stages
          } else {
            setTimeout(() => setPhase('completed'), 500);
          }
          return 100;
        }
        return nextP;
      });
    }, 150);

    return () => clearInterval(tick);
  }, [phase, currentIdx, demoAlert]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentStage = PIPELINE[currentIdx] || PIPELINE[PIPELINE.length - 1];
  const isSectionA = currentStage.section === 'A';

  const getStatusMessage = () => {
    if (phase === 'preparing') return 'Checking source compatibility...';
    if (phase === 'completed') return 'Feature extraction finalized.';
    switch(currentStage.id) {
      case 'tiling': return 'Preparing geospatial tiles...';
      case 'geometric': return 'Correcting image geometry...';
      case 'noise': return 'Enhancing aerial imagery...';
      case 'segmentation': return 'Running semantic segmentation...';
      case 'building': return 'Extracting building footprints...';
      case 'road': return 'Extracting road network...';
      case 'vegetation': return 'Classifying vegetation...';
      case 'land': return 'Processing open land...';
      default: return 'Processing...';
    }
  };

  return (
    <div className="screen-wrap">
      
      {/* Topbar */}
      <div className="screen-topbar" style={{ background: 'var(--surface-panel)', zIndex: 10 }}>
        <div>
          <div className="screen-title">AI Processing Workspace</div>
          <div className="screen-subtitle">Automated pipeline for cadastral feature extraction</div>
        </div>
        <div className="screen-topbar-actions" style={{ gap: 'var(--sp-4)' }}>
          <div style={{ textAlign: 'right' }}>
            <button 
              className={`btn ${phase === 'completed' ? 'btn-primary' : ''}`} 
              disabled={phase !== 'completed'}
              onClick={() => navigate('/gis-parcel')}
              style={{ 
                padding: '8px 16px', fontSize: 11, fontWeight: 800,
                background: phase === 'completed' ? 'var(--c-secondary)' : 'var(--surface-bg)', 
                color: phase === 'completed' ? 'white' : 'var(--c-ink-muted)', 
                opacity: phase === 'completed' ? 1 : 0.6,
                border: `1px solid ${phase === 'completed' ? 'var(--c-secondary)' : 'var(--border)'}`,
                cursor: phase === 'completed' ? 'pointer' : 'not-allowed'
              }}
            >
              CONTINUE TO GIS CONVERSION
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 6 }} width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--c-ink-muted)', marginTop: 4 }}>
              {phase === 'completed' ? 'Extraction complete — continue to GIS conversion.' : 'Complete feature extraction to continue.'}
            </div>
          </div>
        </div>
      </div>

      <div className="screen-body screen-body--pad scroll-y" style={{ maxWidth: 1400, margin: '0 auto', width: '100%', paddingBottom: 'var(--sp-10)' }}>
        
        {/* Initial State */}
        {phase === 'initial' && (
          <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="panel" style={{ padding: 'var(--sp-8)', width: 420, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-4)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(90,174,188,0.1)', color: 'var(--c-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: '.03em', marginBottom: 4 }}>READY TO PROCESS</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-ink-muted)' }}>Dataset: gujarat_sector_04.tif</div>
              </div>
              <div style={{ background: 'var(--surface-bg)', padding: '6px 12px', borderRadius: 'var(--r-sm)', fontSize: 11, fontWeight: 700, color: 'var(--c-ink)' }}>
                Input sources: <span style={{ color: 'var(--c-secondary)' }}>4 / 4 ready</span>
              </div>
              <button className="btn btn-primary" onClick={startProcessing} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 12, background: 'var(--c-cyan)' }}>
                START PROCESSING
              </button>
            </div>
          </div>
        )}

        {/* Preparing State */}
        {phase === 'preparing' && (
          <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-4)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(90,174,188,0.2)', borderTopColor: 'var(--c-cyan)', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: '.05em' }}>PREPARING DATASET...</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)' }}>{getStatusMessage()}</div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Main Processing Workspace */}
        {(phase === 'processing' || phase === 'completed') && (
          <div style={{ display: 'flex', gap: 'var(--sp-6)', height: '100%' }}>
            
            {/* LEFT: Processing Journey */}
            <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
              
              {/* Section A */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.08em', marginBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  SECTION A: PREPROCESSING
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  {PIPELINE.filter(p => p.section === 'A').map((p, i) => {
                    const idx = i;
                    const state = phase === 'completed' || currentIdx > idx ? 'completed' : currentIdx === idx ? 'current' : 'pending';
                    return <PipelineItem key={p.id} stage={p} num={`0${idx + 1}`} state={state} progress={state === 'current' ? progress : 0} />;
                  })}
                </div>
              </div>

              {/* Section B */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.08em', marginBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  SECTION B: AI/ML EXTRACTION
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  {PIPELINE.filter(p => p.section === 'B').map((p, i) => {
                    const idx = i + 3; // Section B starts at index 3
                    const state = phase === 'completed' || currentIdx > idx ? 'completed' : currentIdx === idx ? 'current' : 'pending';
                    return <PipelineItem key={p.id} stage={p} num={`0${idx + 1}`} state={state} progress={state === 'current' ? progress : 0} />;
                  })}
                </div>
              </div>

              {/* Developer Demo Controls (Hidden from normal UI, used for prototype) */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: 6, opacity: 0.2, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=0.2}>
                 <button className="btn btn-ghost" style={{ fontSize: 9, padding: 4 }} onClick={() => setDemoAlert('warning')}>⚠ Warn</button>
                 <button className="btn btn-ghost" style={{ fontSize: 9, padding: 4 }} onClick={() => setDemoAlert('error')}>✕ Err</button>
                 <button className="btn btn-ghost" style={{ fontSize: 9, padding: 4 }} onClick={() => setDemoAlert(null)}>Clear</button>
              </div>
            </div>

            {/* CENTER: Geospatial Processing Visualization */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              
              {/* Status Line */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--sp-3)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary)', background: 'var(--surface-panel)', padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  {getStatusMessage()}
                </div>
              </div>

              {/* Central Visual Wrapper */}
              <div style={{ flex: 1, background: 'var(--surface-panel)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 480 }}>
                
                {/* Source Tile Meta */}
                <div style={{ position: 'absolute', top: 'var(--sp-4)', left: 'var(--sp-4)', zIndex: 5, background: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2, backdropFilter: 'blur(4px)' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: '.05em' }}>SECTOR 04 &bull; TILE 0048</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--c-ink-muted)', fontFamily: 'var(--font-mono)' }}>RGB ORTHOPHOTO &bull; 3840×2160</div>
                </div>

                {/* Simulated Aerial Image (Using SVG patterns for prototype) */}
                <div style={{ flex: 1, position: 'relative', background: '#D2D9D2', overflow: 'hidden' }}>
                  
                  {/* Base "Image" - A topographic looking texture */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: `radial-gradient(circle at 30% 40%, rgba(16,63,58,0.05) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(78,143,115,0.05) 0%, transparent 40%)` }} />
                  
                  {/* Tiling Effect (Stage 0) */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(16,63,58,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,63,58,0.1) 1px, transparent 1px)', backgroundSize: '80px 80px', opacity: (currentIdx === 0 && phase !== 'completed') ? (progress/100) : (currentIdx > 0 ? 0.3 : 0), transition: 'opacity 0.3s' }} />
                  
                  {/* Geometric Correction (Stage 1) - slight rotation/scale fix */}
                  <div style={{ position: 'absolute', inset: 20, border: '1px dashed rgba(16,63,58,0.2)', opacity: currentIdx >= 1 ? 1 : 0, transition: 'all 0.5s', transform: currentIdx === 1 ? `rotate(${(100-progress)*0.02}deg) scale(${1 + (100-progress)*0.0005})` : 'none' }} />

                  {/* Masks - Revealing during Section B */}
                  {/* Buildings */}
                  <div style={{ position: 'absolute', inset: 0, opacity: phase === 'completed' || currentIdx > 4 ? 0.7 : (currentIdx === 4 ? (progress/100)*0.7 : 0), transition: 'opacity 0.3s' }}>
                    <svg width="100%" height="100%"><rect x="150" y="100" width="40" height="60" fill="var(--c-warning)" opacity="0.6"/><rect x="350" y="200" width="80" height="40" fill="var(--c-warning)" opacity="0.6"/><rect x="550" y="120" width="50" height="50" fill="var(--c-warning)" opacity="0.6"/></svg>
                  </div>
                  
                  {/* Roads */}
                  <div style={{ position: 'absolute', inset: 0, opacity: phase === 'completed' || currentIdx > 5 ? 0.8 : (currentIdx === 5 ? (progress/100)*0.8 : 0), transition: 'opacity 0.3s' }}>
                     <svg width="100%" height="100%"><path d="M0 250 L800 220 M200 0 L250 500" stroke="var(--c-ink)" strokeWidth="8" fill="none" opacity="0.4"/></svg>
                  </div>

                  {/* Vegetation */}
                  <div style={{ position: 'absolute', inset: 0, opacity: phase === 'completed' || currentIdx > 6 ? 0.6 : (currentIdx === 6 ? (progress/100)*0.6 : 0), transition: 'opacity 0.3s' }}>
                     <svg width="100%" height="100%"><circle cx="650" cy="350" r="80" fill="var(--c-secondary)" opacity="0.5"/><circle cx="100" cy="400" r="100" fill="var(--c-secondary)" opacity="0.5"/></svg>
                  </div>

                  {/* Scanning Laser Effect during processing */}
                  {phase === 'processing' && !demoAlert && (
                    <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'var(--c-cyan)', top: `${progress}%`, opacity: 0.6, boxShadow: '0 0 10px var(--c-cyan)', transition: 'top 0.1s linear' }} />
                  )}

                </div>
              </div>

              {/* Warning/Error Overlays */}
              {demoAlert === 'warning' && (
                <div style={{ position: 'absolute', bottom: 'var(--sp-4)', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-panel)', border: '1px solid var(--c-amber)', borderLeft: '4px solid var(--c-amber)', padding: '12px 16px', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', zIndex: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-amber)', letterSpacing: '.05em' }}>⚠ IMAGE QUALITY NOTICE</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-ink)' }}>Minor image noise detected. Enhancement applied automatically.</div>
                  </div>
                  <button className="btn btn-secondary" onClick={() => setDemoAlert(null)} style={{ fontSize: 10, padding: '4px 12px' }}>DISMISS</button>
                </div>
              )}

              {demoAlert === 'error' && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.9)', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                   <div className="panel" style={{ padding: 'var(--sp-6)', borderLeft: '4px solid var(--c-coral)', maxWidth: 400, textAlign: 'center' }}>
                     <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-coral)', letterSpacing: '.05em', marginBottom: 8 }}>PROCESSING INTERRUPTED</div>
                     <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-ink)', marginBottom: 'var(--sp-5)' }}>Tile 0048 could not be processed due to missing geometric data.</div>
                     <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
                       <button className="btn btn-secondary" onClick={() => setDemoAlert(null)}>SKIP TILE</button>
                       <button className="btn btn-primary" style={{ background: 'var(--c-coral)' }} onClick={() => setDemoAlert(null)}>RETRY</button>
                     </div>
                   </div>
                </div>
              )}

            </div>

            {/* RIGHT: Live Processing Panel */}
            <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              
              <div className="panel" style={{ padding: 'var(--sp-4)' }}>
                <div className="sec-heading">PROCESSING STATUS</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase' }}>Project</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink)' }}>Gujarat Sector 04</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase' }}>Dataset</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-ink)', fontFamily: 'var(--font-mono)' }}>gujarat_sector_04.tif</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Current Operation</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)', marginBottom: 8, lineHeight: 1.2 }}>{phase === 'completed' ? 'None' : currentStage.label}</div>
                  
                  {phase === 'processing' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 800, color: 'var(--c-cyan)', marginBottom: 4 }}>
                        <span>Progress</span><span>{progress}%</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(90,174,188,0.15)', borderRadius: 2 }}>
                        <div style={{ height: '100%', background: 'var(--c-cyan)', width: `${progress}%`, transition: 'width 0.2s', borderRadius: 2 }} />
                      </div>
                    </>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase' }}>Tiles Processed</div>
                    <div style={{ fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--c-ink)' }}>{metrics.tiles} / 1,842</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase' }}>Processing Time</div>
                    <div style={{ fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--c-ink)' }}>{formatTime(metrics.time)}</div>
                  </div>
                </div>
              </div>

              {/* Extracted Features List */}
              <div className="panel" style={{ padding: 'var(--sp-4)', flex: 1 }}>
                <div className="sec-heading">FEATURES EXTRACTED</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <FeatureStat label="Buildings" count={metrics.buildings} active={currentIdx >= 4 || phase === 'completed'} />
                  <FeatureStat label="Road Segments" count={metrics.roads} active={currentIdx >= 5 || phase === 'completed'} />
                  <FeatureStat label="Vegetation Regions" count={metrics.veg} active={currentIdx >= 6 || phase === 'completed'} />
                  <FeatureStat label="Open Land Regions" count={metrics.land} active={currentIdx >= 7 || phase === 'completed'} />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Completion CTA - overlays bottom right nicely */}
        {phase === 'completed' && (
          <div style={{ marginTop: 'var(--sp-5)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-4)' }}>
            <button className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: 12 }}>
              VIEW PROCESSING DETAILS
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// Subcomponents
function PipelineItem({ stage, num, state, progress }) {
  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: isCurrent ? 'var(--surface-panel)' : 'transparent', borderRadius: 'var(--r-md)', border: isCurrent ? '1px solid var(--border)' : '1px solid transparent', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Progress Fill for Current */}
      {isCurrent && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(90,174,188,0.04)', width: `${progress}%`, transition: 'width 0.2s', zIndex: 0 }} />
      )}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', width: '100%', gap: 'var(--sp-3)' }}>
        
        {/* Status Icon / Num */}
        <div style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: isCompleted ? 'rgba(78,143,115,0.1)' : isCurrent ? 'rgba(90,174,188,0.15)' : 'rgba(16,63,58,0.04)',
          color: isCompleted ? 'var(--c-secondary)' : isCurrent ? 'var(--c-cyan)' : 'var(--c-ink-muted)',
          border: isCurrent ? '1px solid rgba(90,174,188,0.4)' : 'none'
        }}>
          {isCompleted ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <span style={{ fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{num}</span>
          )}
        </div>

        {/* Label */}
        <div style={{ fontSize: 11, fontWeight: isCurrent ? 700 : 600, color: isCompleted ? 'var(--c-ink)' : isCurrent ? 'var(--c-primary)' : 'var(--c-ink-muted)' }}>
          {stage.label}
        </div>
      </div>
    </div>
  );
}

function FeatureStat({ label, count, active }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: active ? 1 : 0.4, transition: 'opacity 0.3s' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink)' }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-mono)', color: active ? 'var(--c-primary)' : 'var(--c-ink-muted)' }}>
        {count.toLocaleString()}
      </div>
    </div>
  );
}
