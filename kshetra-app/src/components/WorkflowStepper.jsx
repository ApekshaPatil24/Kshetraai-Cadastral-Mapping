import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WorkflowStepper.css';

const STAGES = [
  { id: 1, label: 'Data Acquisition', route: '/acquisition' },
  { id: 2, label: 'Data Preprocessing', route: '/acquisition' },
  { id: 3, label: 'AI / ML Extraction', route: '/ai-processing' },
  { id: 4, label: 'GIS Conversion', route: '/gis-parcel' },
  { id: 5, label: 'Parcel Generation', route: '/gis-parcel' },
  { id: 6, label: 'Topology Validation', route: '/validation' },
  { id: 7, label: 'Confidence Scoring', route: '/validation' },
  { id: 8, label: 'Spatial Storage', route: '/storage' },
  { id: 9, label: 'Web GIS', route: '/webgis' },
  { id: 10, label: 'Human Review', route: '/human-review' },
  { id: 11, label: 'Final Output', route: '/export' }
];

function getStageState(stageId, currentPath) {
  // Map current path to the maximum active stage for that screen
  const maxActiveStage = {
    '/acquisition': 2,
    '/ai-processing': 3,
    '/gis-parcel': 5,
    '/validation': 7,
    '/storage': 8,
    '/webgis': 9,
    '/human-review': 10,
    '/export': 11
  }[currentPath] || 1;

  if (stageId < maxActiveStage) return 'completed';
  if (stageId === maxActiveStage) return 'current';
  return 'upcoming';
}

export default function WorkflowStepper() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const route = pathname === '/' ? '/acquisition' : pathname;
  const [isExported, setIsExported] = React.useState(false);

  React.useEffect(() => {
    const handleComplete = () => setIsExported(true);
    window.addEventListener('workflow-complete', handleComplete);
    return () => window.removeEventListener('workflow-complete', handleComplete);
  }, []);

  return (
    <nav className="workflow-stepper" aria-label="Processing workflow stages">
      {STAGES.map((stage, i) => {
        let state = getStageState(stage.id, route);
        
        // If export is done, everything including stage 11 is completed
        if (isExported) {
          state = 'completed';
        }
        const isLast = i === STAGES.length - 1;

        // Custom state simulation to demonstrate WARNING and PROBLEM states
        // In a real app this would come from a global validation state
        let finalState = state;
        if (route === '/validation' && stage.id === 6) finalState = 'warning';
        if (route === '/validation' && stage.id === 7) finalState = 'problem';

        return (
          <div key={stage.id} className="wf-group">
            <button
              className={`wf-stage wf-stage--${finalState}`}
              onClick={() => navigate(stage.route)}
              aria-label={`Stage ${stage.id}: ${stage.label}`}
              aria-current={finalState === 'current' ? 'step' : undefined}
            >
              <div className="wf-indicator">
                {finalState === 'completed' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </div>
              <div className="wf-text">
                <span className="wf-num">{String(stage.id).padStart(2,'0')}</span>
                <span className="wf-label">{stage.label}</span>
              </div>
            </button>
            {!isLast && <div className={`wf-connector wf-connector--${finalState === 'completed' ? 'done' : 'idle'}`} />}
          </div>
        );
      })}
    </nav>
  );
}
