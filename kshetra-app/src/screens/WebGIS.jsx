import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/ui.css';
import './screens.css';

export default function WebGIS() {
  const navigate = useNavigate();
  
  // App States
  const [phase, setPhase] = useState('loading'); // loading | ready | empty
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStage, setLoadStage] = useState(0);
  const [demoAlert, setDemoAlert] = useState(null);
  
  // GIS States
  const [layers, setLayers] = useState({
    satellite: false, dsm: false,
    aiParcels: true, existingParcels: true,
    buildings: true, roads: true, landUse: false
  });
  
  const [activeTool, setActiveTool] = useState('select'); // select | edit | add | delete | measure | compare
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [editingState, setEditingState] = useState(null); // 'editing' | 'saving' | 'saved'
  const [compareMode, setCompareMode] = useState('overlay'); // existing | ai | overlay
  const [tempMessage, setTempMessage] = useState(null);

  // Loading Simulation
  useEffect(() => {
    if (phase !== 'loading') return;
    
    let advanced = false;
    const tick = setInterval(() => {
      if (advanced) return;
      
      setLoadProgress(p => {
        if (p >= 100) return 100;
        const nextP = p + Math.floor(Math.random() * 8) + 2;
        
        // Advance load stages purely based on progress %
        if (nextP > 10 && nextP < 30) setLoadStage(1);
        if (nextP > 30 && nextP < 50) setLoadStage(2);
        if (nextP > 50 && nextP < 70) setLoadStage(3);
        if (nextP > 70 && nextP < 90) setLoadStage(4);
        
        if (nextP >= 100) {
          advanced = true;
          setLoadStage(5);
          setTimeout(() => {
            setPhase('ready');
            showTempMessage('✓ WEB-GIS READY');
          }, 600);
          return 100;
        }
        return nextP;
      });
    }, 80);

    return () => clearInterval(tick);
  }, [phase]);

  const showTempMessage = (msg, duration = 3000) => {
    setTempMessage(msg);
    setTimeout(() => setTempMessage(null), duration);
  };

  const handleToolClick = (tool) => {
    if (editingState === 'editing' || editingState === 'saving') return;
    setActiveTool(tool);
    if (tool !== 'select') setSelectedParcel(null);
  };

  const handleParcelClick = (id, data) => {
    if (activeTool === 'select') {
      setSelectedParcel({ id, ...data });
    } else if (activeTool === 'delete') {
      if (window.confirm(`DELETE PARCEL?\n\n${id}\n${data.area}\n\nThis action cannot be undone in the prototype.`)) {
        showTempMessage(`✓ GEOMETRY REMOVED: ${id}`);
        setSelectedParcel(null);
        setActiveTool('select');
      }
    }
  };

  const startEdit = () => {
    setActiveTool('edit');
    setEditingState('editing');
  };

  const saveEdit = () => {
    setEditingState('saving');
    setTimeout(() => {
      setEditingState('saved');
      showTempMessage('✓ GEOMETRY UPDATED');
      setTimeout(() => {
        setEditingState(null);
        setActiveTool('select');
      }, 1000);
    }, 800);
  };

  const cancelEdit = () => {
    setEditingState(null);
    setActiveTool('select');
  };

  return (
    <div className="screen-wrap">
      
      {/* Topbar */}
      <div className="screen-topbar" style={{ background: 'var(--surface-panel)', zIndex: 10 }}>
        <div>
          <div className="screen-title">WEB GIS</div>
          <div className="screen-subtitle">Gujarat &bull; Sector 04</div>
        </div>
        <div className="screen-topbar-actions" style={{ gap: 'var(--sp-4)' }}>
          <div style={{ textAlign: 'right' }}>
            <button 
              className={`btn ${phase === 'ready' ? 'btn-primary' : ''}`} 
              disabled={phase !== 'ready'}
              onClick={() => {
                showTempMessage('PREPARING REVIEW QUEUE...');
                setTimeout(() => navigate('/human-review'), 800);
              }}
              style={{ 
                padding: '8px 16px', fontSize: 11, fontWeight: 800,
                background: phase === 'ready' ? 'var(--c-secondary)' : 'var(--surface-bg)', 
                color: phase === 'ready' ? 'white' : 'var(--c-ink-muted)', 
                opacity: phase === 'ready' ? 1 : 0.6,
                border: `1px solid ${phase === 'ready' ? 'var(--c-secondary)' : 'var(--border)'}`,
                cursor: phase === 'ready' ? 'pointer' : 'not-allowed'
              }}
            >
              OPEN HUMAN REVIEW
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 6 }} width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--c-ink-muted)', marginTop: 4 }}>
              {phase === 'ready' ? 'Spatial layers ready. Continue to review flagged areas.' : 'Loading layers...'}
            </div>
          </div>
        </div>
      </div>

      <div className="screen-body" style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        
        {/* LEFT PANEL: Layers & Tools */}
        <div style={{ flex: '0 0 240px', background: 'var(--surface-panel)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 5, overflowY: 'auto' }}>
          
          <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border)' }}>
            <div className="sec-heading" style={{ marginBottom: 'var(--sp-3)' }}>LAYERS</div>
            
            <LayerGroup title="BASE">
              <LayerToggle label="Satellite / Aerial" active={layers.satellite} onChange={() => setLayers(l => ({...l, satellite: !l.satellite}))} />
              <LayerToggle label="DSM / Terrain" active={layers.dsm} onChange={() => setLayers(l => ({...l, dsm: !l.dsm}))} />
            </LayerGroup>

            <LayerGroup title="CADASTRAL">
              <LayerToggle label="AI Parcels" active={layers.aiParcels} onChange={() => setLayers(l => ({...l, aiParcels: !l.aiParcels}))} color="var(--c-secondary)" />
              <LayerToggle label="Existing Parcels" active={layers.existingParcels} onChange={() => setLayers(l => ({...l, existingParcels: !l.existingParcels}))} color="var(--c-gis-blue)" />
            </LayerGroup>

            <LayerGroup title="FEATURES">
              <LayerToggle label="Buildings" active={layers.buildings} onChange={() => setLayers(l => ({...l, buildings: !l.buildings}))} color="rgba(16,63,58,0.4)" />
              <LayerToggle label="Roads" active={layers.roads} onChange={() => setLayers(l => ({...l, roads: !l.roads}))} color="#162522" />
              <LayerToggle label="Land Use" active={layers.landUse} onChange={() => setLayers(l => ({...l, landUse: !l.landUse}))} />
            </LayerGroup>
          </div>

          <div style={{ padding: 'var(--sp-4)' }}>
            <div className="sec-heading" style={{ marginBottom: 'var(--sp-3)' }}>TOOLS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <ToolBtn icon="mouse-pointer" label="Select" active={activeTool === 'select'} onClick={() => handleToolClick('select')} />
              <ToolBtn icon="edit-2" label="Edit Geometry" active={activeTool === 'edit'} onClick={() => handleToolClick('edit')} />
              <ToolBtn icon="plus-square" label="Add Polygon" active={activeTool === 'add'} onClick={() => handleToolClick('add')} />
              <ToolBtn icon="trash-2" label="Delete" active={activeTool === 'delete'} onClick={() => handleToolClick('delete')} />
              <ToolBtn icon="maximize" label="Measure" active={activeTool === 'measure'} onClick={() => handleToolClick('measure')} />
              <ToolBtn icon="layers" label="Compare" active={activeTool === 'compare'} onClick={() => handleToolClick('compare')} />
            </div>
          </div>
          
        </div>

        {/* CENTER MAP */}
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, position: 'relative', background: layers.satellite ? '#b3c0b9' : '#DCE4DD', overflow: 'hidden' }}>
          
          {/* Loading Overlay */}
          {phase === 'loading' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(243,247,242,0.85)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div className="panel" style={{ padding: 'var(--sp-6)', width: 320, boxShadow: 'var(--shadow-lg)' }}>
                 <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 'var(--sp-4)', textAlign: 'center', letterSpacing: '.05em' }}>LOADING SPATIAL WORKSPACE</div>
                 
                 <div style={{ height: 4, background: 'var(--surface-bg)', borderRadius: 2, marginBottom: 'var(--sp-4)', overflow: 'hidden' }}>
                   <div style={{ height: '100%', width: `${loadProgress}%`, background: 'var(--c-cyan)', transition: 'width 0.1s linear' }} />
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--c-ink-muted)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: loadStage > 0 ? 'var(--c-ink)' : 'inherit' }}>
                     {loadStage > 0 ? '✓' : '○'} Loading parcel layer...
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: loadStage > 1 ? 'var(--c-ink)' : 'inherit' }}>
                     {loadStage > 1 ? '✓' : '○'} Loading building footprints...
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: loadStage > 2 ? 'var(--c-ink)' : 'inherit' }}>
                     {loadStage > 2 ? '✓' : '○'} Loading road network...
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: loadStage > 3 ? 'var(--c-ink)' : 'inherit' }}>
                     {loadStage > 3 ? '✓' : '○'} Loading spatial metadata...
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

          {/* Top Map Toolbar */}
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 8 }}>
            <div style={{ background: 'var(--surface-panel)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', display: 'flex', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <button className="btn-ghost" style={{ padding: 8 }} title="Zoom In">+</button>
              <button className="btn-ghost" style={{ padding: 8, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }} title="Zoom Out">−</button>
              <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700 }} title="Fit Data">FIT</button>
            </div>
          </div>

          {/* Map Metadata (Bottom Right) */}
          <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10, background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', display: 'flex', gap: 16, fontSize: 9, fontWeight: 700, color: 'var(--c-ink-muted)', fontFamily: 'var(--font-mono)' }}>
             <div>23.0412° N, 72.5567° E</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
               <div style={{ width: 40, height: 4, borderLeft: '1px solid var(--c-ink-muted)', borderRight: '1px solid var(--c-ink-muted)', borderBottom: '1px solid var(--c-ink-muted)' }} />
               100 m
             </div>
          </div>

          {/* Legend (Bottom Left) */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10, background: 'rgba(255,255,255,0.9)', padding: '8px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
             <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-ink-muted)', marginBottom: 6 }}>LEGEND</div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
               <LegendItem color="rgba(78,143,115,0.2)" border="var(--c-secondary)" label="AI Parcel" />
               <LegendItem color="transparent" border="var(--c-gis-blue)" label="Existing GIS" borderStyle="dashed" />
               <LegendItem color="rgba(16,63,58,0.1)" border="rgba(16,63,58,0.4)" label="Building" />
               <LegendItem color="var(--c-amber)" label="Review Area" isCircle />
               <LegendItem color="var(--c-coral)" label="Field Verification" isCircle />
             </div>
          </div>

          {/* Simulated SVG Map */}
          <svg width="100%" height="100%" viewBox="0 0 1000 700" style={{ position: 'absolute', inset: 0, opacity: phase === 'loading' ? 0.3 : 1, transition: 'opacity 0.5s' }}>
             
             {/* Subtle Grid */}
             <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'linear-gradient(var(--c-ink-muted) 1px, transparent 1px), linear-gradient(90deg, var(--c-ink-muted) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

             {/* Roads */}
             {layers.roads && (
               <path d="M0 500 L600 450 L1000 480 L1000 520 L600 490 L0 540 Z" fill="rgba(22,37,34,0.05)" stroke="rgba(22,37,34,0.3)" strokeWidth={1} />
             )}

             {/* Buildings */}
             {layers.buildings && (
               <g>
                 <rect x="180" y="200" width="40" height="30" fill="rgba(16,63,58,0.1)" stroke="rgba(16,63,58,0.4)" />
                 <rect x="420" y="240" width="50" height="40" fill="rgba(16,63,58,0.1)" stroke="rgba(16,63,58,0.4)" />
                 <rect x="680" y="180" width="35" height="35" fill="rgba(16,63,58,0.1)" stroke="rgba(16,63,58,0.4)" />
               </g>
             )}

             {/* Existing Parcels */}
             {layers.existingParcels && (
               <g opacity={activeTool === 'compare' && compareMode === 'ai' ? 0.2 : 1}>
                 <path d="M150 100 L120 350 L350 380 L380 130 Z" fill="none" stroke="var(--c-gis-blue)" strokeWidth="2" strokeDasharray="6,4" />
                 <path d="M380 130 L350 380 L650 400 L680 150 Z" fill="none" stroke="var(--c-gis-blue)" strokeWidth="2" strokeDasharray="6,4" />
                 <path d="M680 150 L650 400 L880 420 L910 170 Z" fill="none" stroke="var(--c-gis-blue)" strokeWidth="2" strokeDasharray="6,4" />
               </g>
             )}

             {/* AI Parcels */}
             {layers.aiParcels && (
               <g opacity={activeTool === 'compare' && compareMode === 'existing' ? 0.2 : 1}>
                 {/* P001 High Conf */}
                 <polygon points="140,90 120,350 340,370 360,120" 
                   fill={selectedParcel?.id === 'P001' ? 'rgba(78,143,115,0.4)' : "rgba(78,143,115,0.1)"} 
                   stroke={selectedParcel?.id === 'P001' ? 'var(--c-ink)' : "var(--c-secondary)"} 
                   strokeWidth={selectedParcel?.id === 'P001' ? 3 : 2} 
                   style={{ cursor: activeTool === 'select' ? 'pointer' : 'default', transition: 'all 0.2s' }}
                   onClick={() => handleParcelClick('P001', { area: '1,420 m²', conf: 92, status: 'ACCEPTED', source: 'AI Generated', type: 'Polygon' })}
                 />
                 
                 {/* P003 Low Conf (Flagged) */}
                 <polygon points="360,120 340,370 660,390 680,150" 
                   fill={selectedParcel?.id === 'P003' ? 'rgba(207,101,92,0.3)' : "rgba(207,101,92,0.1)"} 
                   stroke={selectedParcel?.id === 'P003' ? 'var(--c-ink)' : "var(--c-coral)"} 
                   strokeWidth={selectedParcel?.id === 'P003' ? 3 : 2} 
                   style={{ cursor: activeTool === 'select' || activeTool === 'delete' ? 'pointer' : 'default', transition: 'all 0.2s' }}
                   onClick={() => handleParcelClick('P003', { area: '1,735 m²', conf: 48, status: 'FLAGGED', source: 'AI + Existing GIS', type: 'Polygon' })}
                 />
                 {/* Flag Indicator */}
                 <circle cx="500" cy="250" r="12" fill="var(--c-coral)" opacity="0.8" />
                 <text x="500" y="254" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">!</text>

                 {/* P004 High Conf */}
                 <polygon points="680,150 660,390 890,410 910,170" 
                   fill={selectedParcel?.id === 'P004' ? 'rgba(78,143,115,0.4)' : "rgba(78,143,115,0.1)"} 
                   stroke={selectedParcel?.id === 'P004' ? 'var(--c-ink)' : "var(--c-secondary)"} 
                   strokeWidth={selectedParcel?.id === 'P004' ? 3 : 2} 
                   style={{ cursor: activeTool === 'select' ? 'pointer' : 'default', transition: 'all 0.2s' }}
                   onClick={() => handleParcelClick('P004', { area: '2,104 m²', conf: 88, status: 'ACCEPTED', source: 'AI Generated', type: 'Polygon' })}
                 />
               </g>
             )}

             {/* Measure Tool Sim */}
             {activeTool === 'measure' && (
               <g>
                 <line x1="200" y1="200" x2="300" y2="250" stroke="var(--c-ink)" strokeWidth="2" strokeDasharray="4,4" />
                 <circle cx="200" cy="200" r="4" fill="var(--c-ink)" />
                 <circle cx="300" cy="250" r="4" fill="var(--c-ink)" />
                 <rect x="230" y="210" width="60" height="20" fill="white" stroke="var(--border)" rx="4" />
                 <text x="260" y="224" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--c-ink)">84.6 m</text>
               </g>
             )}

             {/* Add Polygon Sim */}
             {activeTool === 'add' && (
               <g>
                 <text x="500" y="50" textAnchor="middle" fontSize="14" fontWeight="bold" fill="var(--c-primary)">CLICK MAP TO ADD VERTICES</text>
                 <polygon points="400,600 450,550 550,580" fill="rgba(90,174,188,0.2)" stroke="var(--c-cyan)" strokeWidth="2" strokeDasharray="4,4" />
                 <circle cx="400" cy="600" r="5" fill="var(--c-cyan)" />
                 <circle cx="450" cy="550" r="5" fill="var(--c-cyan)" />
                 <circle cx="550" cy="580" r="5" fill="white" stroke="var(--c-cyan)" strokeWidth="2" />
               </g>
             )}

             {/* Editing Polygon Handles (P003) */}
             {editingState && selectedParcel?.id === 'P003' && (
               <g>
                 <circle cx="360" cy="120" r="6" fill="white" stroke="var(--c-ink)" strokeWidth="2" style={{ cursor: 'move' }} />
                 <circle cx="340" cy="370" r="6" fill="white" stroke="var(--c-ink)" strokeWidth="2" style={{ cursor: 'move' }} />
                 <circle cx="660" cy="390" r="6" fill="white" stroke="var(--c-ink)" strokeWidth="2" style={{ cursor: 'move' }} />
                 <circle cx="680" cy="150" r="6" fill="white" stroke="var(--c-ink)" strokeWidth="2" style={{ cursor: 'move' }} />
                 {/* Midpoint handlers */}
                 <circle cx="350" cy="245" r="4" fill="var(--c-cyan)" opacity="0.8" style={{ cursor: 'pointer' }} />
                 <circle cx="500" cy="380" r="4" fill="var(--c-cyan)" opacity="0.8" style={{ cursor: 'pointer' }} />
               </g>
             )}
          </svg>

          {/* Floating Edit Toolbar */}
          {editingState && (
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-panel)', padding: '8px 16px', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--c-primary)', zIndex: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-primary)' }}>
                {editingState === 'editing' ? 'EDITING GEOMETRY' : 'SAVING...'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" onClick={cancelEdit} disabled={editingState === 'saving'} style={{ fontSize: 10, padding: '4px 12px' }}>CANCEL</button>
                <button className="btn btn-primary" onClick={saveEdit} disabled={editingState === 'saving'} style={{ fontSize: 10, padding: '4px 12px', background: 'var(--c-ink)' }}>SAVE</button>
              </div>
            </div>
          )}

          {/* Floating Compare Toolbar */}
          {activeTool === 'compare' && (
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-panel)', padding: '6px', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 4, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', zIndex: 20 }}>
              {['existing', 'ai', 'overlay'].map(m => (
                <button key={m} onClick={() => setCompareMode(m)} style={{ 
                  fontSize: 10, fontWeight: 700, padding: '6px 12px', borderRadius: '4px', textTransform: 'uppercase', cursor: 'pointer',
                  background: compareMode === m ? 'var(--c-ink)' : 'transparent',
                  color: compareMode === m ? 'white' : 'var(--c-ink)',
                  border: 'none'
                }}>
                  {m === 'existing' ? 'Existing GIS' : m === 'ai' ? 'AI Generated' : 'Overlay Both'}
                </button>
              ))}
            </div>
          )}
          
        </div>

        {/* RIGHT PANEL: GIS Insights & Parcel Details */}
        <div style={{ flex: '0 0 260px', background: 'var(--surface-panel)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 5, overflowY: 'auto' }}>
          
          {selectedParcel && !editingState ? (
            <div style={{ padding: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-3)' }}>
                 <div className="sec-heading">PARCEL DETAILS</div>
                 <button className="btn-ghost" style={{ padding: 4 }} onClick={() => setSelectedParcel(null)}>✕</button>
              </div>
              
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-ink)', marginBottom: 'var(--sp-4)' }}>{selectedParcel.id}</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
                <DetailRow label="Area" value={selectedParcel.area} font="mono" />
                <DetailRow label="Source" value={selectedParcel.source} />
                <DetailRow label="Confidence" value={`${selectedParcel.conf}%`} color={selectedParcel.conf >= 85 ? 'var(--c-secondary)' : selectedParcel.conf >= 60 ? 'var(--c-amber)' : 'var(--c-coral)'} font="mono" />
                <DetailRow label="Status" value={selectedParcel.status} color={selectedParcel.status === 'FLAGGED' ? 'var(--c-coral)' : 'var(--c-ink)'} />
                <DetailRow label="Geometry" value={selectedParcel.type} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                <button className="btn btn-secondary" onClick={startEdit} style={{ justifyContent: 'center' }}>EDIT BOUNDARY</button>
                <button className="btn btn-ghost" onClick={() => handleToolClick('measure')} style={{ justifyContent: 'center', border: '1px solid var(--border)' }}>MEASURE</button>
                <button className="btn btn-ghost" onClick={() => handleToolClick('compare')} style={{ justifyContent: 'center', border: '1px solid var(--border)' }}>COMPARE</button>
              </div>
            </div>
          ) : (
            <div style={{ padding: 'var(--sp-4)' }}>
              <div className="sec-heading" style={{ marginBottom: 'var(--sp-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-3)' }}>GIS INSIGHTS</div>
              
              <div style={{ marginBottom: 'var(--sp-5)' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-ink-muted)', marginBottom: 4 }}>PROJECT</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-ink)' }}>Gujarat Sector 04</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
                <StatRow label="SPATIAL LAYERS" value={Object.values(layers).filter(Boolean).length + " Active"} />
                <StatRow label="PARCELS" value="2,214" />
                <StatRow label="BUILDINGS" value="1,501" />
                <StatRow label="ROADS" value="842" />
                <StatRow label="FLAGGED AREAS" value="48" color="var(--c-coral)" />
              </div>

              <div style={{ background: 'rgba(90,174,188,0.1)', padding: 'var(--sp-3)', borderRadius: 'var(--r-md)', border: '1px solid rgba(90,174,188,0.3)' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-primary)', marginBottom: 4 }}>SPATIAL DATABASE</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-ink)' }}>PostgreSQL + PostGIS</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-cyan)', marginTop: 4 }}>✓ Synced</div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

// Subcomponents
function LayerGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 'var(--sp-4)' }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.05em', marginBottom: 'var(--sp-2)' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function LayerToggle({ label, active, onChange, color = 'var(--c-primary)' }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
      <input type="checkbox" checked={active} onChange={onChange} style={{ cursor: 'pointer' }} />
      <div style={{ width: 10, height: 10, borderRadius: 2, background: active ? color : 'transparent', border: `1px solid ${color}`, opacity: active ? 1 : 0.4 }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: active ? 'var(--c-ink)' : 'var(--c-ink-muted)' }}>{label}</span>
    </label>
  );
}

function ToolBtn({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'all 0.1s',
        background: active ? 'var(--c-ink)' : 'transparent',
        color: active ? 'white' : 'var(--c-ink-muted)',
        border: 'none', textAlign: 'left'
      }}
    >
      {/* Fallback to simple shapes since we don't have lucide icons imported */}
      <div style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active ? 1 : 0.7 }}>
        {icon === 'mouse-pointer' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>}
        {icon === 'edit-2' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>}
        {icon === 'plus-square' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>}
        {icon === 'trash-2' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>}
        {icon === 'maximize' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>}
        {icon === 'layers' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>}
      </div>
      <span style={{ fontSize: 11, fontWeight: active ? 700 : 600 }}>{label}</span>
    </button>
  );
}

function LegendItem({ color, border, label, isCircle, borderStyle = 'solid' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {isCircle ? (
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      ) : (
        <div style={{ width: 12, height: 10, borderRadius: 2, background: color, border: `1.5px ${borderStyle} ${border || 'transparent'}` }} />
      )}
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-ink)' }}>{label}</div>
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

function StatRow({ label, value, color = 'var(--c-ink)' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-ink-muted)', letterSpacing: '.05em' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
    </div>
  );
}
