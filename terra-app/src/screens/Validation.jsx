import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/ui.css';
import './screens.css';

const PIPELINE = [
  { id: 'overlap', label: 'Overlap Detection', section: 'A' },
  { id: 'gap', label: 'Gap / Unassigned Area Detection', section: 'A' },
  { id: 'invalid', label: 'Invalid Geometry Detection', section: 'A' },
  { id: 'sliver', label: 'Self-Intersection / Sliver Detection', section: 'A' },
  { id: 'duplicate', label: 'Duplicate Parcel Detection', section: 'A' },
  { id: 'confidence', label: 'Confidence Scoring', section: 'B' },
  { id: 'flagging', label: 'Parcel Flagging', section: 'B' }
];

export default function Validation() {
  const navigate = useNavigate();
  
  const [phase, setPhase] = useState('initial'); // initial | processing | completed | empty
  const [demoAlert, setDemoAlert] = useState(null); // 'warning' | 'error' | null
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL | HIGH | REVIEW | LOW | ISSUES

  // Start processing sequence
  const startProcessing = () => {
    setPhase('processing');
    setCurrentIdx(0);
    setProgress(0);
  };

  // Processing loop (defensive to prevent multiple state increments)
  useEffect(() => {
    if (phase !== 'processing' || demoAlert === 'error') return;

    let advanced = false;

    const tick = setInterval(() => {
      if (demoAlert === 'warning' || advanced) return;

      setProgress(p => {
        if (p >= 100) return 100;
        const nextP = p + Math.floor(Math.random() * 12) + 4; // faster progress
        
        if (nextP >= 100) {
          advanced = true;
          if (currentIdx < PIPELINE.length - 1) {
            setTimeout(() => {
              setCurrentIdx(idx => Math.min(idx + 1, PIPELINE.length - 1));
              setProgress(0);
            }, 600); // clear pause before next step
          } else {
            setTimeout(() => setPhase('completed'), 800);
          }
          return 100;
        }
        return nextP;
      });
    }, 150);

    return () => clearInterval(tick);
  }, [phase, currentIdx, demoAlert]);

  const currentStage = PIPELINE[currentIdx] || PIPELINE[PIPELINE.length - 1];
  const isSectionA = currentStage.section === 'A';
  const isCompleted = phase === 'completed';

  const getStatusMessage = () => {
    if (isCompleted) return 'Validation analysis complete.';
    switch(currentStage.id) {
      case 'overlap': return 'Checking for overlapping parcel boundaries...';
      case 'gap': return 'Detecting unassigned spatial gaps...';
      case 'invalid': return 'Verifying polygon geometry integrity...';
      case 'sliver': return 'Scanning for slivers and self-intersections...';
      case 'duplicate': return 'Identifying duplicate geometries...';
      case 'confidence': return 'Calculating ML confidence scores...';
      case 'flagging': return 'Flagging uncertain areas for review...';
      default: return 'Validating...';
    }
  };

  // Safe metrics calculations based on progress state
  const analyzedCount = isCompleted ? 2214 : Math.floor((currentIdx / PIPELINE.length) * 2214 + (progress / 100) * (2214 / PIPELINE.length));
  
  return (
    <div className="screen-wrap">
      
      {/* Topbar */}
      <div className="screen-topbar" style={{ background: 'var(--surface-panel)', zIndex: 10 }}>
        <div>
          <div className="screen-title">TOPOLOGY VALIDATION</div>
          <div className="screen-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Confidence &amp; Geometry Analysis 
            <span style={{ color: 'var(--c-ink-muted)' }}>&bull;</span> 
            Project: Gujarat Sector 04
          </div>
        </div>
        <div className="screen-topbar-actions" style={{ gap: 'var(--sp-4)' }}>
          <div style={{ textAlign: 'right' }}>
            <button 
              className={`btn ${phase === 'completed' ? 'btn-primary' : ''}`} 
              disabled={phase !== 'completed'}
              onClick={() => navigate('/storage')}
              style={{ 
                padding: '8px 16px', fontSize: 11, fontWeight: 800,
                background: phase === 'completed' ? 'var(--c-secondary)' : 'var(--surface-bg)', 
                color: phase === 'completed' ? 'white' : 'var(--c-ink-muted)', 
                opacity: phase === 'completed' ? 1 : 0.6,
                border: `1px solid ${phase === 'completed' ? 'var(--c-secondary)' : 'var(--border)'}`,
                cursor: phase === 'completed' ? 'pointer' : 'not-allowed'
              }}
            >
              CONTINUE TO SPATIAL STORAGE
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 6 }} width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--c-ink-muted)', marginTop: 4 }}>
              {phase === 'completed' ? 'Validation complete — continue to spatial storage.' : 'Complete validation to continue.'}
            </div>
          </div>
        </div>
      </div>

      <div className="screen-body screen-body--pad scroll-y" style={{ maxWidth: 1400, margin: '0 auto', width: '100%', paddingBottom: 'var(--sp-10)' }}>
        
        {/* Empty State */}
        {phase === 'empty' && (
          <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="panel" style={{ padding: 'var(--sp-8)', width: 420, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-4)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(207,101,92,0.1)', color: 'var(--c-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: '.03em', marginBottom: 4 }}>NO PRELIMINARY PARCELS</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-ink-muted)' }}>Complete GIS conversion and parcel generation before running topology validation.</div>
              </div>
              <button className="btn btn-secondary" onClick={() => navigate('/gis-parcel')} style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--sp-2)' }}>BACK TO GIS CONVERSION</button>
            </div>
          </div>
        )}

        {/* Initial State */}
        {phase === 'initial' && (
          <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="panel" style={{ padding: 'var(--sp-8)', width: 420, display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(90,174,188,0.1)', color: 'var(--c-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: '.03em', marginBottom: 4 }}>READY FOR VALIDATION</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-ink-muted)' }}>2,214 preliminary parcels available.</div>
              </div>
              
              <div style={{ background: 'var(--surface-bg)', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', textAlign: 'left' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink)' }}>Before cadastral data is accepted, the system checks geometry and determines where human attention may be required.</div>
              </div>

              <button className="btn btn-primary" onClick={startProcessing} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 12, background: 'var(--c-cyan)' }}>
                RUN TOPOLOGY VALIDATION
              </button>
            </div>
          </div>
        )}

        {/* Main Workspace */}
        {(phase === 'processing' || phase === 'completed') && (
          <div style={{ display: 'flex', gap: 'var(--sp-6)', height: '100%' }}>
            
            {/* LEFT: Pipeline */}
            <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.08em', marginBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  TOPOLOGY CHECKS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  {PIPELINE.filter(p => p.section === 'A').map((p, i) => {
                    const idx = i;
                    const state = isCompleted || currentIdx > idx ? 'completed' : currentIdx === idx ? 'current' : 'pending';
                    return <PipelineItem key={p.id} stage={p} num={`0${idx + 1}`} state={state} progress={state === 'current' ? progress : 0} />;
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.08em', marginBottom: 'var(--sp-3)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  CONFIDENCE ANALYSIS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  {PIPELINE.filter(p => p.section === 'B').map((p, i) => {
                    const idx = i + 5;
                    const state = isCompleted || currentIdx > idx ? 'completed' : currentIdx === idx ? 'current' : 'pending';
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

            {/* CENTER: Validation Map */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--sp-3)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary)', background: 'var(--surface-panel)', padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  {getStatusMessage()}
                </div>
              </div>

              <div style={{ flex: 1, background: 'var(--surface-panel)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 540 }}>
                
                {/* Filters */}
                {(isCompleted || currentIdx >= 5) && (
                  <div style={{ position: 'absolute', top: 'var(--sp-4)', left: 'var(--sp-4)', zIndex: 10, display: 'flex', gap: 6 }}>
                    {['ALL', 'HIGH', 'REVIEW', 'LOW', 'ISSUES'].map(f => (
                      <button key={f} 
                        style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: '.05em', cursor: 'pointer', padding: '6px 12px', borderRadius: 'var(--r-sm)',
                          background: filter === f ? 'var(--c-ink)' : 'var(--surface-panel)', 
                          color: filter === f ? 'white' : 'var(--c-ink)',
                          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s'
                        }}
                        onClick={() => setFilter(f)}
                      >{f}</button>
                    ))}
                  </div>
                )}

                {/* Legend */}
                <div style={{ position: 'absolute', top: 'var(--sp-4)', right: 'var(--sp-4)', zIndex: 10, background: 'rgba(255,255,255,0.95)', padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 8, backdropFilter: 'blur(4px)' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.05em', marginBottom: 2 }}>LEGEND</div>
                  <LegendItem color="var(--c-secondary)" label="High Confidence" />
                  <LegendItem color="var(--c-amber)" label="Review (Medium)" />
                  <LegendItem color="var(--c-coral)" label="Field Verif. (Low)" />
                  <LegendItem color="var(--c-gis-blue)" label="Existing GIS" />
                  <LegendItem color="none" border="2px solid var(--c-coral)" label="Topology Issue" />
                </div>

                {/* SVG Validation Map */}
                <div style={{ flex: 1, position: 'relative', background: '#DCE4DD', overflow: 'hidden' }}>
                  
                  {/* Subtle Grid */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'linear-gradient(var(--c-ink-muted) 1px, transparent 1px), linear-gradient(90deg, var(--c-ink-muted) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

                  <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
                    
                    {/* Road Context */}
                    <path d="M0 400 L400 360 L800 380 L800 420 L400 400 L0 440 Z" fill="rgba(22,37,34,0.05)" stroke="rgba(22,37,34,0.2)" strokeWidth={1} />
                    
                    {/* Existing Boundaries */}
                    <path d="M180 50 L150 300 L350 330 L380 80 Z" fill="none" stroke="var(--c-gis-blue)" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                    <path d="M380 80 L350 330 L600 360 L630 110 Z" fill="none" stroke="var(--c-gis-blue)" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />

                    {/* PARCEL P-001 (High Confidence) */}
                    {(filter === 'ALL' || filter === 'HIGH') && (
                      <g>
                        <polygon points="50,20 180,50 150,300 10,250" fill={isCompleted || currentIdx >= 5 ? "rgba(78,143,115,0.15)" : "rgba(16,63,58,0.05)"} stroke={isCompleted || currentIdx >= 5 ? "var(--c-secondary)" : "rgba(16,63,58,0.3)"} strokeWidth="2" 
                          style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                          onClick={() => isCompleted && setSelectedParcel({ id: 'P001', area: '2,104 m²', conf: 92, label: 'HIGH CONFIDENCE', action: 'ACCEPT', issues: 'None' })}
                        />
                        {(isCompleted || currentIdx >= 6) && <text x="80" y="150" fontFamily="var(--font-mono)" fontSize="10" fill="var(--c-secondary)" fontWeight="700">92%</text>}
                      </g>
                    )}

                    {/* PARCEL P-004 (High Confidence) */}
                    {(filter === 'ALL' || filter === 'HIGH') && (
                      <g>
                        <polygon points="630,110 600,360 780,380 790,130" fill={isCompleted || currentIdx >= 5 ? "rgba(78,143,115,0.15)" : "rgba(16,63,58,0.05)"} stroke={isCompleted || currentIdx >= 5 ? "var(--c-secondary)" : "rgba(16,63,58,0.3)"} strokeWidth="2" 
                          style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                          onClick={() => isCompleted && setSelectedParcel({ id: 'P004', area: '1,990 m²', conf: 88, label: 'HIGH CONFIDENCE', action: 'ACCEPT', issues: 'None' })}
                        />
                        {(isCompleted || currentIdx >= 6) && <text x="700" y="250" fontFamily="var(--font-mono)" fontSize="10" fill="var(--c-secondary)" fontWeight="700">88%</text>}
                      </g>
                    )}

                    {/* PARCEL P-002 (Medium/Review + Overlap Issue) */}
                    {(filter === 'ALL' || filter === 'REVIEW' || filter === 'ISSUES') && (
                      <g>
                        <polygon points="180,50 140,310 345,330 380,80" fill={isCompleted || currentIdx >= 5 ? "rgba(217,173,88,0.15)" : "rgba(16,63,58,0.05)"} stroke={isCompleted || currentIdx >= 5 ? "var(--c-amber)" : "rgba(16,63,58,0.3)"} strokeWidth="2" 
                          style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                          onClick={() => isCompleted && setSelectedParcel({ id: 'P002', area: '1,420 m²', conf: 75, label: 'MEDIUM CONFIDENCE', action: 'REVIEW', issues: 'Overlap detected on Eastern boundary.' })}
                        />
                        {/* Topology Issue: Overlap (shows during check 0 and after) */}
                        {(isCompleted || currentIdx >= 0) && (filter === 'ALL' || filter === 'ISSUES' || filter === 'REVIEW') && (
                           <path d="M345 330 L355 330 L390 80 L380 80 Z" fill="rgba(207,101,92,0.6)" stroke="var(--c-coral)" strokeWidth="1" />
                        )}
                        {(isCompleted || currentIdx >= 6) && <text x="240" y="200" fontFamily="var(--font-mono)" fontSize="10" fill="var(--c-amber)" fontWeight="700">75%</text>}
                      </g>
                    )}

                    {/* PARCEL P-003 (Low/Field Verif + Geometry Issue) */}
                    {(filter === 'ALL' || filter === 'LOW' || filter === 'ISSUES') && (
                      <g>
                        <polygon points="380,80 345,330 610,355 630,110" fill={isCompleted || currentIdx >= 5 ? "rgba(207,101,92,0.1)" : "rgba(16,63,58,0.05)"} stroke={isCompleted || currentIdx >= 5 ? "var(--c-coral)" : "rgba(16,63,58,0.3)"} strokeWidth="2" 
                          style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                          onClick={() => isCompleted && setSelectedParcel({ id: 'P003', area: '1,735 m²', conf: 48, label: 'LOW CONFIDENCE', action: 'FIELD VERIFICATION', issues: 'Invalid geometry / Sliver detected.' })}
                        />
                        {/* Topology Issue: Sliver (shows during check 3 and after) */}
                        {(isCompleted || currentIdx >= 3) && (filter === 'ALL' || filter === 'ISSUES' || filter === 'LOW') && (
                           <path d="M610 355 L630 350 L630 110 L610 120 Z" fill="rgba(207,101,92,0.4)" stroke="var(--c-coral)" strokeWidth="1" />
                        )}
                        {(isCompleted || currentIdx >= 6) && <text x="480" y="220" fontFamily="var(--font-mono)" fontSize="10" fill="var(--c-coral)" fontWeight="700">48%</text>}
                      </g>
                    )}

                    {/* Validation Scanning Line Effect (Only during processing phase) */}
                    {phase === 'processing' && !demoAlert && (
                      <line x1="0" y1="0" x2="0" y2="500" stroke="var(--c-cyan)" strokeWidth="2" opacity="0.6" style={{ transform: `translateX(${progress * 8}px)`, transition: 'transform 0.1s linear' }} />
                    )}
                  </svg>
                </div>

                {/* Parcel Selection Overlay */}
                {selectedParcel && (
                  <div style={{ position: 'absolute', bottom: 'var(--sp-4)', left: 'var(--sp-4)', background: 'rgba(255,255,255,0.95)', border: `1px solid ${selectedParcel.conf >= 85 ? 'var(--c-secondary)' : selectedParcel.conf >= 60 ? 'var(--c-amber)' : 'var(--c-coral)'}`, borderRadius: 'var(--r-md)', padding: '16px', boxShadow: 'var(--shadow-md)', zIndex: 20, width: 260, backdropFilter: 'blur(4px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-primary)' }}>{selectedParcel.id}</div>
                      <button className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setSelectedParcel(null)}>✕</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--sp-4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ fontWeight: 600, color: 'var(--c-ink-muted)' }}>Area</span>
                        <span style={{ fontWeight: 700, color: 'var(--c-ink)', fontFamily: 'var(--font-mono)' }}>{selectedParcel.area}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--c-ink-muted)' }}>Confidence</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: selectedParcel.conf >= 85 ? 'var(--c-secondary)' : selectedParcel.conf >= 60 ? 'var(--c-amber)' : 'var(--c-coral)' }}>
                            {selectedParcel.conf}%
                          </span>
                        </div>
                      </div>

                      {selectedParcel.issues !== 'None' && (
                        <div style={{ background: 'rgba(207,101,92,0.1)', padding: 8, borderRadius: 'var(--r-sm)', border: '1px solid rgba(207,101,92,0.3)', marginTop: 4 }}>
                          <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-coral)', marginBottom: 2 }}>⚠ TOPOLOGY ISSUE</div>
                          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--c-ink)' }}>{selectedParcel.issues}</div>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', marginBottom: 4 }}>ACTION REQUIRED</div>
                    <button className="btn" style={{ 
                        width: '100%', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                        background: selectedParcel.conf >= 85 ? 'var(--c-secondary)' : 'var(--surface-bg)',
                        color: selectedParcel.conf >= 85 ? '#fff' : 'var(--c-ink)',
                        border: `1px solid ${selectedParcel.conf >= 85 ? 'var(--c-secondary)' : 'var(--border)'}`
                      }}>
                      {selectedParcel.conf >= 85 ? 'ACCEPT PARCEL' : 'VIEW DETAILS'}
                    </button>
                  </div>
                )}
              </div>

              {/* Warning/Error Overlays */}
              {demoAlert === 'warning' && (
                <div style={{ position: 'absolute', bottom: 'var(--sp-4)', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-panel)', border: '1px solid var(--c-amber)', borderLeft: '4px solid var(--c-amber)', padding: '12px 16px', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', zIndex: 30 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-amber)', letterSpacing: '.05em' }}>⚠ TOPOLOGY ISSUES DETECTED</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-ink)' }}>48 parcel geometries require attention. (25 overlaps, 13 gaps)</div>
                  </div>
                  <button className="btn btn-secondary" onClick={() => setDemoAlert(null)} style={{ fontSize: 10, padding: '4px 12px' }}>VIEW FLAGGED AREAS</button>
                </div>
              )}

              {demoAlert === 'error' && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                   <div className="panel" style={{ padding: 'var(--sp-6)', borderLeft: '4px solid var(--c-coral)', maxWidth: 400, textAlign: 'center' }}>
                     <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-coral)', letterSpacing: '.05em', marginBottom: 8 }}>VALIDATION INTERRUPTED</div>
                     <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-ink)', marginBottom: 'var(--sp-5)' }}>Unable to complete topology analysis.</div>
                     <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
                       <button className="btn btn-primary" style={{ background: 'var(--c-coral)' }} onClick={() => setDemoAlert(null)}>RETRY VALIDATION</button>
                     </div>
                   </div>
                </div>
              )}

            </div>

            {/* RIGHT: Validation Summary */}
            <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              
              <div className="panel" style={{ padding: 'var(--sp-4)' }}>
                <div className="sec-heading">VALIDATION SUMMARY</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-3)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase' }}>Parcels Analyzed</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)', fontFamily: 'var(--font-mono)' }}>{analyzedCount.toLocaleString()}</div>
                </div>

                <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.05em', marginBottom: 'var(--sp-3)' }}>TOPOLOGY CHECKS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <ValidationStat label="Overlaps" total={2214} flagged={25} active={currentIdx > 0 || isCompleted} />
                  <ValidationStat label="Gaps" total={2214} flagged={13} active={currentIdx > 1 || isCompleted} />
                  <ValidationStat label="Invalid Geometry" total={2214} flagged={7} active={currentIdx > 2 || isCompleted} />
                  <ValidationStat label="Duplicates" total={2214} flagged={3} active={currentIdx > 4 || isCompleted} />
                </div>
              </div>

              {/* Confidence Distribution */}
              <div className="panel" style={{ padding: 'var(--sp-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="sec-heading">CONFIDENCE DISTRIBUTION</div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--sp-4)', opacity: (currentIdx >= 5 || isCompleted) ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                  
                  {/* HIGH */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-secondary)' }}>HIGH</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--c-ink-muted)' }}>&ge;85% (ACCEPT)</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--c-secondary)' }}>72%</div>
                    </div>
                    <div style={{ height: 6, background: 'rgba(78,143,115,0.15)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: '72%', background: 'var(--c-secondary)', borderRadius: 3 }} />
                    </div>
                  </div>

                  {/* MEDIUM */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-amber)' }}>MEDIUM</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--c-ink-muted)' }}>60–85% (REVIEW)</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--c-amber)' }}>18%</div>
                    </div>
                    <div style={{ height: 6, background: 'rgba(217,173,88,0.15)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: '18%', background: 'var(--c-amber)', borderRadius: 3 }} />
                    </div>
                  </div>

                  {/* LOW */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-coral)' }}>LOW</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--c-ink-muted)' }}>&lt;60% (FIELD VERIF.)</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--c-coral)' }}>10%</div>
                    </div>
                    <div style={{ height: 6, background: 'rgba(207,101,92,0.15)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: '10%', background: 'var(--c-coral)', borderRadius: 3 }} />
                    </div>
                  </div>

                </div>

                {isCompleted && (
                  <div style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-coral)' }}>FLAGGED AREAS</div>
                     <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-coral)', fontFamily: 'var(--font-mono)' }}>48</div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Completion CTA */}
        {phase === 'completed' && (
          <div style={{ marginTop: 'var(--sp-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-panel)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 'var(--sp-4) var(--sp-5)', boxShadow: 'var(--shadow-md)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 2 }}>VALIDATION ANALYSIS COMPLETE</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)' }}>NEXT: POSTGRESQL + POSTGIS SPATIAL STORAGE</div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
              <button className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: 12 }}>
                VIEW FLAGGED AREAS
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

function ValidationStat({ label, total, flagged, active }) {
  if (!active) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.3 }}>
         <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink)' }}>{label}</div>
         <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink-muted)' }}>Pending</div>
      </div>
    );
  }
  const passed = total - flagged;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink)', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', gap: 'var(--sp-3)', fontSize: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--c-secondary)', fontWeight: 700 }}>
          ✓ {passed.toLocaleString()} passed
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--c-amber)', fontWeight: 700 }}>
          ⚠ {flagged} flagged
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, border, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color || 'transparent', border: border || 'none' }} />
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-ink)' }}>{label}</div>
    </div>
  );
}
