import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
import '../components/ui.css';
import './screens.css';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Dummy Geometries around 23.109, 72.605
const BASE_LAT = 23.109;
const BASE_LNG = 72.605;

const MOCK_EXISTING = [
  { id: 'EXT-01', coords: [[BASE_LAT+0.0001, BASE_LNG-0.0001], [BASE_LAT+0.0001, BASE_LNG+0.0011], [BASE_LAT-0.0011, BASE_LNG+0.0011], [BASE_LAT-0.0011, BASE_LNG-0.0001]] },
  { id: 'EXT-103', coords: [[BASE_LAT-0.001, BASE_LNG], [BASE_LAT-0.001, BASE_LNG+0.0011], [BASE_LAT-0.0022, BASE_LNG+0.0011], [BASE_LAT-0.0022, BASE_LNG]] }, // Existing LP-103
];

const MOCK_BUILDINGS = [
  { id: 'BLD-1', coords: [[BASE_LAT-0.0002, BASE_LNG+0.0002], [BASE_LAT-0.0002, BASE_LNG+0.0006], [BASE_LAT-0.0006, BASE_LNG+0.0006], [BASE_LAT-0.0006, BASE_LNG+0.0002]] },
  { id: 'BLD-2', coords: [[BASE_LAT-0.0002, BASE_LNG+0.0014], [BASE_LAT-0.0002, BASE_LNG+0.0018], [BASE_LAT-0.0005, BASE_LNG+0.0018], [BASE_LAT-0.0005, BASE_LNG+0.0014]] },
];

const MOCK_ROADS = [
  { id: 'RD-1', coords: [[BASE_LAT+0.0005, BASE_LNG-0.001], [BASE_LAT+0.0005, BASE_LNG+0.003]] },
  { id: 'RD-2', coords: [[BASE_LAT-0.0011, BASE_LNG+0.0011], [BASE_LAT-0.0025, BASE_LNG+0.0011]] }
];

export default function WebGISReview() {
  const [layers, setLayers] = useState({
    ai: true,
    existing: true,
    buildings: true,
    roads: true,
    landuse: false,
    dsm: false
  });

  const [parcels, setParcels] = useState([
    { id: 'LP-101', coords: [[BASE_LAT, BASE_LNG], [BASE_LAT, BASE_LNG+0.001], [BASE_LAT-0.001, BASE_LNG+0.001], [BASE_LAT-0.001, BASE_LNG]], conf: 92, status: 'validated', area: '1,420 m²' },
    { id: 'LP-102', coords: [[BASE_LAT, BASE_LNG+0.0012], [BASE_LAT, BASE_LNG+0.0022], [BASE_LAT-0.0008, BASE_LNG+0.0022], [BASE_LAT-0.0008, BASE_LNG+0.0012]], conf: 88, status: 'validated', area: '1,100 m²' },
    { id: 'LP-103', coords: [[BASE_LAT-0.0012, BASE_LNG], [BASE_LAT-0.0012, BASE_LNG+0.001], [BASE_LAT-0.002, BASE_LNG+0.001], [BASE_LAT-0.002, BASE_LNG]], conf: 48, status: 'review_required', area: '1,842 m²' },
  ]);

  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  
  // Track metrics state to update when user interacts
  const [metrics, setMetrics] = useState({
    validatedCount: 1089,
    reviewCount: 127,
    flaggedCount: 87
  });

  const selectedParcel = parcels.find(p => p.id === selectedParcelId);

  const toggleLayer = (l) => setLayers(prev => ({ ...prev, [l]: !prev[l] }));

  const handleApprove = () => {
    if (!selectedParcelId) return;
    setParcels(prev => prev.map(p => p.id === selectedParcelId ? { ...p, status: 'validated' } : p));
    setMetrics(prev => ({ ...prev, validatedCount: prev.validatedCount + 1, reviewCount: prev.reviewCount - 1, flaggedCount: prev.flaggedCount - 1 }));
    setActiveTool(null);
  };

  const handleFlag = () => {
    if (!selectedParcelId) return;
    setParcels(prev => prev.map(p => p.id === selectedParcelId ? { ...p, status: 'field_verification' } : p));
    setActiveTool(null);
  };

  const handleEditBoundary = () => {
    setActiveTool('edit_boundary');
  };

  // Status visual mapping
  const getStatusColor = (status) => {
    if (status === 'validated') return 'var(--c-secondary)';
    if (status === 'field_verification') return 'var(--c-amber)'; // or another color
    return 'var(--c-coral)'; // review required
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', background: '#e0e5df' }}>
      
      {/* LEFT CONTROL PANEL */}
      <div style={{ width: 260, flexShrink: 0, background: 'var(--surface-panel)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 500 }}>
        <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink)' }}>GIS Control Panel</div>
          <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', marginTop: 2 }}>Workspace layers &amp; tools</div>
        </div>

        <div className="scroll-y" style={{ flex: 1, padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          
          <div>
            <div className="sec-heading">Map Layers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {[
                { id: 'ai', label: 'AI Parcels', color: 'var(--c-secondary)' },
                { id: 'existing', label: 'Existing Parcels', color: 'var(--c-gis-blue)' },
                { id: 'buildings', label: 'Buildings', color: 'rgba(255,255,255,0.7)' },
                { id: 'roads', label: 'Roads', color: '#666' },
                { id: 'landuse', label: 'Land Use', color: 'var(--c-amber)' },
                { id: 'dsm', label: 'DSM / DTM', color: 'var(--c-cyan)' },
              ].map(lyr => (
                <label key={lyr.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={layers[lyr.id]} onChange={() => toggleLayer(lyr.id)} style={{ accentColor: 'var(--c-primary)', width: 14, height: 14 }} />
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: lyr.color, border: '1px solid rgba(0,0,0,0.2)' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-ink)' }}>{lyr.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="divider" style={{ margin: '0' }} />

          <div>
            <div className="sec-heading">Digitization Tools</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
              {[
                { id: 'vertex', icon: '⤡', label: 'Vertex' },
                { id: 'snap', icon: '◰', label: 'Snap Edge' },
                { id: 'ortho', icon: '∟', label: 'Orthogonal' },
                { id: 'poly', icon: '⬟', label: 'Polygon' },
                { id: 'measure', icon: '⏚', label: 'Measure' },
                { id: 'compare', icon: '◧', label: 'Compare' },
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setActiveTool(t.id)}
                  style={{ 
                    padding: '8px', background: activeTool === t.id ? 'var(--c-primary)' : 'var(--c-mist)', 
                    color: activeTool === t.id ? '#fff' : 'var(--c-ink)', 
                    border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', 
                    fontSize: 11, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ fontSize: 14 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
              <button 
                className="btn btn-secondary" 
                style={{ gridColumn: 'span 2', justifyContent: 'center', marginTop: 4, borderColor: 'var(--c-secondary)', color: 'var(--c-secondary)' }}
              >
                Validate Topology
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER MAP AREA */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        
        {/* Absolute Map Overlays */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', pointerEvents: 'none' }}>
          
          {/* North Indicator */}
          <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', pointerEvents: 'auto' }}>
            <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '10px solid var(--c-coral)', marginBottom: 2 }} />
          </div>

          {/* Map Legend */}
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: 'var(--sp-3)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', pointerEvents: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', marginBottom: 8, letterSpacing: '.05em', textTransform: 'uppercase' }}>Legend</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, background: 'rgba(78,143,115,0.4)', border: '2px solid var(--c-secondary)' }} /><span style={{ fontSize: 11, fontWeight: 600 }}>Validated (High)</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, background: 'transparent', border: '2px dashed var(--c-gis-blue)' }} /><span style={{ fontSize: 11, fontWeight: 600 }}>Existing GIS</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 12, height: 12, background: 'rgba(207,101,92,0.4)', border: '2px solid var(--c-coral)' }} /><span style={{ fontSize: 11, fontWeight: 600 }}>Review Required</span></div>
            </div>
          </div>
        </div>

        {/* Bottom Overlays */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}>
          
          <div style={{ background: 'rgba(22,37,34,0.85)', padding: '6px 12px', borderRadius: 'var(--r-sm)', color: '#fff', fontSize: 11, fontFamily: 'var(--font-mono)', pointerEvents: 'auto', display: 'flex', gap: 16 }}>
            <span>EPSG:32643</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
            <span>E 388,420.4 N 2,564,318.7</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>|</span>
            <span style={{ color: 'var(--c-cyan)' }}>Elev: 52.4m</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ width: 100, height: 4, background: '#fff', border: '1px solid #000' }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink)', textShadow: '0 0 2px #fff' }}>50 m</span>
          </div>
        </div>

        <MapContainer 
          center={[23.1085, 72.606]} 
          zoom={17} 
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          zoomControl={false}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
            maxZoom={20}
          />

          {layers.roads && MOCK_ROADS.map(r => (
            <Polyline key={r.id} positions={r.coords} color="#dddddd" weight={6} opacity={0.8} />
          ))}

          {layers.buildings && MOCK_BUILDINGS.map(b => (
            <Polygon 
              key={b.id} 
              positions={b.coords} 
              pathOptions={{ color: '#fff', fillColor: '#fff', fillOpacity: 0.4, weight: 1 }}
            />
          ))}

          {layers.existing && MOCK_EXISTING.map(e => (
            <Polygon 
              key={e.id} 
              positions={e.coords} 
              pathOptions={{ color: 'var(--c-gis-blue)', fillColor: 'transparent', weight: 2, dashArray: '5,5' }}
            />
          ))}

          {layers.ai && parcels.map((p) => {
            const isSelected = selectedParcelId === p.id;
            const color = getStatusColor(p.status);
            
            return (
              <Polygon
                key={p.id}
                positions={p.coords}
                eventHandlers={{ click: () => { setSelectedParcelId(isSelected ? null : p.id); setActiveTool(null); } }}
                pathOptions={{ 
                  color: (isSelected && activeTool === 'edit_boundary') ? 'var(--c-primary)' : isSelected ? '#fff' : color, 
                  fillColor: color, 
                  fillOpacity: isSelected ? 0.6 : 0.3,
                  weight: isSelected ? 4 : 2,
                  dashArray: p.status === 'review_required' ? '10,5' : 'none'
                }}
              >
                <Tooltip direction="center" permanent className="custom-tooltip" opacity={1}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{p.id}</span>
                </Tooltip>
                
                {isSelected && (
                  <Popup autoPan={false}>
                    <div style={{ padding: '2px', minWidth: 160 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', marginBottom: 2 }}>PARCEL {p.id}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-ink)' }}>{p.area}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: color, marginTop: 4 }}>AI Confidence {p.conf}%</div>
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontWeight: 700, color: color }}>
                        {p.status === 'validated' && <span>✓ VALIDATED</span>}
                        {p.status === 'field_verification' && <span>⚠ FIELD VERIFICATION REQ.</span>}
                        {p.status === 'review_required' && (
                          <>
                            <span>✕ REVIEW REQUIRED</span>
                            <div style={{ fontSize: 10, color: 'var(--c-coral)', marginTop: 4 }}>
                              <strong>DETECTED ISSUES:</strong>
                              <ul style={{ paddingLeft: 14, marginTop: 2, fontWeight: 500 }}>
                                <li>Boundary mismatch</li>
                                <li>Possible overlap</li>
                                <li>Road-side discrepancy</li>
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </Popup>
                )}

                {/* Show discrepancy highlight if it's LP-103 and review required */}
                {(p.id === 'LP-103' && p.status === 'review_required') && (
                  <Polygon 
                    positions={[[BASE_LAT-0.001, BASE_LNG+0.001], [BASE_LAT-0.0012, BASE_LNG+0.001], [BASE_LAT-0.0012, BASE_LNG+0.0011], [BASE_LAT-0.001, BASE_LNG+0.0011]]}
                    pathOptions={{ color: 'var(--c-coral)', fillColor: 'var(--c-coral)', fillOpacity: 0.8, weight: 1, dashArray: '3,3' }}
                  />
                )}

                {/* Show vertices and handles if editing boundary */}
                {(isSelected && activeTool === 'edit_boundary') && p.coords.map((coord, i) => (
                  <Polygon 
                    key={i} 
                    positions={[
                      [coord[0]-0.00003, coord[1]-0.00003],
                      [coord[0]+0.00003, coord[1]-0.00003],
                      [coord[0]+0.00003, coord[1]+0.00003],
                      [coord[0]-0.00003, coord[1]+0.00003]
                    ]}
                    pathOptions={{ color: '#fff', fillColor: '#fff', fillOpacity: 1, weight: 2 }}
                  />
                ))}
              </Polygon>
            );
          })}
        </MapContainer>
      </div>

      {/* RIGHT INTELLIGENCE / REVIEW PANEL */}
      <div style={{ width: 340, flexShrink: 0, background: 'var(--surface-panel)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 500 }}>
        
        {selectedParcel && selectedParcel.status !== 'validated' ? (
          /* HUMAN REVIEW PANEL */
          <>
            <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border)', background: 'var(--surface-bg)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--c-ink-muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Human-in-the-Loop Review</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-ink)', marginTop: 4 }}>PARCEL {selectedParcel.id}</div>
            </div>

            <div className="scroll-y" style={{ flex: 1, padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                <div style={{ background: 'var(--c-mist)', padding: 'var(--sp-3)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase' }}>AI Confidence</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--c-coral)', marginTop: 2 }}>{selectedParcel.conf}%</div>
                </div>
                <div style={{ background: 'var(--c-mist)', padding: 'var(--sp-3)', borderRadius: 'var(--r-md)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase' }}>Area</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--c-ink)', marginTop: 2 }}>{selectedParcel.area}</div>
                </div>
              </div>

              <div>
                <div className="sec-heading">Detected Issues</div>
                <div style={{ background: 'rgba(207,101,92,0.1)', border: '1px solid rgba(207,101,92,0.3)', borderRadius: 'var(--r-md)', padding: 'var(--sp-4)' }}>
                  <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--c-coral)', fontSize: 12, fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <li>Boundary mismatch</li>
                    <li>Possible overlap</li>
                    <li>Road-side discrepancy</li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="sec-heading">Primary Actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <button onClick={handleEditBoundary} className="btn btn-secondary" style={{ padding: '12px', justifyContent: 'center', background: activeTool === 'edit_boundary' ? 'var(--c-mist)' : 'transparent', border: activeTool === 'edit_boundary' ? '1px solid var(--c-primary)' : '1px solid var(--border)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    EDIT BOUNDARY
                  </button>
                  <button onClick={handleApprove} className="btn btn-primary" style={{ padding: '12px', justifyContent: 'center', background: 'var(--c-secondary)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    APPROVE
                  </button>
                  <button onClick={handleFlag} className="btn btn-secondary" style={{ padding: '12px', justifyContent: 'center', borderColor: 'var(--c-coral)', color: 'var(--c-coral)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    FLAG FOR FIELD VERIFICATION
                  </button>
                </div>
              </div>

              <div>
                <div className="sec-heading">Secondary Actions</div>
                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>ADD NOTE</button>
                  <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>ADD SURVEY EVIDENCE</button>
                </div>
              </div>

            </div>
          </>
        ) : (
          /* DEFAULT AI + GIS INSIGHTS PANEL */
          <>
            <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-ink)' }}>AI + GIS INSIGHTS</div>
              <div style={{ fontSize: 11, color: 'var(--c-ink-muted)', marginTop: 2 }}>Real-time spatial intelligence</div>
            </div>

            <div className="scroll-y" style={{ flex: 1, padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                <div style={{ background: 'var(--c-mist)', padding: 'var(--sp-3)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-ink)' }}>2,294</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase' }}>Parcels</div>
                </div>
                <div style={{ background: 'var(--c-mist)', padding: 'var(--sp-3)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-ink)' }}>1,501</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase' }}>Buildings</div>
                </div>
                <div style={{ background: 'var(--c-mist)', padding: 'var(--sp-3)', borderRadius: 'var(--r-md)', textAlign: 'center', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-ink)' }}>4,257</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase' }}>Total Features</div>
                </div>
              </div>

              <div>
                <div className="sec-heading">Confidence Distribution</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  <div className="conf-bar-wrap" style={{ margin: 0 }}>
                    <div className="conf-bar-row">
                      <span style={{ fontSize: 11, fontWeight: 600 }}>High (≥ 90%)</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-secondary)' }}>72%</span>
                    </div>
                    <div className="conf-bar-track"><div className="conf-bar-fill" style={{ width: '72%', background: 'var(--c-secondary)' }} /></div>
                  </div>
                  <div className="conf-bar-wrap" style={{ margin: 0 }}>
                    <div className="conf-bar-row">
                      <span style={{ fontSize: 11, fontWeight: 600 }}>Review (75–89%)</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-amber)' }}>18%</span>
                    </div>
                    <div className="conf-bar-track"><div className="conf-bar-fill" style={{ width: '18%', background: 'var(--c-amber)' }} /></div>
                  </div>
                  <div className="conf-bar-wrap" style={{ margin: 0 }}>
                    <div className="conf-bar-row">
                      <span style={{ fontSize: 11, fontWeight: 600 }}>Low (&lt; 75%)</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-coral)' }}>10%</span>
                    </div>
                    <div className="conf-bar-track"><div className="conf-bar-fill" style={{ width: '10%', background: 'var(--c-coral)' }} /></div>
                  </div>
                </div>
              </div>

              <div>
                <div className="sec-heading" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Topology Validation</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-amber)" strokeWidth="3" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Overlap Check
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--c-amber)', fontWeight: 800 }}>⚠ REVIEW</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-secondary)" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                    Gap Detection
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--c-secondary)', fontWeight: 800 }}>✓ PASSED</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-coral)" strokeWidth="3" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Invalid Geometry
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--c-coral)', fontWeight: 800 }}>✕ FAILED</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-secondary)" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                    Duplicate Parcel Detection
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--c-secondary)', fontWeight: 800 }}>✓ PASSED</span>
                  </div>
                </div>
              </div>

              <div className="divider" style={{ margin: 0 }} />

              <div>
                <div className="sec-heading">Storage Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--sp-3)', background: 'rgba(75,130,184,0.1)', borderRadius: 'var(--r-md)', border: '1px solid rgba(75,130,184,0.2)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-gis-blue)', animation: 'pulse-dot 2s infinite' }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-ink)' }}>PostgreSQL + PostGIS</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-gis-blue)' }}>SYNCED</div>
                  </div>
                </div>
              </div>

            </div>

            <div style={{ padding: 'var(--sp-4)', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px', borderColor: 'var(--c-coral)', color: 'var(--c-coral)' }}>
                REVIEW FLAGGED AREAS ({metrics.flaggedCount})
              </button>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
