import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';

import DataAcquisition from './screens/DataAcquisition';
import AIProcessing from './screens/AIProcessing';
import GISParcel from './screens/GISParcel';
import Validation from './screens/Validation';
import WebGIS from './screens/WebGIS';
import HumanReview from './screens/HumanReview';
import Export from './screens/Export';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/acquisition" replace />} />
        <Route path="acquisition" element={<DataAcquisition />} />
        <Route path="ai-processing" element={<AIProcessing />} />
        <Route path="gis-parcel" element={<GISParcel />} />
        <Route path="validation" element={<Validation />} />
        <Route path="storage" element={
          <div style={{padding: '60px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: 20, fontWeight: 800, color: 'var(--c-primary)', marginBottom: 8}}>✓ SPATIAL DATA SYNCHRONIZED</div>
            <div style={{fontSize: 14, color: 'var(--c-ink-muted)', marginBottom: 24}}>Spatial Storage Workspace (Dummy)</div>
            <a href="/webgis" style={{padding: '12px 24px', background: 'var(--c-cyan)', color: '#fff', borderRadius: 6, fontWeight: 800, textDecoration: 'none'}}>OPEN WEB GIS →</a>
          </div>
        } />
        <Route path="webgis" element={<WebGIS />} />
        <Route path="human-review" element={<HumanReview />} />
        <Route path="export" element={<Export />} />
      </Route>
    </Routes>
  );
}

export default App;
