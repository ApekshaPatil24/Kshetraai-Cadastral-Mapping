/* S02 — Preprocessing Pipeline */
function init_s02_preprocess() {
  const el = document.getElementById("s02-preprocess");
  if (el._initialized) return;
  el._initialized = true;

  el.innerHTML = `
    <div class="screen-topbar">
      <div>
        <div class="screen-title">Preprocessing Pipeline</div>
        <div class="screen-subtitle">Photogrammetry, orthorectification, DEM generation &amp; tile publication</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:var(--space-3);align-items:center">
        <span class="tag validated">All Stages Complete</span>
        <span style="font-size:var(--text-sm);font-weight:600;color:var(--color-ink-muted)">Total: 45 min 18 sec</span>
      </div>
    </div>

    <div class="preprocess-layout">

      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-label">Orthomosaic GSD</div>
          <div class="metric-value cyan">2.8 cm/px</div>
          <div class="metric-sub">WGS 84 / UTM 43N</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">DEM Resolution</div>
          <div class="metric-value cyan">0.05 m</div>
          <div class="metric-sub">DSM + DTM generated</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Georeg. RMS Error</div>
          <div class="metric-value green">0.6 px</div>
          <div class="metric-sub">12 GCPs used</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">WMTS Tile Levels</div>
          <div class="metric-value">Z12–Z21</div>
          <div class="metric-sub">3-band RGB</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Point Cloud Density</div>
          <div class="metric-value">214 pts/m²</div>
          <div class="metric-sub">SfM dense cloud</div>
        </div>
      </div>

      <div class="section-heading">Processing Stages</div>

      ${TERRA.preprocessing.stages.map((s, i) => `
        <div class="pipeline-stage-row">
          <div class="pipeline-stage-num">${String(i+1).padStart(2,'0')}</div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14" style="color:var(--color-secondary);flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>
          <div class="pipeline-stage-label">${s.label}</div>
          <div class="pipeline-stage-output">${s.output}</div>
          <span class="tag validated">Done</span>
          <div class="pipeline-stage-time">${s.duration}</div>
        </div>
      `).join("")}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5)">

        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">SfM Quality Report</div>
            <span class="tag validated" style="margin-left:auto">High Quality</span>
          </div>
          <div class="panel-body" style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${[
              ["Image matches","98.7%","green"],
              ["Tie points","284,319",""],
              ["Dense cloud points","548 M",""],
              ["3D reconstruction accuracy","±1.4 cm","cyan"],
              ["Bundle adjustment RMSE","0.48 px","green"],
            ].map(r => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border-color)">
                <span style="font-size:12px;font-weight:600;color:var(--color-ink-muted)">${r[0]}</span>
                <span style="font-size:13px;font-weight:700;color:${r[2]==='green'?'var(--color-secondary)':r[2]==='cyan'?'var(--color-cyan)':'var(--color-ink)'}">${r[1]}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">Output Artifacts</div>
          </div>
          <div class="panel-body" style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${[
              ["Orthomosaic (GeoTIFF)","14.8 GB","ready","green"],
              ["DEM — DSM (GeoTIFF)","2.1 GB","ready","green"],
              ["DEM — DTM (GeoTIFF)","2.0 GB","ready","green"],
              ["Dense Point Cloud (.LAS)","8.4 GB","ready","green"],
              ["WMTS Tile Cache","6.2 GB","ready","green"],
              ["Radiometric Report (.PDF)","1.2 MB","ready","green"],
            ].map(r => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border-color)">
                <span style="font-size:12px;font-weight:600;color:var(--color-ink)">${r[0]}</span>
                <div style="display:flex;align-items:center;gap:var(--space-3)">
                  <span style="font-size:11px;color:var(--color-ink-muted)">${r[1]}</span>
                  <span class="tag ${r[3]}">${r[2]}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

      </div>
    </div>
  `;
}
