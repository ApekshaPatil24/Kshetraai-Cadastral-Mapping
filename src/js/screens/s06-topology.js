/* S06 — Topology Validation */
let topoMap = null;
function init_s06_topology() {
  const el = document.getElementById("s06-topology");
  if (el._initialized) { if(topoMap) topoMap.invalidateSize(); return; }
  el._initialized = true;

  const errors = TERRA.topo_errors;

  el.innerHTML = `
    <div class="screen-topbar">
      <div>
        <div class="screen-title">Topology Validation</div>
        <div class="screen-subtitle">3,741 checks completed · 23 errors detected</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:var(--space-3)">
        <span class="tag error">9 Gaps</span>
        <span class="tag review">11 Overlaps</span>
        <span class="tag pending">3 Slivers</span>
      </div>
    </div>

    <div class="topology-layout">

      <!-- Error list -->
      <div class="topo-list">
        <div class="topo-list-header">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color:var(--color-coral)"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div class="panel-title">Topology Errors (23)</div>
        </div>
        <div style="overflow-y:auto;flex:1">
          ${errors.map((e, i) => `
            <div class="topo-error-item${i===0?' selected':''}" onclick="selectTopoError(this, '${e.id}')">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div class="topo-error-id">${e.id}</div>
                <span class="tag ${e.severity==='high'?'error':e.severity==='medium'?'review':'pending'}">${e.severity}</span>
              </div>
              <div class="topo-error-type" style="margin-top:3px;text-transform:capitalize">${e.type.replace('_',' ')} Error</div>
              <div class="topo-error-parcels">${e.parcels.join(' · ')} &nbsp;·&nbsp; ${e.area_m2} m²</div>
            </div>
          `).join("")}
          <div style="padding:var(--space-3) var(--space-5);font-size:11px;color:var(--color-ink-muted);border-top:1px solid var(--border-color)">
            + 18 more errors in full dataset
          </div>
        </div>
        <div style="padding:var(--space-4);border-top:1px solid var(--border-color);background:var(--color-mist)">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px">
            <span style="font-size:11px;font-weight:600;color:var(--color-ink-muted)">Clean parcels</span>
            <span style="font-size:12px;font-weight:700;color:var(--color-secondary)">1,224 / 1,247</span>
          </div>
          <div style="height:5px;background:var(--border-color);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:98.2%;background:var(--color-secondary);border-radius:3px"></div>
          </div>
        </div>
      </div>

      <!-- Map + detail -->
      <div class="topo-main">
        <div id="topo-map"></div>
        <div class="topo-detail-panel" id="topo-detail">
          <div style="font-size:13px;font-weight:700;color:var(--color-primary);margin-bottom:var(--space-3)">TOPO-001 — Gap Error</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-3)">
            <div><div style="font-size:10px;color:var(--color-ink-muted);font-weight:700;text-transform:uppercase">Type</div><div style="font-size:13px;font-weight:600;color:var(--color-ink);margin-top:2px">Gap</div></div>
            <div><div style="font-size:10px;color:var(--color-ink-muted);font-weight:700;text-transform:uppercase">Severity</div><div style="font-size:13px;font-weight:600;color:var(--color-amber);margin-top:2px">Medium</div></div>
            <div><div style="font-size:10px;color:var(--color-ink-muted);font-weight:700;text-transform:uppercase">Area</div><div style="font-size:13px;font-weight:600;color:var(--color-ink);margin-top:2px">2.3 m²</div></div>
            <div><div style="font-size:10px;color:var(--color-ink-muted);font-weight:700;text-transform:uppercase">Parcels</div><div style="font-size:13px;font-weight:600;color:var(--color-ink);margin-top:2px">GJ04-0005, GJ04-0011</div></div>
          </div>
          <div style="margin-top:var(--space-3);display:flex;gap:var(--space-2)">
            <button class="btn btn-primary" style="font-size:11px;padding:5px 10px" onclick="navigateTo('s10-review')">Fix in Review</button>
            <button class="btn btn-secondary" style="font-size:11px;padding:5px 10px">Mark as Accepted</button>
            <button class="btn btn-ghost" style="font-size:11px;padding:5px 10px">Skip</button>
          </div>
        </div>
      </div>

    </div>
  `;

  topoMap = L.map("topo-map", { center:[23.108,72.605], zoom:16, zoomControl:false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:21 }).addTo(topoMap);

  const baseLat=23.1095, baseLng=72.598;
  TERRA.topo_errors.forEach((e, i) => {
    const lat = baseLat - (i*0.0012);
    const lng = baseLng + (i*0.0008);
    const color = e.severity==="high"?"#CF655C":e.severity==="medium"?"#D9AD58":"#657572";
    L.polygon([[lat,lng],[lat,lng+0.0009],[lat-0.0007,lng+0.0009],[lat-0.0007,lng]], {
      color, weight:2, fillColor:color, fillOpacity:0.3
    }).addTo(topoMap).bindPopup(`<b>${e.id}</b><br>${e.type} · ${e.area_m2}m²`);
  });
}

function selectTopoError(el, id) {
  document.querySelectorAll(".topo-error-item").forEach(e => e.classList.remove("selected"));
  el.classList.add("selected");
}
