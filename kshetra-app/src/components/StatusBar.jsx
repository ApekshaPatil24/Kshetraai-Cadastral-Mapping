import { useLocation } from 'react-router-dom';
import './StatusBar.css';

const SCREEN_LABELS = {
  '/acquisition':   { label: 'Data Acquisition', stage: '01–02 / 11' },
  '/ai-processing': { label: 'AI Processing',    stage: '03 / 11'    },
  '/gis-parcel':    { label: 'GIS Conversion + Parcel Generation', stage: '04–05 / 11' },
  '/validation':    { label: 'Topology + Confidence Validation',   stage: '06–07 / 11' },
  '/webgis-review': { label: 'Web GIS + Human Review',             stage: '08–10 / 11' },
  '/export':        { label: 'Final Output + Export',              stage: '11 / 11'    },
};

export default function StatusBar() {
  const { pathname } = useLocation();
  const info = SCREEN_LABELS[pathname] || SCREEN_LABELS['/acquisition'];

  return (
    <div className="status-bar">
      <span className="sb2-screen">{info.label}</span>
      <span className="sb2-sep">/</span>
      <span className="sb2-mission">Mission TC-2024-GJ04</span>
      <span className="sb2-dot-sep" />
      <span className="sb2-item">
        <span className="sb2-lbl">Parcels</span>
        <span className="sb2-val" style={{color:'var(--c-ink)'}}>1,247</span>
      </span>
      <span className="sb2-dot-sep" />
      <span className="sb2-item">
        <span className="sb2-lbl">Validated</span>
        <span className="sb2-val" style={{color:'var(--c-secondary)'}}>1,089</span>
      </span>
      <span className="sb2-dot-sep" />
      <span className="sb2-item">
        <span className="sb2-lbl">Review</span>
        <span className="sb2-val" style={{color:'var(--c-amber)'}}>127</span>
      </span>
      <span className="sb2-dot-sep" />
      <span className="sb2-item">
        <span className="sb2-lbl">Topo Errors</span>
        <span className="sb2-val" style={{color:'var(--c-coral)'}}>23</span>
      </span>
      <div className="sb2-spacer" />
      <span className="sb2-stage">Stage {info.stage}</span>
      <span className="sb2-dot-sep" />
      <span className="sb2-crs">EPSG:32643</span>
    </div>
  );
}
