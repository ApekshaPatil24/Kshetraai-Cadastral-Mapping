/* S04 — Vectorization & GIS Conversion */
function init_s04_vectorize() {
  const el = document.getElementById("s04-vectorize");
  if (el._initialized) return;
  el._initialized = true;

  el.innerHTML = `
    <div class="screen-topbar">
      <div>
        <div class="screen-title">Vectorization &amp; GIS Conversion</div>
        <div class="screen-subtitle">Raster mask → polygon simplification → EPSG:32643 projection</div>
      </div>
      <div style="margin-left:auto"><span class="tag validated">1,247 Polygons Generated</span></div>
    </div>
    <div class="preprocess-layout">

      <div class="metrics-row">
        <div class="metric-card"><div class="metric-label">Raw Polygons</div><div class="metric-value">1,389</div><div class="metric-sub">before simplification</div></div>
        <div class="metric-card"><div class="metric-label">After Simplification</div><div class="metric-value green">1,247</div><div class="metric-sub">Douglas-Peucker ε=0.3m</div></div>
        <div class="metric-card"><div class="metric-label">Avg. Vertices / Parcel</div><div class="metric-value">38</div></div>
        <div class="metric-card"><div class="metric-label">Positional Accuracy</div><div class="metric-value cyan">±3.2 cm</div></div>
        <div class="metric-card"><div class="metric-label">Geometry Type</div><div class="metric-value" style="font-size:13px">MULTIPOLYGON</div></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5)">

        <div class="panel">
          <div class="panel-header"><div class="panel-title">Vectorization Pipeline</div></div>
          <div class="panel-body" style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${[
              ["01", "Instance mask extraction","Binary mask per class from ParcelNet","done"],
              ["02", "Contour tracing","Suzuki-Abe algorithm","done"],
              ["03", "Polygon simplification","Douglas-Peucker ε=0.3m","done"],
              ["04", "Hole filling","Remove interior artifacts","done"],
              ["05", "CRS projection","EPSG:32643 (UTM 43N)","done"],
              ["06", "Attribute assignment","Class, confidence, area","done"],
              ["07", "GeoPackage export","OGC GPKG format","done"],
            ].map(r => `
              <div class="pipeline-stage-row" style="padding:var(--space-3) var(--space-4)">
                <div class="pipeline-stage-num" style="width:24px;height:24px;font-size:10px">${r[0]}</div>
                <div style="flex:1">
                  <div style="font-size:12px;font-weight:700;color:var(--color-ink)">${r[1]}</div>
                  <div style="font-size:11px;color:var(--color-ink-muted)">${r[2]}</div>
                </div>
                <span class="tag validated">${r[3]}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><div class="panel-title">Output File Registry</div></div>
          <div class="panel-body" style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${[
              ["cadastral_parcels_gj04.gpkg","OGC GeoPackage","14.2 MB","EPSG:32643","green"],
              ["cadastral_parcels_gj04.shp","ESRI Shapefile","11.8 MB","EPSG:32643","green"],
              ["cadastral_parcels_gj04.geojson","RFC 7946","22.1 MB","EPSG:4326","green"],
              ["parcel_boundaries_simplified.shp","Boundary only","4.1 MB","EPSG:32643","green"],
            ].map(r => `
              <div style="background:var(--color-mist);border-radius:var(--radius-md);padding:var(--space-3);display:flex;gap:var(--space-3);align-items:center">
                <div style="flex:1">
                  <div style="font-size:11px;font-weight:700;color:var(--color-ink);font-family:monospace">${r[0]}</div>
                  <div style="font-size:10px;color:var(--color-ink-muted);margin-top:2px">${r[1]} &nbsp;·&nbsp; <span style="color:var(--color-gis-blue)">${r[3]}</span></div>
                </div>
                <span style="font-size:11px;font-weight:600;color:var(--color-ink-muted)">${r[2]}</span>
                <span class="tag ${r[4]}">ready</span>
              </div>
            `).join("")}
          </div>
        </div>

      </div>
    </div>
  `;
}
