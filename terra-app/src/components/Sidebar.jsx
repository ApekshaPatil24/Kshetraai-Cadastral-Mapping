import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV = [
  {
    group: 'Pipeline',
    items: [
      { to: '/acquisition',   icon: 'upload',     label: 'Data Acquisition',      badge: null,   badgeType: null    },
      { to: '/ai-processing', icon: 'cpu',        label: 'AI Processing',         badge: null,   badgeType: null    },
      { to: '/gis-parcel',    icon: 'grid',       label: 'GIS + Parcel Gen.',     badge: '1,247',badgeType: 'green' },
      { to: '/validation',    icon: 'activity',   label: 'Validation + Confidence',badge: '23',  badgeType: 'amber' },
    ],
  },
  {
    group: 'Verification',
    items: [
      { to: '/webgis-review', icon: 'globe',      label: 'Web GIS + Review',      badge: '127',  badgeType: 'amber' },
      { to: '/export',        icon: 'download',   label: 'Final Export',          badge: null,   badgeType: null    },
    ],
  },
];

// Minimal inline SVG icons (avoids external dependency)
const ICONS = {
  upload:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  cpu:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M20 9h3M1 15h3M20 15h3"/></svg>,
  grid:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  activity: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  globe:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  download: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  database: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
};

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {NAV.map(group => (
        <div key={group.group} className="sb-group">
          <div className="sb-group-label">{group.group}</div>
          {group.items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sb-item${isActive ? ' sb-item--active' : ''}`}
            >
              <span className="sb-icon">{ICONS[item.icon]}</span>
              <span className="sb-label">{item.label}</span>
              {item.badge && (
                <span className={`sb-badge sb-badge--${item.badgeType}`}>{item.badge}</span>
              )}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sb-spacer" />

      <div className="sb-footer">
        <div className="sb-db-pill">
          <span className="sb-db-dot" />
          <div className="sb-db-info">
            <span className="sb-db-name">PostGIS Connected</span>
            <span className="sb-db-crs">EPSG:32643</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
