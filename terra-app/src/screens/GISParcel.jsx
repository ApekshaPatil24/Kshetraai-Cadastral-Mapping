import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/ui.css';
import './screens.css';

const PIPELINE = [
  { id: 'refine', label: 'Mask Refinement', section: 'A' },
  { id: 'contour', label: 'Contour Extraction', section: 'A' },
  { id: 'polygon', label: 'Polygonization', section: 'A' },
  { id: 'simplify', label: 'Geometry Simplification', section: 'A' },
  { id: 'classify', label: 'Feature Classification', section: 'A' },
  { id: 'integrate', label: 'Existing GIS Integration', section: 'B' },
  { id: 'delineate', label: 'Boundary Delineation', section: 'B' },
  { id: 'generate', label: 'Preliminary Parcel Generation', section: 'B' }
];

export default function GISParcel() {
  const navigate = useNavigate();
  
  const [phase, setPhase] = useState('initial'); // initial | preparing | processing | completed | empty
  const [demoAlert, setDemoAlert] = useState(null); // 'warning' | 'error' | null
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedParcel, setSelectedParcel] = useState(null);
  
  const [metrics, setMetrics] = useState({
    buildings: 0, roads: 0, vectors: 0, existingParcels: 0, prelimParcels: 0
  });

  const [layers, setLayers] = useState({
    existing: true,
    ai: true,
    prelim: true
  });

  const startProcessing = () => {
    setPhase('preparing');
    setTimeout(() => {
      setPhase('processing');
      setCurrentIdx(0);
      setProgress(0);
    }, 2000);
  };

  useEffect(() => {
    if (phase !== 'processing' || demoAlert === 'error') return;

    let advanced = false;

    const tick = setInterval(() => {
      if (demoAlert === 'warning' || advanced) return;

      setProgress(p => {
        if (p >= 100) return 100;
        const nextP = p + Math.floor(Math.random() * 8) + 2;
        
        // Progressively increment metrics based on stage
        setMetrics(m => ({
          ...m,
          buildings: currentIdx >= 2 ? Math.min(1501, m.buildings + 20) : 0,
          roads: currentIdx >= 2 ? Math.min(842, m.roads + 10) : 0,
          vectors: currentIdx >= 3 ? Math.min(4318, m.vectors + 50) : 0,
          existingParcels: currentIdx >= 5 ? 1928 : 0,
          prelimParcels: currentIdx >= 7 ? Math.min(2214, m.prelimParcels + 30) : 0
        }));

        if (nextP >= 100) {
          advanced = true;
          if (currentIdx < PIPELINE.length - 1) {
            setTimeout(() => {
              setCurrentIdx(idx => Math.min(idx + 1, PIPELINE.length - 1));
              setProgress(0);
            }, 500);
          } else {
            setTimeout(() => {
              setPhase('completed');
              // Ensure final totals are exact upon completion
              setMetrics({
                buildings: 1501, roads: 842, vectors: 4318, existingParcels: 1928, prelimParcels: 2214
              });
            }, 600);
          }
          return 100;
        }
        return nextP;
      });
    }, 120);

    return () => clearInterval(tick);
  }, [phase, currentIdx, demoAlert]);

  const currentStage = PIPELINE[currentIdx] || PIPELINE[PIPELINE.length - 1];
  const isSectionA = currentStage.section === 'A';

  const getStatusMessage = () => {
    if (phase === 'preparing') return 'Preparing vector conversion...';
    if (phase === 'completed') return 'Cadastral parcels generated.';
    switch(currentStage.id) {
      case 'refine': return 'Refining AI feature masks...';
      case 'contour': return 'Extracting feature contours...';
      case 'polygon': return 'Polygonizing raster to vector...';
      case 'simplify': return 'Simplifying geometry boundaries...';
      case 'classify': return 'Classifying structural layers...';
      case 'integrate': return 'Loading existing GIS reference...';
      case 'delineate': return 'Delineating cadastral boundaries...';
      case 'generate': return 'Generating preliminary parcels...';
      default: return 'Processing...';
    }
  };

  // SVG State Derivations
  const isCompleted = phase === 'completed';
  const showRaster = (currentIdx <= 1 && !isCompleted);
  const rasterBlur = currentIdx === 0 && !isCompleted ? 'blur(4px)' : 'blur(1px)';
  
  const showContour = (currentIdx === 2 && !isCompleted);
  const showVector = (currentIdx >= 3 || isCompleted);
  const isSimplified = (currentIdx >= 4 || isCompleted);
  
  const showExisting = (currentIdx >= 5 || isCompleted) && layers.existing;
  const showDelineation = (currentIdx >= 6 || isCompleted);
  const showParcels = (currentIdx >= 7 || isCompleted) && layers.prelim;
  const showAIFeatures = layers.ai;

  return (
    <div className="screen-wrap">
      
      {/* Topbar */}
      <div className="screen-topbar" style={{ background: 'var(--surface-panel)', zIndex: 10 }}>
        <div>
          <div className="screen-title">GIS Conversion &amp; Parcel Generation</div>
          <div className="screen-subtitle">Vectorization and boundary delineation pipeline</div>
        </div>
        <div className="screen-topbar-actions" style={{ gap: 'var(--sp-4)' }}>
          <div style={{ textAlign: 'right' }}>
            <button 
              className={`btn ${phase === 'completed' ? 'btn-primary' : ''}`} 
              disabled={phase !== 'completed'}
              onClick={() => navigate('/validation')}
              style={{ 
                padding: '8px 16px', fontSize: 11, fontWeight: 800,
                background: phase === 'completed' ? 'var(--c-secondary)' : 'var(--surface-bg)', 
                color: phase === 'completed' ? 'white' : 'var(--c-ink-muted)', 
                opacity: phase === 'completed' ? 1 : 0.6,
                border: `1px solid ${phase === 'completed' ? 'var(--c-secondary)' : 'var(--border)'}`,
                cursor: phase === 'completed' ? 'pointer' : 'not-allowed'
              }}
            >
              CONTINUE TO VALIDATION
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 6 }} width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--c-ink-muted)', marginTop: 4 }}>
              {phase === 'completed' ? 'GIS conversion complete — continue to validation.' : 'Complete GIS conversion to continue.'}
            </div>
          </div>
        </div>
      </div>

      <div className="screen-body screen-body--pad scroll-y" style={{ maxWidth: 1400, margin: '0 auto', width: '100%', paddingBottom: 'var(--sp-10)' }}>
        
        {/* Empty State Prototype trigger if needed */}
        {phase === 'empty' && (
          <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="panel" style={{ padding: 'var(--sp-8)', width: 420, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-4)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(207,101,92,0.1)', color: 'var(--c-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: '.03em', marginBottom: 4 }}>NO AI FEATURES AVAILABLE</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-ink-muted)' }}>Complete AI feature extraction before starting GIS conversion.</div>
              </div>
              <button className="btn btn-secondary" onClick={() => navigate('/ai-processing')} style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--sp-2)' }}>BACK TO AI PROCESSING</button>
            </div>
          </div>
        )}

        {/* Initial State */}
        {phase === 'initial' && (
          <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="panel" style={{ padding: 'var(--sp-8)', width: 420, display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: '.03em', marginBottom: 4 }}>GIS CONVERSION READY</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-ink-muted)' }}>Source: Gujarat Sector 04 &bull; Input: AI Feature Masks</div>
              </div>
              
              <div style={{ background: 'var(--surface-bg)', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.05em', marginBottom: 'var(--sp-3)' }}>LAYERS AVAILABLE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-ink)' }}><span style={{ color: 'var(--c-amber)', marginRight: 6 }}>●</span>Buildings</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-ink)' }}><span style={{ color: 'var(--c-ink-muted)', marginRight: 6 }}>●</span>Roads</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-ink)' }}><span style={{ color: 'var(--c-secondary)', marginRight: 6 }}>●</span>Vegetation</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-ink)' }}><span style={{ color: 'var(--c-cyan)', marginRight: 6 }}>●</span>Open Land</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--c-ink)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-secondary)" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                  AI extraction completed
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--c-primary)' }}>
                  <span style={{ color: 'var(--c-cyan)' }}>●</span> Ready for GIS conversion
                </div>
              </div>

              <button className="btn btn-primary" onClick={startProcessing} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 12, background: 'var(--c-cyan)' }}>
                START GIS CONVERSION
              </button>
            </div>
          </div>
        )}

        {/* Preparing State */}
        {phase === 'preparing' && (
          <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-4)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(90,174,188,0.2)', borderTopColor: 'var(--c-cyan)', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: '.05em' }}>PREPARING FEATURE LAYERS...</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)' }}>Loading AI masks...</div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Main Workspace */}
        {(phase === 'processing' || phase === 'completed') && (
          <div style={{ display: 'flex', gap: 'var(--sp-6)', height: '100%' }}>
            
            {/* LEFT: Pipeline */}
            <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.08em', marginBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  SECTION A: POST-PROCESSING &amp; GIS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  {PIPELINE.filter(p => p.section === 'A').map((p, i) => {
                    const idx = i;
                    const state = phase === 'completed' || currentIdx > idx ? 'completed' : currentIdx === idx ? 'current' : 'pending';
                    return <PipelineItem key={p.id} stage={p} num={`0${idx + 1}`} state={state} progress={state === 'current' ? progress : 0} />;
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.08em', marginBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  SECTION B: PARCEL GENERATION
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  {PIPELINE.filter(p => p.section === 'B').map((p, i) => {
                    const idx = i + 5;
                    const state = phase === 'completed' || currentIdx > idx ? 'completed' : currentIdx === idx ? 'current' : 'pending';
                    return <PipelineItem key={p.id} stage={p} num={`0${idx + 1}`} state={state} progress={state === 'current' ? progress : 0} />;
                  })}
                </div>
              </div>

              {/* Dev Controls */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: 6, opacity: 0.2, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=0.2}>
                 <button className="btn btn-ghost" style={{ fontSize: 9, padding: 4 }} onClick={() => setDemoAlert('warning')}>⚠ Warn</button>
                 <button className="btn btn-ghost" style={{ fontSize: 9, padding: 4 }} onClick={() => setDemoAlert('error')}>✕ Err</button>
                 <button className="btn btn-ghost" style={{ fontSize: 9, padding: 4 }} onClick={() => setDemoAlert(null)}>Clear</button>
              </div>
            </div>

            {/* CENTER: Visual Transformation Hero */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--sp-3)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary)', background: 'var(--surface-panel)', padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  {getStatusMessage()}
                </div>
              </div>

              <div style={{ flex: 1, background: 'var(--surface-panel)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 540 }}>
                
                {/* Layer Toggle (Map Comparison) */}
                {(isCompleted || currentIdx >= 5) && (
                  <div style={{ position: 'absolute', top: 'var(--sp-4)', right: 'var(--sp-4)', zIndex: 10, background: 'rgba(255,255,255,0.95)', padding: '8px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 6, backdropFilter: 'blur(4px)' }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.05em', marginBottom: 2 }}>LAYERS</div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      <input type="checkbox" checked={layers.existing} onChange={e => setLayers({...layers, existing: e.target.checked})} />
                      <span style={{ color: 'var(--c-gis-blue)' }}>Existing GIS</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      <input type="checkbox" checked={layers.ai} onChange={e => setLayers({...layers, ai: e.target.checked})} />
                      <span>AI Features</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      <input type="checkbox" checked={layers.prelim} onChange={e => setLayers({...layers, prelim: e.target.checked})} />
                      <span style={{ color: 'var(--c-secondary)' }}>Preliminary Parcels</span>
                    </label>
                  </div>
                )}

                {/* SVG Geospatial Transformation */}
                <div style={{ flex: 1, position: 'relative', background: 'var(--c-mist)', overflow: 'hidden' }}>
                  <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
                    
                    {/* Topo base for context */}
                    <path d="M0 250 Q 200 200 400 300 T 800 250 M0 100 Q 250 150 500 50 T 800 100" fill="none" stroke="rgba(16,63,58,0.04)" strokeWidth="1" />
                    
                    {/* --- STATE 1 & 2: RASTER AI MASKS --- */}
                    {showRaster && showAIFeatures && (
                      <g style={{ filter: rasterBlur, transition: 'filter 1s ease-out' }}>
                        {/* Buildings (Amber) */}
                        <path d="M220 180 L290 190 L280 260 L210 250 Z" fill="var(--c-warning)" opacity="0.6" />
                        <path d="M420 150 L520 160 L510 220 L410 210 Z" fill="var(--c-warning)" opacity="0.6" />
                        {/* Road (Ink/Muted) */}
                        <path d="M0 400 Q 400 350 800 380 L800 420 Q 400 390 0 440 Z" fill="rgba(22,37,34,0.4)" />
                        {/* Veg (Cyan) */}
                        <circle cx="600" cy="120" r="70" fill="var(--c-cyan)" opacity="0.4" />
                        <circle cx="150" cy="350" r="60" fill="var(--c-cyan)" opacity="0.4" />
                      </g>
                    )}

                    {/* --- STATE 3: CONTOUR EXTRACTION --- */}
                    {showContour && showAIFeatures && (
                      <g>
                        <path d="M220 180 L290 190 L280 260 L210 250 Z" fill="none" stroke="var(--c-warning)" strokeWidth="3" strokeDasharray="1000" strokeDashoffset={1000 - (progress*10)} style={{ transition: 'stroke-dashoffset 0.2s linear' }} />
                        <path d="M420 150 L520 160 L510 220 L410 210 Z" fill="none" stroke="var(--c-warning)" strokeWidth="3" strokeDasharray="1000" strokeDashoffset={1000 - (progress*10)} />
                        <path d="M0 400 Q 400 350 800 380" fill="none" stroke="rgba(22,37,34,0.8)" strokeWidth="3" strokeDasharray="1200" strokeDashoffset={1200 - (progress*12)} />
                        <path d="M0 440 Q 400 390 800 420" fill="none" stroke="rgba(22,37,34,0.8)" strokeWidth="3" strokeDasharray="1200" strokeDashoffset={1200 - (progress*12)} />
                      </g>
                    )}

                    {/* --- STATE 4 & 5: VECTOR FEATURES & SIMPLIFICATION --- */}
                    {showVector && showAIFeatures && (
                      <g style={{ opacity: 0.9, transition: 'opacity 0.5s' }}>
                        {/* Vector Buildings (Simplified logic uses sharper corners/thinner stroke) */}
                        <path d={isSimplified ? "M222 182 L288 191 L279 258 L213 249 Z" : "M220 180 L290 190 L280 260 L210 250 Z"} fill="rgba(213,163,71,0.5)" stroke="var(--c-warning)" strokeWidth={isSimplified ? 1.5 : 3} style={{ transition: 'all 0.5s' }} />
                        <path d={isSimplified ? "M422 152 L518 161 L509 218 L413 209 Z" : "M420 150 L520 160 L510 220 L410 210 Z"} fill="rgba(213,163,71,0.5)" stroke="var(--c-warning)" strokeWidth={isSimplified ? 1.5 : 3} style={{ transition: 'all 0.5s' }} />
                        
                        {/* Vector Road */}
                        <path d={isSimplified ? "M0 400 L400 360 L800 380 L800 420 L400 400 L0 440 Z" : "M0 400 Q 400 350 800 380 L800 420 Q 400 390 0 440 Z"} fill="rgba(22,37,34,0.15)" stroke="rgba(22,37,34,0.5)" strokeWidth={1} style={{ transition: 'all 0.5s' }} />
                        
                        {/* Labels appear on simplification */}
                        {isSimplified && (
                          <g style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, fill: 'var(--c-ink-muted)' }}>
                            <text x="235" y="225">BLDG</text>
                            <text x="450" y="190">BLDG</text>
                            <text x="400" y="395">ROAD SEGMENT</text>
                          </g>
                        )}
                      </g>
                    )}

                    {/* --- STATE 6: EXISTING GIS INTEGRATION --- */}
                    {showExisting && (
                      <g style={{ opacity: currentIdx === 5 ? progress/100 : 1, transition: 'opacity 0.3s' }}>
                        {/* Existing Cadastral Lines (Blue) */}
                        <path d="M180 50 L150 300 L350 330 L380 80 Z" fill="none" stroke="var(--c-gis-blue)" strokeWidth="2" strokeDasharray="6,4" />
                        <path d="M380 80 L350 330 L600 360 L630 110 Z" fill="none" stroke="var(--c-gis-blue)" strokeWidth="2" strokeDasharray="6,4" />
                        <text x="190" y="70" fontFamily="var(--font-mono)" fontSize="10" fill="var(--c-gis-blue)" opacity="0.8">E-PARCEL 44A</text>
                        <text x="390" y="100" fontFamily="var(--font-mono)" fontSize="10" fill="var(--c-gis-blue)" opacity="0.8">E-PARCEL 44B</text>
                      </g>
                    )}

                    {/* --- STATE 7: BOUNDARY DELINEATION --- */}
                    {showDelineation && showParcels && (
                      <g>
                        {/* Tracing new boundaries connecting AI logic with Existing GIS */}
                        <path d="M180 50 L140 310 L345 330 L380 80 Z" fill="none" stroke="var(--c-secondary)" strokeWidth="3" opacity="0.8" strokeDasharray="1500" strokeDashoffset={currentIdx === 6 ? 1500 - (progress*15) : 0} style={{ transition: 'stroke-dashoffset 0.2s linear' }} />
                        <path d="M380 80 L345 330 L610 355 L630 110 Z" fill="none" stroke="var(--c-secondary)" strokeWidth="3" opacity="0.8" strokeDasharray="1500" strokeDashoffset={currentIdx === 6 ? 1500 - (progress*15) : 0} style={{ transition: 'stroke-dashoffset 0.2s linear' }} />
                      </g>
                    )}

                    {/* --- STATE 8: PRELIMINARY PARCEL GENERATION --- */}
                    {showParcels && (
                      <g style={{ opacity: currentIdx === 7 ? progress/100 : 1, transition: 'opacity 0.5s' }}>
                        {/* Filled Green Polygons with transparency */}
                        <polygon points="180,50 140,310 345,330 380,80" fill="rgba(78,143,115,0.15)" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => isCompleted && setSelectedParcel('P-002')}
                          onMouseEnter={(e) => { if(isCompleted) e.target.style.fill = 'rgba(78,143,115,0.25)' }}
                          onMouseLeave={(e) => { if(isCompleted) e.target.style.fill = 'rgba(78,143,115,0.15)' }}
                        />
                        <polygon points="380,80 345,330 610,355 630,110" fill="rgba(78,143,115,0.15)" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => isCompleted && setSelectedParcel('P-003')}
                          onMouseEnter={(e) => { if(isCompleted) e.target.style.fill = 'rgba(78,143,115,0.25)' }}
                          onMouseLeave={(e) => { if(isCompleted) e.target.style.fill = 'rgba(78,143,115,0.15)' }}
                        />
                        
                        <text x="230" y="280" fontFamily="var(--font)" fontSize="12" fontWeight="800" fill="var(--c-secondary)" pointerEvents="none">P-002</text>
                        <text x="230" y="295" fontFamily="var(--font-mono)" fontSize="9" fontWeight="600" fill="var(--c-ink-muted)" pointerEvents="none">PRELIMINARY</text>
                        
                        <text x="460" y="290" fontFamily="var(--font)" fontSize="12" fontWeight="800" fill="var(--c-secondary)" pointerEvents="none">P-003</text>
                        <text x="460" y="305" fontFamily="var(--font-mono)" fontSize="9" fontWeight="600" fill="var(--c-ink-muted)" pointerEvents="none">PRELIMINARY</text>
                      </g>
                    )}
                  </svg>
                </div>

                {/* Parcel Selection Overlay */}
                {selectedParcel && (
                  <div style={{ position: 'absolute', bottom: 'var(--sp-4)', left: 'var(--sp-4)', background: 'rgba(255,255,255,0.95)', border: '1px solid var(--c-secondary)', borderRadius: 'var(--r-md)', padding: '16px', boxShadow: 'var(--shadow-md)', zIndex: 20, width: 240, backdropFilter: 'blur(4px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-primary)' }}>PARCEL {selectedParcel}</div>
                      <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setSelectedParcel(null)}>✕</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 'var(--sp-4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ fontWeight: 600, color: 'var(--c-ink-muted)' }}>Area</span>
                        <span style={{ fontWeight: 700, color: 'var(--c-ink)', fontFamily: 'var(--font-mono)' }}>{selectedParcel === 'P-003' ? '1,735 m²' : '1,420 m²'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ fontWeight: 600, color: 'var(--c-ink-muted)' }}>Source</span>
                        <span style={{ fontWeight: 700, color: 'var(--c-ink)' }}>AI + Existing GIS</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--c-ink-muted)' }}>Status</span>
                        <span style={{ fontWeight: 800, color: 'var(--c-amber)', fontSize: 10, background: 'rgba(217,173,88,0.1)', padding: '2px 6px', borderRadius: 'var(--r-sm)' }}>PRELIMINARY</span>
                      </div>
                    </div>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 11 }}>VIEW GEOMETRY</button>
                  </div>
                )}
              </div>

              {/* Warning/Error Overlays */}
              {demoAlert === 'warning' && (
                <div style={{ position: 'absolute', bottom: 'var(--sp-4)', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-panel)', border: '1px solid var(--c-amber)', borderLeft: '4px solid var(--c-amber)', padding: '12px 16px', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', zIndex: 30 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-amber)', letterSpacing: '.05em' }}>⚠ GEOMETRY SIMPLIFICATION NOTICE</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-ink)' }}>Small fragmented polygons detected. Continue with simplification?</div>
                  </div>
                  <button className="btn btn-secondary" onClick={() => setDemoAlert(null)} style={{ fontSize: 10, padding: '4px 12px' }}>CONTINUE</button>
                </div>
              )}

              {demoAlert === 'error' && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                   <div className="panel" style={{ padding: 'var(--sp-6)', borderLeft: '4px solid var(--c-coral)', maxWidth: 400, textAlign: 'center' }}>
                     <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-coral)', letterSpacing: '.05em', marginBottom: 8 }}>GIS CONVERSION INTERRUPTED</div>
                     <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-ink)', marginBottom: 'var(--sp-5)' }}>Unable to vectorize selected tile. Geometry missing.</div>
                     <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
                       <button className="btn btn-secondary" onClick={() => setDemoAlert(null)}>SKIP TILE</button>
                       <button className="btn btn-primary" style={{ background: 'var(--c-coral)' }} onClick={() => setDemoAlert(null)}>RETRY</button>
                     </div>
                   </div>
                </div>
              )}

            </div>

            {/* RIGHT: Live Conversion Insights */}
            <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              
              <div className="panel" style={{ padding: 'var(--sp-4)' }}>
                <div className="sec-heading">GIS CONVERSION STATUS</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase' }}>Project</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink)' }}>Gujarat Sector 04</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-3)' }}>
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
              </div>

              {/* Vector Features List */}
              <div className="panel" style={{ padding: 'var(--sp-4)' }}>
                <div className="sec-heading">FEATURES VECTORISED</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <FeatureStat label="Buildings" count={metrics.buildings} active={currentIdx >= 2 || isCompleted} />
                  <FeatureStat label="Road Segments" count={metrics.roads} active={currentIdx >= 2 || isCompleted} />
                  <FeatureStat label="Vector Features Total" count={metrics.vectors} active={currentIdx >= 3 || isCompleted} />
                </div>
              </div>

              {/* Parcel Generation List */}
              <div className="panel" style={{ padding: 'var(--sp-4)', flex: 1 }}>
                <div className="sec-heading">PARCEL GENERATION</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <FeatureStat label="Existing Parcels" count={metrics.existingParcels} active={currentIdx >= 5 || isCompleted} />
                  <FeatureStat label="Preliminary Parcels" count={metrics.prelimParcels} active={currentIdx >= 7 || isCompleted} />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Completion CTA */}
        {phase === 'completed' && (
          <div style={{ marginTop: 'var(--sp-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-panel)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 'var(--sp-4) var(--sp-5)', boxShadow: 'var(--shadow-md)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 2 }}>PRELIMINARY CADASTRAL MAP</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)' }}>NEXT: TOPOLOGY VALIDATION + CONFIDENCE SCORING</div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
              <button className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: 12 }}>
                VIEW GENERATED LAYERS
              </button>
            </div>
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
      
      {isCurrent && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(90,174,188,0.04)', width: `${progress}%`, transition: 'width 0.2s', zIndex: 0 }} />
      )}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', width: '100%', gap: 'var(--sp-3)' }}>
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
