/* S08 — PostgreSQL + PostGIS Storage */
function init_s08_storage() {
  const el = document.getElementById("s08-storage");
  if (el._initialized) return;
  el._initialized = true;
  const db = TERRA.storage;

  el.innerHTML = `
    <div class="screen-topbar">
      <div>
        <div class="screen-title">PostGIS Spatial Storage</div>
        <div class="screen-subtitle">PostgreSQL 15 + PostGIS 3.4 · ${db.db_name}</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:var(--space-3)">
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:8px;height:8px;border-radius:50%;background:var(--color-secondary);animation:pulse-dot 2s infinite"></div>
          <span style="font-size:12px;font-weight:600;color:var(--color-secondary)">Connected</span>
        </div>
      </div>
    </div>

    <div class="storage-layout">

      <!-- DB header -->
      <div class="storage-db-header">
        <div class="db-icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        </div>
        <div class="db-meta">
          <div class="db-name">${db.db_name}</div>
          <div class="db-detail">${db.db_host} &nbsp;·&nbsp; PostgreSQL 15 + PostGIS 3.4 &nbsp;·&nbsp; ${db.srid}</div>
        </div>
        <div class="db-stat-row">
          <div class="db-stat"><div class="db-stat-val">1,247</div><div class="db-stat-lbl">Records</div></div>
          <div class="db-stat"><div class="db-stat-val">${db.size_mb}</div><div class="db-stat-lbl">MB</div></div>
          <div class="db-stat"><div class="db-stat-val">GEOM</div><div class="db-stat-lbl">Indexed</div></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5)">

        <!-- Schema -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">Table Schema — ${db.table}</div>
            <span class="tag stored" style="margin-left:auto">PostGIS</span>
          </div>
          <div class="panel-body">
            <table class="data-table" style="margin:-var(--space-5)">
              <thead><tr><th>Column</th><th>Type</th><th>Constraint</th><th>Notes</th></tr></thead>
              <tbody>
                ${[
                  ["parcel_id","VARCHAR(20)","PRIMARY KEY","GJ04-XXXX format"],
                  ["geom","geometry(MULTIPOLYGON,32643)","NOT NULL","PostGIS spatial column"],
                  ["land_class","VARCHAR(64)","NOT NULL","AI-assigned class"],
                  ["area_m2","NUMERIC(10,2)","NOT NULL","PostGIS ST_Area()"],
                  ["confidence","NUMERIC(4,3)","CHECK(0..1)","ParcelNet output"],
                  ["status","VARCHAR(20)","NOT NULL","validated|review|discrepancy"],
                  ["topo_status","VARCHAR(20)","","clean|gap|overlap|sliver"],
                  ["soi_match_id","VARCHAR(20)","","SOI reference parcel"],
                  ["reviewed_by","VARCHAR(64)","","Reviewer name"],
                  ["reviewed_at","TIMESTAMPTZ","","ISO 8601"],
                  ["created_at","TIMESTAMPTZ","DEFAULT now()","Ingestion timestamp"],
                ].map(r => `
                  <tr>
                    <td class="td-mono" style="font-weight:700">${r[0]}</td>
                    <td class="td-mono" style="color:var(--color-cyan)">${r[1]}</td>
                    <td style="font-size:11px;color:var(--color-ink-muted)">${r[2]}</td>
                    <td style="font-size:11px;color:var(--color-ink-muted)">${r[3]}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- SQL samples -->
        <div style="display:flex;flex-direction:column;gap:var(--space-4)">

          <div class="panel">
            <div class="panel-header"><div class="panel-title">Spatial Query — Flagged Parcels</div></div>
            <div class="panel-body" style="padding-top:var(--space-3)">
              <div class="sql-block"><span class="kw">SELECT</span> parcel_id, land_class, confidence,
       <span class="fn">ST_Area</span>(geom) <span class="kw">AS</span> area_m2
<span class="kw">FROM</span>  <span class="str">cadastral_parcels_gj04</span>
<span class="kw">WHERE</span> status = <span class="str">'review'</span>
  <span class="kw">AND</span>   confidence &lt; <span class="str">0.92</span>
<span class="kw">ORDER BY</span> confidence <span class="kw">ASC</span>
<span class="kw">LIMIT</span> <span class="str">50</span>;
<span class="cm">-- Returns: 127 rows (10.2% of dataset)</span></div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header"><div class="panel-title">Spatial Query — Topology Intersects</div></div>
            <div class="panel-body" style="padding-top:var(--space-3)">
              <div class="sql-block"><span class="kw">SELECT</span> a.parcel_id, b.parcel_id,
       <span class="fn">ST_Area</span>(<span class="fn">ST_Intersection</span>(a.geom, b.geom))
<span class="kw">FROM</span>  <span class="str">cadastral_parcels_gj04</span> a
<span class="kw">JOIN</span>  <span class="str">cadastral_parcels_gj04</span> b
   <span class="kw">ON</span>  <span class="fn">ST_Overlaps</span>(a.geom, b.geom)
<span class="kw">WHERE</span> a.parcel_id &lt; b.parcel_id;
<span class="cm">-- Overlap errors: 11 pairs detected</span></div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header"><div class="panel-title">Database Stats</div></div>
            <div class="panel-body" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
              ${[
                ["Table","cadastral_parcels_gj04"],
                ["SRID","EPSG:32643"],
                ["Geometry","MULTIPOLYGON"],
                ["Records","1,247"],
                ["Spatial Index","GIST (geom)"],
                ["DB Size","48.6 MB"],
                ["Last Write","2024-11-15 03:42 UTC"],
                ["Vacuum","Auto — healthy"],
              ].map(r => `
                <div style="background:var(--color-mist);border-radius:var(--radius-sm);padding:var(--space-2) var(--space-3)">
                  <div style="font-size:9px;font-weight:700;color:var(--color-ink-muted);text-transform:uppercase;letter-spacing:0.06em">${r[0]}</div>
                  <div style="font-size:12px;font-weight:700;color:var(--color-ink);margin-top:2px;font-family:monospace">${r[1]}</div>
                </div>
              `).join("")}
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}
