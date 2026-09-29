/* S11 — GIS Export */
function init_s11_export() {
  const el = document.getElementById("s11-export");
  if (el._initialized) return;
  el._initialized = true;

  el.innerHTML = `
    <div class="screen-topbar">
      <div>
        <div class="screen-title">GIS-Ready Export</div>
        <div class="screen-subtitle">Final validated dataset — 1,247 parcels · Mission TC-2024-GJ04</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:var(--space-3)">
        <span class="tag validated">5 of 6 formats ready</span>
      </div>
    </div>

    <div class="export-layout">

      <div class="metrics-row">
        <div class="metric-card"><div class="metric-label">Final Parcel Count</div><div class="metric-value">1,247</div></div>
        <div class="metric-card"><div class="metric-label">Validated by AI</div><div class="metric-value green">1,089</div></div>
        <div class="metric-card"><div class="metric-label">Reviewed by Human</div><div class="metric-value blue">127</div></div>
        <div class="metric-card"><div class="metric-label">Topology Clean</div><div class="metric-value green">99.4%</div></div>
        <div class="metric-card"><div class="metric-label">CRS</div><div class="metric-value" style="font-size:14px">EPSG:32643</div></div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Export Formats</div>
          <span style="font-size:11px;color:var(--color-ink-muted);margin-left:auto">All formats derived from PostGIS · cadastral_parcels_gj04</span>
        </div>
        <div class="panel-body" style="display:flex;flex-direction:column;gap:var(--space-3)">
          ${TERRA.export_formats.map(f => `
            <div class="export-fmt-row">
              <div class="export-fmt-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="18"/><line x1="15" y1="15" x2="12" y2="18"/></svg>
              </div>
              <div class="export-fmt-name">${f.fmt}</div>
              <div class="export-fmt-standard">${f.standard}</div>
              <div class="export-fmt-srid">${f.srid}</div>
              <div class="export-fmt-size">${f.size}</div>
              <span class="tag ${f.status==='ready'?'validated':'pending'}">${f.status}</span>
              ${f.status==='ready' ? `
                <button class="btn btn-primary" style="font-size:11px;padding:5px 12px;margin-left:var(--space-2)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download
                </button>
              ` : `<button class="btn btn-secondary" style="font-size:11px;padding:5px 12px;margin-left:var(--space-2)" disabled>Generating…</button>`}
            </div>
          `).join("")}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5)">

        <div class="panel">
          <div class="panel-header"><div class="panel-title">Export Metadata</div></div>
          <div class="panel-body" style="display:flex;flex-direction:column;gap:var(--space-2)">
            ${[
              ["Mission","TC-2024-GJ04"],
              ["Region","Gujarat · Sector 04 · Chandkheda"],
              ["Flight Date","2024-11-14"],
              ["Total Parcels","1,247"],
              ["AI Model","ParcelNet-v3.1 (Swin-L)"],
              ["GSD","2.8 cm/px"],
              ["Horizontal CRS","EPSG:32643 (WGS 84 / UTM 43N)"],
              ["Vertical Datum","EGM2008"],
              ["Topology","PostGIS ST_IsValid() passed"],
              ["Export Prepared","2024-11-15 06:00 UTC"],
            ].map(r => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border-color)">
                <span style="font-size:11px;font-weight:600;color:var(--color-ink-muted)">${r[0]}</span>
                <span style="font-size:12px;font-weight:600;color:var(--color-ink);text-align:right">${r[1]}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><div class="panel-title">Quality Assurance Summary</div></div>
          <div class="panel-body" style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${[
              ["AI IoU Score","0.913","green"],
              ["AI F1 Score","0.887","green"],
              ["Auto-validated Parcels","87.3%","green"],
              ["Human-reviewed Parcels","10.2%","amber"],
              ["Discrepancy rate","2.5%","coral"],
              ["Topology error rate","0.6%","amber"],
              ["GCP accuracy","±0.8 cm","green"],
              ["SOI match rate","93.5%","green"],
            ].map(r => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border-color)">
                <span style="font-size:12px;color:var(--color-ink)">${r[0]}</span>
                <span style="font-size:13px;font-weight:700;color:${r[2]==='green'?'var(--color-secondary)':r[2]==='amber'?'var(--color-amber)':'var(--color-coral)'}">${r[1]}</span>
              </div>
            `).join("")}
          </div>
        </div>

      </div>

    </div>
  `;
}
