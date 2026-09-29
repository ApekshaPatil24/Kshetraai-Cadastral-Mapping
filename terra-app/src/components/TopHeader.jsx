import './TopHeader.css';

export default function TopHeader() {
  return (
    <header className="top-header">
      
      <div className="th-brand">
        <div className="th-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        </div>
        <div className="th-identity">
          <div className="th-name">KshetraAI</div>
          <div className="th-subtitle">AI-Powered Urban Cadastral Mapping &amp; Verification</div>
        </div>
      </div>

      <div className="th-spacer" />

      <div className="th-divider" />

      <div className="th-system">
        <div className="th-region">Gujarat &bull; Sector 04</div>
        <div className="th-indicators">
          <div className="th-status">
            <span className="th-dot active" />
            <span>AI ENGINE ONLINE</span>
          </div>
          <div className="th-status">
            <span className="th-dot warning" />
            <span>GIS VALIDATION ACTIVE</span>
          </div>
          <div className="th-rtk">
            <span className="th-rtk-label">RTK</span>
            <span className="th-rtk-value">&plusmn;0.8 cm</span>
          </div>
        </div>
      </div>

    </header>
  );
}
