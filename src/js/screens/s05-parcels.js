/* S05 — Parcel Generation */
function init_s05_parcels() {
  const el = document.getElementById("s05-parcels");
  if (el._initialized) return;
  el._initialized = true;

  function confColor(c) {
    return c >= 0.92 ? "var(--color-secondary)" : c >= 0.75 ? "var(--color-amber)" : "var(--color-coral)";
  }

  el.innerHTML = `
    <div class="screen-topbar">
      <div>
        <div class="screen-title">Parcel Generation &amp; Integration</div>
        <div class="screen-subtitle">1,247 cadastral parcels · AI-generated vs SOI reference</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:var(--space-3)">
        <span class="conf-pill high">1,089 Validated</span>
        <span class="conf-pill medium">127 Review</span>
        <span class="conf-pill low">31 Discrepancy</span>
      </div>
    </div>

    <div class="parcels-layout">
      <div style="display:flex;gap:var(--space-4);padding:var(--space-4) var(--space-5);background:var(--surface-panel);border-bottom:1px solid var(--border-color);flex-shrink:0">
        <input type="text" placeholder="Search parcel ID…" style="padding:6px 12px;border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:12px;font-family:inherit;background:var(--color-mist);color:var(--color-ink);outline:none;width:200px" />
        <select style="padding:6px 10px;border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:12px;font-family:inherit;background:var(--color-mist);color:var(--color-ink);outline:none">
          <option>All Status</option><option>Validated</option><option>Review</option><option>Discrepancy</option>
        </select>
        <select style="padding:6px 10px;border:1px solid var(--border-color);border-radius:var(--radius-sm);font-size:12px;font-family:inherit;background:var(--color-mist);color:var(--color-ink);outline:none">
          <option>All Classes</option><option>Residential Plot</option><option>Commercial Plot</option><option>Open Land</option><option>Agricultural</option><option>Road</option>
        </select>
      </div>

      <div class="parcels-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Parcel ID</th><th>Class</th><th>Area (m²)</th><th>Confidence</th><th>Topology</th><th>SOI Match</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${TERRA.parcels.map(p => {
              const cc = confColor(p.conf);
              const topoTag = p.topo === "clean" ? "validated" : p.topo === "gap" ? "review" : "error";
              const statusTag = p.status === "validated" ? "validated" : p.status === "review" ? "review" : "error";
              return `
                <tr>
                  <td class="td-mono" style="font-weight:700;color:var(--color-primary)">${p.id}</td>
                  <td><div style="display:flex;align-items:center;gap:6px"><div style="width:8px;height:8px;border-radius:2px;background:${cc};flex-shrink:0"></div>${p.cls}</div></td>
                  <td>${p.area.toLocaleString()}</td>
                  <td>
                    <div class="conf-meter">
                      <div class="conf-meter-bar">
                        <div class="conf-meter-fill" style="width:${p.conf*100}%;background:${cc}"></div>
                      </div>
                      <span class="conf-meter-val" style="color:${cc}">${p.conf}</span>
                    </div>
                  </td>
                  <td><span class="tag ${topoTag}">${p.topo}</span></td>
                  <td style="font-size:11px;color:${p.match?'var(--color-gis-blue)':'var(--color-coral)'}">${p.match || 'No match'}</td>
                  <td><span class="tag ${statusTag}">${p.status}</span></td>
                  <td>
                    <button class="btn btn-ghost" style="padding:3px 8px;font-size:11px" onclick="navigateTo('s10-review')">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Review
                    </button>
                  </td>
                </tr>
              `;
            }).join("")}
            <tr style="background:var(--color-mist)">
              <td colspan="8" style="text-align:center;font-size:12px;font-weight:600;color:var(--color-ink-muted);padding:12px">
                Showing 12 of <strong style="color:var(--color-ink)">1,247</strong> parcels
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
