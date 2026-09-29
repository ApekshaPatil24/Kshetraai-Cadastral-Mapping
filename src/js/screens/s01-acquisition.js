/* ============================================================
   S01 — Data Acquisition
   What drone data entered the system?
   ============================================================ */

function init_s01_acquisition() {
  const el = document.getElementById("s01-acquisition");
  if (el._initialized) return;
  el._initialized = true;

  const m = TERRA.mission;

  el.innerHTML = `
    <div class="screen-topbar">
      <div>
        <div class="screen-title">Data Acquisition</div>
        <div class="screen-subtitle">Drone flight log, sensor parameters &amp; image ingestion — Mission ${m.id}</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:var(--space-3);align-items:center">
        <span class="tag validated">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>
          Ingestion Complete
        </span>
        <span style="font-size:var(--text-sm);font-weight:600;color:var(--color-ink-muted)">${m.flightDate}</span>
      </div>
    </div>

    <div class="acquisition-layout">

      <!-- Mission header card -->
      <div class="acq-mission-header">
        <div class="acq-mission-badge">
          <div class="acq-mission-badge-id">Mission</div>
          <div class="acq-mission-badge-main">TC-2024<br>GJ04</div>
          <div class="acq-mission-badge-sub">Gujarat Sector 04</div>
        </div>
        <div class="acq-mission-meta">
          <div class="acq-meta-item">
            <div class="acq-meta-label">Region</div>
            <div class="acq-meta-value">${m.region}</div>
          </div>
          <div class="acq-meta-item">
            <div class="acq-meta-label">Village / District</div>
            <div class="acq-meta-value">${m.village}, ${m.district}</div>
          </div>
          <div class="acq-meta-item">
            <div class="acq-meta-label">Flight Date</div>
            <div class="acq-meta-value">${m.flightDate}</div>
          </div>
          <div class="acq-meta-item">
            <div class="acq-meta-label">Operator</div>
            <div class="acq-meta-value">${m.pilot}</div>
          </div>
          <div class="acq-meta-item">
            <div class="acq-meta-label">Survey Area</div>
            <div class="acq-meta-value highlight">${m.area_km2} km²</div>
          </div>
          <div class="acq-meta-item">
            <div class="acq-meta-label">Flight Time</div>
            <div class="acq-meta-value">${m.flightTime}</div>
          </div>
          <div class="acq-meta-item">
            <div class="acq-meta-label">Images Captured</div>
            <div class="acq-meta-value highlight">${m.images}</div>
          </div>
          <div class="acq-meta-item">
            <div class="acq-meta-label">GCP Count</div>
            <div class="acq-meta-value">${m.gcp_count}</div>
          </div>
        </div>
      </div>

      <div class="acq-grid">

        <!-- Drone / Sensor specs -->
        <div class="panel">
          <div class="panel-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color:var(--color-primary)"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <div class="panel-title">Platform &amp; Sensor</div>
          </div>
          <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
            <div>
              <div class="acq-meta-label">Drone Model</div>
              <div style="font-size:var(--text-base);font-weight:600;color:var(--color-ink);margin-top:2px">${m.drone}</div>
            </div>
            <div>
              <div class="acq-meta-label">Camera</div>
              <div style="font-size:var(--text-base);font-weight:600;color:var(--color-ink);margin-top:2px">${m.camera}</div>
            </div>
            <div>
              <div class="acq-meta-label">Flight Altitude</div>
              <div style="font-size:var(--text-base);font-weight:600;color:var(--color-ink);margin-top:2px">${m.altitude_m} m AGL</div>
            </div>
            <div>
              <div class="acq-meta-label">GSD</div>
              <div style="font-size:var(--text-base);font-weight:700;color:var(--color-cyan);margin-top:2px">${m.gsd_cm} cm/px</div>
            </div>
            <div>
              <div class="acq-meta-label">Forward Overlap</div>
              <div style="font-size:var(--text-base);font-weight:600;color:var(--color-ink);margin-top:2px">${m.overlap_fwd}%</div>
            </div>
            <div>
              <div class="acq-meta-label">Lateral Overlap</div>
              <div style="font-size:var(--text-base);font-weight:600;color:var(--color-ink);margin-top:2px">${m.overlap_lat}%</div>
            </div>
            <div>
              <div class="acq-meta-label">RTK Positioning</div>
              <div style="font-size:var(--text-base);font-weight:700;color:var(--color-cyan);margin-top:2px">${m.rtk_accuracy}</div>
            </div>
            <div>
              <div class="acq-meta-label">Output CRS</div>
              <div style="font-size:var(--text-base);font-weight:600;color:var(--color-gis-blue);margin-top:2px">${m.crs_label}</div>
            </div>
          </div>
        </div>

        <!-- Image ingestion stats -->
        <div class="panel">
          <div class="panel-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color:var(--color-primary)"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <div class="panel-title">Image Ingestion</div>
            <span class="tag validated" style="margin-left:auto">847 images</span>
          </div>
          <div class="panel-body">
            <div class="metrics-row" style="margin-bottom:var(--space-5)">
              <div class="metric-card">
                <div class="metric-label">Total Images</div>
                <div class="metric-value">847</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Accepted</div>
                <div class="metric-value green">843</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Rejected (blur)</div>
                <div class="metric-value amber">4</div>
              </div>
            </div>
            <div style="margin-bottom:var(--space-3)">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:11px;font-weight:600;color:var(--color-ink-muted)">Ingestion Progress</span>
                <span style="font-size:11px;font-weight:700;color:var(--color-secondary)">100%</span>
              </div>
              <div style="height:6px;background:var(--border-color);border-radius:3px;overflow:hidden">
                <div style="height:100%;width:100%;background:var(--color-secondary);border-radius:3px"></div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
              <div style="background:var(--color-mist);border-radius:var(--radius-md);padding:var(--space-3)">
                <div class="acq-meta-label">Image Format</div>
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--color-ink);margin-top:2px">JPEG / DNG Raw</div>
              </div>
              <div style="background:var(--color-mist);border-radius:var(--radius-md);padding:var(--space-3)">
                <div class="acq-meta-label">Total Raw Size</div>
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--color-ink);margin-top:2px">38.4 GB</div>
              </div>
              <div style="background:var(--color-mist);border-radius:var(--radius-md);padding:var(--space-3)">
                <div class="acq-meta-label">Avg. Image Dim.</div>
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--color-ink);margin-top:2px">8,192 × 5,460 px</div>
              </div>
              <div style="background:var(--color-mist);border-radius:var(--radius-md);padding:var(--space-3)">
                <div class="acq-meta-label">Coverage Check</div>
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--color-secondary);margin-top:2px">Full — No Gaps</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- GCP table -->
      <div class="panel">
        <div class="panel-header">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color:var(--color-primary)"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div class="panel-title">Ground Control Points (GCPs)</div>
          <span class="tag validated" style="margin-left:auto">12 GCPs · RMS: 0.6 px</span>
        </div>
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>GCP ID</th><th>Easting (m)</th><th>Northing (m)</th><th>Elevation (m)</th><th>Residual X</th><th>Residual Y</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${[
                ["GCP-01","388,312.44","2,564,218.30","52.14","0.4 px","0.3 px","validated"],
                ["GCP-02","388,441.09","2,564,119.77","51.88","0.5 px","0.6 px","validated"],
                ["GCP-03","388,567.22","2,564,338.12","52.41","0.7 px","0.4 px","validated"],
                ["GCP-04","388,290.55","2,564,490.65","52.03","0.3 px","0.5 px","validated"],
                ["GCP-05","388,688.34","2,564,200.48","51.95","0.6 px","0.7 px","validated"],
              ].map(r => `
                <tr>
                  <td class="td-mono" style="font-weight:700">${r[0]}</td>
                  <td class="td-mono">${r[1]}</td>
                  <td class="td-mono">${r[2]}</td>
                  <td class="td-mono">${r[3]}</td>
                  <td>${r[4]}</td>
                  <td>${r[5]}</td>
                  <td><span class="tag ${r[6]}">${r[6]}</span></td>
                </tr>
              `).join("")}
              <tr style="background:rgba(243,247,242,0.5)">
                <td colspan="6" style="font-size:11px;font-weight:700;color:var(--color-ink-muted)">+ 7 more GCPs (all validated)</td>
                <td><span class="tag validated">All OK</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}
