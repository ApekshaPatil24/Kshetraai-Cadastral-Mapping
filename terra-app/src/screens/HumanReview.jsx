import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/ui.css';
import './screens.css';

const INITIAL_QUEUE = [
  { id: 'P003', area: '1,735 m²', conf: 48, issue: 'Boundary mismatch', initialStatus: 'Field Verification', type: 'Polygon', source: 'AI + Existing GIS' },
  { id: 'P005', area: '1,632 m²', conf: 63, issue: 'Geometry inconsistency', initialStatus: 'Review', type: 'Polygon', source: 'AI + Existing GIS' },
  { id: 'P008', area: '1,920 m²', conf: 71, issue: 'Minor boundary deviation', initialStatus: 'Review', type: 'Polygon', source: 'AI + Existing GIS' },
  { id: 'P011', area: '1,548 m²', conf: 54, issue: 'Possible overlap', initialStatus: 'Field Verification', type: 'Polygon', source: 'AI + Existing GIS' }
];

export default function HumanReview() {
  const navigate = useNavigate();
  
  // Overall States
  const [phase, setPhase] = useState('loading'); // loading | ready | complete
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStage, setLoadStage] = useState(0);
  const [tempMessage, setTempMessage] = useState(null);

  // Data States
  const [queue, setQueue] = useState(INITIAL_QUEUE.map(q => ({ ...q, currentStatus: q.initialStatus })));
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, REVIEW, FIELD VERIFICATION, APPROVED

  // Action States
  const [viewMode, setViewMode] = useState('overlay'); // ai, reference, overlay
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [verifyingStep, setVerifyingStep] = useState(0); // 0=none, 1=needs evidence, 2=uploading, 3=verified

  const remaining = queue.filter(q => q.currentStatus !== 'APPROVED').length;
  const approved = queue.filter(q => q.currentStatus === 'APPROVED').length;
  const fieldVerif = queue.filter(q => q.currentStatus === 'Field Verification').length;

  // Loading Simulation
  useEffect(() => {
    if (phase !== 'loading') return;
    
    let advanced = false;
    const tick = setInterval(() => {
      if (advanced) return;
      
      setLoadProgress(p => {
        if (p >= 100) return 100;
        const nextP = p + Math.floor(Math.random() * 12) + 2;
        
        if (nextP > 20 && nextP < 50) setLoadStage(1);
        if (nextP > 50 && nextP < 80) setLoadStage(2);
        
        if (nextP >= 100) {
          advanced = true;
          setLoadStage(3);
          setTimeout(() => {
            setPhase('ready');
            showTempMessage('✓ REVIEW QUEUE READY');
          }, 500);
          return 100;
        }
        return nextP;
      });
    }, 120);

    return () => clearInterval(tick);
  }, [phase]);

  // Check completion
  useEffect(() => {
    if (phase === 'ready' && remaining === 0) {
      setPhase('complete');
      showTempMessage('✓ HUMAN REVIEW COMPLETE');
    }
  }, [remaining, phase]);

  const showTempMessage = (msg, duration = 3000) => {
    setTempMessage(msg);
    setTimeout(() => setTempMessage(null), duration);
  };

  const selectedParcel = queue.find(q => q.id === selectedId);

  const handleApprove = () => {
    setIsApproving(true);
  };

  const confirmApprove = () => {
    setIsApproving(false);
    showTempMessage(`✓ PARCEL ${selectedId} APPROVED`);
    setQueue(q => q.map(item => item.id === selectedId ? { ...item, currentStatus: 'APPROVED' } : item));
    setSelectedId(null);
  };

  const handleEditSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      showTempMessage('✓ BOUNDARY UPDATED');
      setQueue(q => q.map(item => item.id === selectedId ? { ...item, currentStatus: 'APPROVED', issue: 'Boundary updated' } : item));
    }, 800);
  };

  const handleUploadEvidence = () => {
    setVerifyingStep(2);
    setTimeout(() => {
      setVerifyingStep(3);
      showTempMessage('✓ SURVEY EVIDENCE ADDED');
      setTimeout(() => {
        setQueue(q => q.map(item => item.id === selectedId ? { ...item, currentStatus: 'APPROVED', issue: 'Field Verified via GNSS' } : item));
        setVerifyingStep(0);
      }, 1000);
    }, 1000);
  };

  const filteredQueue = queue.filter(q => {
    if (filter === 'ALL') return true;
    if (filter === 'APPROVED') return q.currentStatus === 'APPROVED';
    if (filter === 'REVIEW') return q.currentStatus === 'Review';
    if (filter === 'FIELD VERIFICATION') return q.currentStatus === 'Field Verification';
    return true;
  });

  return (
    <div className="screen-wrap">
      
      {/* Topbar */}
      <div className="screen-topbar" style={{ background: 'var(--surface-panel)', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 'var(--sp-6)', alignItems: 'center' }}>
          <div>
            <div className="screen-title">HUMAN REVIEW</div>
            <div className="screen-subtitle">Gujarat &bull; Sector 04</div>
          </div>
          
          {phase !== 'loading' && (
            <div style={{ display: 'flex', gap: 'var(--sp-4)', borderLeft: '1px solid var(--border)', paddingLeft: 'var(--sp-6)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-ink-muted)' }}>REVIEW QUEUE</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-primary)', fontFamily: 'var(--font-mono)' }}>48 <span style={{fontSize: 11}}>Flagged</span></span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-ink-muted)' }}>REVIEWED</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-secondary)', fontFamily: 'var(--font-mono)' }}>{82 + approved}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-ink-muted)' }}>REMAINING</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: remaining === 0 ? 'var(--c-secondary)' : 'var(--c-amber)', fontFamily: 'var(--font-mono)' }}>{remaining}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="screen-topbar-actions" style={{ gap: 'var(--sp-4)' }}>
          <div style={{ textAlign: 'right' }}>
            <button 
              className={`btn ${phase === 'complete' ? 'btn-primary' : ''}`} 
              disabled={phase !== 'complete'}
              onClick={() => navigate('/export')}
              style={{ 
                padding: '8px 16px', fontSize: 11, fontWeight: 800,
                background: phase === 'complete' ? 'var(--c-secondary)' : 'var(--surface-bg)', 
                color: phase === 'complete' ? 'white' : 'var(--c-ink-muted)', 
                opacity: phase === 'complete' ? 1 : 0.6,
                border: `1px solid ${phase === 'complete' ? 'var(--c-secondary)' : 'var(--border)'}`,
                cursor: phase === 'complete' ? 'pointer' : 'not-allowed'
              }}
            >
              CONTINUE TO FINAL OUTPUT
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 6 }} width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--c-ink-muted)', marginTop: 4 }}>
              {phase === 'complete' ? 'Review complete — prepare final output.' : 'Resolve required flagged parcels to continue.'}
            </div>
          </div>
        </div>
      </div>

      <div className="screen-body" style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        
        {/* LEFT PANEL: Review Queue */}
        <div style={{ flex: '0 0 260px', background: 'var(--surface-panel)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 5, overflowY: 'auto' }}>
          
          <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--surface-panel)', zIndex: 10 }}>
            <div className="sec-heading" style={{ marginBottom: 'var(--sp-3)' }}>REVIEW QUEUE</div>
            
            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {['ALL', 'REVIEW', 'FIELD VERIFICATION', 'APPROVED'].map(f => (
                <button key={f} 
                  onClick={() => setFilter(f)}
                  style={{
                    fontSize: 9, fontWeight: 700, padding: '4px 8px', borderRadius: '4px', cursor: 'pointer',
                    background: filter === f ? 'var(--c-ink)' : 'transparent',
                    color: filter === f ? 'white' : 'var(--c-ink-muted)',
                    border: filter === f ? 'none' : '1px solid var(--border)'
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {filteredQueue.map(item => {
              const isSelected = item.id === selectedId;
              const isApproved = item.currentStatus === 'APPROVED';
              const isField = item.currentStatus === 'Field Verification';
              
              return (
                <div 
                  key={item.id}
                  onClick={() => {
                    if (!isEditing && !isApproving) setSelectedId(item.id);
                    setVerifyingStep(0);
                  }}
                  style={{
                    background: isSelected ? 'var(--surface-bg)' : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--c-primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-md)', padding: 'var(--sp-3)', cursor: 'pointer',
                    opacity: isApproved ? 0.6 : 1, transition: 'all 0.2s',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)' }}>{item.id}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)', color: item.conf >= 85 ? 'var(--c-secondary)' : item.conf >= 60 ? 'var(--c-amber)' : 'var(--c-coral)' }}>
                      {item.conf}%
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink)', marginBottom: 8 }}>{item.issue}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: isApproved ? 'var(--c-secondary)' : isField ? 'var(--c-coral)' : 'var(--c-amber)' }} />
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      {item.currentStatus}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredQueue.length === 0 && (
              <div style={{ padding: 'var(--sp-4)', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)' }}>
                No parcels match the current filter.
              </div>
            )}
          </div>
          
        </div>

        {/* CENTER MAP */}
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, position: 'relative', background: '#DCE4DD', overflow: 'hidden' }}>
          
          {/* Loading Overlay */}
          {phase === 'loading' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(243,247,242,0.85)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div className="panel" style={{ padding: 'var(--sp-6)', width: 340, boxShadow: 'var(--shadow-lg)' }}>
                 <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 'var(--sp-4)', textAlign: 'center', letterSpacing: '.05em' }}>PREPARING REVIEW QUEUE...</div>
                 
                 <div style={{ height: 4, background: 'var(--surface-bg)', borderRadius: 2, marginBottom: 'var(--sp-4)', overflow: 'hidden' }}>
                   <div style={{ height: '100%', width: `${loadProgress}%`, background: 'var(--c-cyan)', transition: 'width 0.1s linear' }} />
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: loadStage > 0 ? 'var(--c-ink)' : 'inherit' }}>
                     {loadStage > 0 ? '✓' : '○'} Loading flagged parcels...
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: loadStage > 1 ? 'var(--c-ink)' : 'inherit' }}>
                     {loadStage > 1 ? '✓' : '○'} Loading topology issues...
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: loadStage > 2 ? 'var(--c-ink)' : 'inherit' }}>
                     {loadStage > 2 ? '✓' : '○'} Loading confidence information...
                   </div>
                 </div>
               </div>
            </div>
          )}

          {/* Temporary Messages */}
          {tempMessage && (
            <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'var(--c-ink)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--r-md)', fontSize: 11, fontWeight: 700, zIndex: 40, boxShadow: 'var(--shadow-md)', animation: 'fadeIn 0.2s' }}>
              {tempMessage}
            </div>
          )}

          {/* Top Map Toolbar: Compare */}
          {selectedParcel && !isEditing && !isApproving && verifyingStep === 0 && (
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-panel)', padding: '6px', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 4, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', zIndex: 20 }}>
              {['reference', 'ai', 'overlay'].map(m => (
                <button key={m} onClick={() => setViewMode(m)} style={{ 
                  fontSize: 10, fontWeight: 700, padding: '6px 12px', borderRadius: '4px', textTransform: 'uppercase', cursor: 'pointer',
                  background: viewMode === m ? 'var(--c-ink)' : 'transparent',
                  color: viewMode === m ? 'white' : 'var(--c-ink)',
                  border: 'none'
                }}>
                  {m === 'reference' ? 'Reference Only' : m === 'ai' ? 'AI Only' : 'Overlay'}
                </button>
              ))}
            </div>
          )}

          {/* Simulated SVG Map */}
          <svg width="100%" height="100%" viewBox="0 0 1000 700" style={{ position: 'absolute', inset: 0, opacity: phase === 'loading' ? 0.3 : 1, transition: 'opacity 0.5s' }}>
             
             {/* Subtle Grid */}
             <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'linear-gradient(var(--c-ink-muted) 1px, transparent 1px), linear-gradient(90deg, var(--c-ink-muted) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

             {selectedParcel && (
               <g>
                 {/* Background Context (Buildings/Roads nearby) */}
                 <rect x="250" y="250" width="80" height="60" fill="rgba(16,63,58,0.05)" stroke="rgba(16,63,58,0.2)" />
                 <path d="M0 600 L1000 500" stroke="rgba(22,37,34,0.1)" strokeWidth="15" fill="none" />

                 {/* Reference Geometry (Blue) */}
                 {(viewMode === 'reference' || viewMode === 'overlay') && (
                   <polygon points={selectedParcel.id === 'P003' ? "400,200 350,500 700,520 750,220" : "420,220 370,480 680,500 730,240"} 
                     fill="none" stroke="var(--c-gis-blue)" strokeWidth="3" strokeDasharray="6,4" 
                   />
                 )}
                 
                 {/* AI Geometry (Teal) */}
                 {(viewMode === 'ai' || viewMode === 'overlay') && (
                   <polygon points={
                      isEditing ? "400,200 370,500 700,520 750,220" /* Simulate user editing fixing it */
                      : selectedParcel.id === 'P003' ? "400,200 370,500 750,480 750,220" /* Mismatch */
                      : "420,220 380,470 690,490 730,240"
                     }
                     fill="rgba(78,143,115,0.15)" stroke={selectedParcel.currentStatus === 'APPROVED' ? "var(--c-secondary)" : "var(--c-primary)"} strokeWidth="3" 
                   />
                 )}

                 {/* Topology Discrepancy Highlight */}
                 {viewMode === 'overlay' && selectedParcel.currentStatus !== 'APPROVED' && !isEditing && (
                   <circle cx={selectedParcel.id === 'P003' ? 700 : 400} cy={selectedParcel.id === 'P003' ? 500 : 480} r="40" fill="rgba(207,101,92,0.2)" stroke="var(--c-coral)" strokeWidth="2" strokeDasharray="4,4" />
                 )}

                 {/* Edit Mode Handles */}
                 {isEditing && (
                   <g>
                     <circle cx="400" cy="200" r="6" fill="white" stroke="var(--c-ink)" strokeWidth="2" style={{ cursor: 'move' }} />
                     <circle cx="370" cy="500" r="6" fill="white" stroke="var(--c-ink)" strokeWidth="2" style={{ cursor: 'move' }} />
                     <circle cx="700" cy="520" r="6" fill="white" stroke="var(--c-ink)" strokeWidth="2" style={{ cursor: 'move' }} />
                     <circle cx="750" cy="220" r="6" fill="white" stroke="var(--c-ink)" strokeWidth="2" style={{ cursor: 'move' }} />
                   </g>
                 )}
               </g>
             )}

             {!selectedParcel && phase === 'ready' && (
               <text x="500" y="350" textAnchor="middle" fill="var(--c-ink-muted)" fontSize="14" fontWeight="600">Select a flagged parcel from the queue to begin review.</text>
             )}
          </svg>

          {/* Floating Edit Toolbar */}
          {isEditing && (
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-panel)', padding: '8px 16px', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--c-primary)', zIndex: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-primary)' }}>
                {isSaving ? 'SAVING...' : 'EDIT BOUNDARY'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => setIsEditing(false)} disabled={isSaving} style={{ fontSize: 10, padding: '4px 12px' }}>CANCEL</button>
                <button className="btn btn-primary" onClick={handleEditSave} disabled={isSaving} style={{ fontSize: 10, padding: '4px 12px', background: 'var(--c-ink)' }}>SAVE CHANGES</button>
              </div>
            </div>
          )}

          {/* Approval Confirmation Modal Overlay */}
          {isApproving && selectedParcel && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(243,247,242,0.85)', backdropFilter: 'blur(2px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div className="panel" style={{ padding: 'var(--sp-6)', width: 320, boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
                 <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(78,143,115,0.1)', color: 'var(--c-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--sp-4)' }}>
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24"><polyline points="20 6 9 17 4 12"/></svg>
                 </div>
                 <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 8 }}>APPROVE PARCEL?</div>
                 <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-primary)', marginBottom: 4 }}>{selectedParcel.id} &bull; {selectedParcel.area}</div>
                 <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)', marginBottom: 'var(--sp-6)' }}>Current Confidence: {selectedParcel.conf}%</div>
                 
                 <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
                   <button className="btn btn-secondary" onClick={() => setIsApproving(false)}>CANCEL</button>
                   <button className="btn btn-primary" style={{ background: 'var(--c-secondary)' }} onClick={confirmApprove}>APPROVE</button>
                 </div>
               </div>
            </div>
          )}
          
        </div>

        {/* RIGHT PANEL: Review Details */}
        <div style={{ flex: '0 0 280px', background: 'var(--surface-panel)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 5, overflowY: 'auto' }}>
          
          {selectedParcel ? (
            <div style={{ padding: 'var(--sp-5)' }}>
              <div className="sec-heading" style={{ marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-3)' }}>REVIEW DETAILS</div>
              
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 'var(--sp-4)' }}>{selectedParcel.id}</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
                <DetailRow label="Area" value={selectedParcel.area} font="mono" />
                <DetailRow label="Confidence" value={`${selectedParcel.conf}%`} color={selectedParcel.conf >= 85 ? 'var(--c-secondary)' : selectedParcel.conf >= 60 ? 'var(--c-amber)' : 'var(--c-coral)'} font="mono" />
                <DetailRow label="Issue" value={selectedParcel.issue} />
                <DetailRow label="Status" value={selectedParcel.currentStatus} color={selectedParcel.currentStatus === 'APPROVED' ? 'var(--c-secondary)' : selectedParcel.currentStatus === 'Field Verification' ? 'var(--c-coral)' : 'var(--c-amber)'} />
                <DetailRow label="Source" value={selectedParcel.source} />
              </div>

              {/* Action Area based on state */}
              {selectedParcel.currentStatus === 'APPROVED' ? (
                <div style={{ background: 'rgba(78,143,115,0.1)', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', border: '1px solid rgba(78,143,115,0.3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                    PARCEL APPROVED
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink)' }}>No further action required.</div>
                </div>
              ) : verifyingStep > 0 ? (
                /* Field Verification Flow */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <div style={{ background: 'rgba(207,101,92,0.1)', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', border: '1px solid rgba(207,101,92,0.3)' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-coral)', marginBottom: 8 }}>FIELD VERIFICATION</div>
                    
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-ink)', marginBottom: 12 }}>
                      {verifyingStep === 3 ? 'Survey data successfully synchronized.' : 'Boundary discrepancy requires on-ground verification.'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: 'var(--c-ink-muted)' }}>GNSS / CORS</span>
                      <span style={{ fontWeight: 700, color: verifyingStep === 3 ? 'var(--c-secondary)' : 'var(--c-amber)' }}>{verifyingStep === 3 ? 'Verified' : 'Pending'}</span>
                    </div>
                  </div>

                  {verifyingStep === 1 && (
                    <>
                      <button className="btn btn-secondary" style={{ justifyContent: 'center', fontSize: 11 }}>ADD NOTE</button>
                      <button className="btn btn-primary" onClick={handleUploadEvidence} style={{ justifyContent: 'center', fontSize: 11, background: 'var(--c-coral)' }}>ADD SURVEY EVIDENCE</button>
                    </>
                  )}
                  {verifyingStep === 2 && (
                    <button className="btn btn-primary" disabled style={{ justifyContent: 'center', fontSize: 11, opacity: 0.7 }}>UPLOADING...</button>
                  )}
                  {verifyingStep === 3 && (
                    <button className="btn btn-primary" onClick={() => setVerifyingStep(0)} style={{ justifyContent: 'center', fontSize: 11, background: 'var(--c-secondary)' }}>DONE</button>
                  )}
                </div>
              ) : (
                /* Normal Actions */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <button className="btn btn-primary" onClick={handleApprove} disabled={isEditing || isApproving} style={{ justifyContent: 'center', background: 'var(--c-secondary)' }}>
                    APPROVE
                  </button>
                  <button className="btn btn-secondary" onClick={() => setIsEditing(true)} disabled={isEditing || isApproving} style={{ justifyContent: 'center' }}>
                    EDIT BOUNDARY
                  </button>
                  <button className="btn btn-ghost" onClick={() => setVerifyingStep(1)} disabled={isEditing || isApproving} style={{ justifyContent: 'center', border: '1px solid var(--c-coral)', color: 'var(--c-coral)' }}>
                    FLAG FOR FIELD VERIFICATION
                  </button>
                </div>
              )}

              {/* Audit History */}
              <div style={{ marginTop: 'var(--sp-6)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border)' }}>
                 <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-ink-muted)', marginBottom: 'var(--sp-3)', letterSpacing: '.05em' }}>REVIEW HISTORY</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                     <span style={{ color: 'var(--c-ink)' }}>AI generated</span>
                     <span style={{ color: 'var(--c-ink-muted)', fontFamily: 'var(--font-mono)' }}>09:42</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                     <span style={{ color: 'var(--c-amber)' }}>Topology flagged</span>
                     <span style={{ color: 'var(--c-ink-muted)', fontFamily: 'var(--font-mono)' }}>09:45</span>
                   </div>
                   {selectedParcel.currentStatus === 'APPROVED' && (
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                       <span style={{ color: 'var(--c-secondary)' }}>Status Updated</span>
                       <span style={{ color: 'var(--c-ink-muted)', fontFamily: 'var(--font-mono)' }}>Just now</span>
                     </div>
                   )}
                 </div>
              </div>

            </div>
          ) : (
            <div style={{ padding: 'var(--sp-4)' }}>
              <div className="sec-heading" style={{ marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-3)' }}>REVIEW DETAILS</div>
              
              <div style={{ background: 'rgba(22,37,34,0.03)', padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', textAlign: 'center', border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 8 }}>SELECT A FLAGGED PARCEL</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)' }}>
                  Choose an item from the review queue to inspect its geometry and validation details.
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, color = 'var(--c-ink)', font = 'sans' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)' }}>{label}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color, fontFamily: font === 'mono' ? 'var(--font-mono)' : 'inherit', textAlign: 'right' }}>{value}</div>
    </div>
  );
}
