/* S07 — Confidence Scoring */
let confChartInstance = null;
function init_s07_confidence() {
  const el = document.getElementById("s07-confidence");
  if (el._initialized) return;
  el._initialized = true;

  el.innerHTML = `
    <div class="screen-topbar">
      <div>
        <div class="screen-title">Confidence Scoring &amp; Flagging</div>
        <div class="screen-subtitle">Per-parcel AI confidence scores — 31 low-confidence parcels flagged for review</div>
      </div>
    </div>
    <div class="confidence-layout">

      <div class="conf-sidebar">

        <div style="background:var(--color-mist);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:var(--space-4)">
          <div style="font-size:10px;font-weight:700;color:var(--color-ink-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:var(--space-3)">Overall Distribution</div>
          <canvas id="conf-donut" width="200" height="200"></canvas>
          <div style="margin-top:var(--space-3);display:flex;flex-direction:column;gap:var(--space-2)">
            <div style="display:flex;align-items:center;gap:var(--space-2)">
              <div style="width:10px;height:10px;border-radius:2px;background:var(--color-secondary)"></div>
              <span style="font-size:11px;font-weight:600;color:var(--color-ink);flex:1">High &ge;0.92</span>
              <span style="font-size:12px;font-weight:700;color:var(--color-secondary)">1,089</span>
            </div>
            <div style="display:flex;align-items:center;gap:var(--space-2)">
              <div style="width:10px;height:10px;border-radius:2px;background:var(--color-amber)"></div>
              <span style="font-size:11px;font-weight:600;color:var(--color-ink);flex:1">Medium 0.75–0.91</span>
              <span style="font-size:12px;font-weight:700;color:var(--color-amber)">127</span>
            </div>
            <div style="display:flex;align-items:center;gap:var(--space-2)">
              <div style="width:10px;height:10px;border-radius:2px;background:var(--color-coral)"></div>
              <span style="font-size:11px;font-weight:600;color:var(--color-ink);flex:1">Low &lt;0.75</span>
              <span style="font-size:12px;font-weight:700;color:var(--color-coral)">31</span>
            </div>
          </div>
        </div>

        <div style="background:var(--color-mist);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:var(--space-4)">
          <div style="font-size:10px;font-weight:700;color:var(--color-ink-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:var(--space-3)">Scoring Thresholds</div>
          ${[
            ["Auto-Validated",  "&ge; 0.92", "green", "No review required"],
            ["Flagged Review",  "0.75–0.91", "amber", "Human check needed"],
            ["Discrepancy",     "&lt; 0.75",  "coral", "Manual redraw required"],
          ].map(r => `
            <div style="padding:var(--space-3);background:var(--surface-panel);border-radius:var(--radius-sm);margin-bottom:var(--space-2);border-left:3px solid var(--${r[2]==='green'?'color-secondary':r[2]==='amber'?'color-amber':'color-coral'})">
              <div style="font-size:11px;font-weight:700;color:var(--color-ink)">${r[0]}</div>
              <div style="font-size:13px;font-weight:800;color:var(--${r[2]==='green'?'color-secondary':r[2]==='amber'?'color-amber':'color-coral'});font-family:monospace">${r[1]}</div>
              <div style="font-size:10px;color:var(--color-ink-muted);margin-top:2px">${r[3]}</div>
            </div>
          `).join("")}
        </div>

        <div style="background:var(--color-mist);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:var(--space-4)">
          <div style="font-size:10px;font-weight:700;color:var(--color-ink-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:var(--space-3)">Scoring Factors</div>
          ${[
            ["Boundary sharpness","0.28"],
            ["Internal homogeneity","0.22"],
            ["Shape regularity","0.18"],
            ["SOI context overlap","0.17"],
            ["Neighbor agreement","0.15"],
          ].map(r => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--border-color)">
              <span style="font-size:11px;color:var(--color-ink)">${r[0]}</span>
              <span style="font-size:11px;font-weight:700;color:var(--color-primary)">${r[1]}</span>
            </div>
          `).join("")}
        </div>

      </div>

      <div class="conf-main">

        <div class="metrics-row" style="margin-bottom:var(--space-5)">
          <div class="metric-card"><div class="metric-label">Mean Confidence</div><div class="metric-value green">0.934</div></div>
          <div class="metric-card"><div class="metric-label">Median Confidence</div><div class="metric-value green">0.947</div></div>
          <div class="metric-card"><div class="metric-label">Std. Deviation</div><div class="metric-value">0.081</div></div>
          <div class="metric-card"><div class="metric-label">Min Confidence</div><div class="metric-value coral">0.61</div></div>
          <div class="metric-card"><div class="metric-label">Max Confidence</div><div class="metric-value green">0.99</div></div>
        </div>

        <div class="panel" style="margin-bottom:var(--space-5)">
          <div class="panel-header"><div class="panel-title">Confidence Histogram</div><span style="font-size:11px;color:var(--color-ink-muted);margin-left:auto">Binned at 0.05 intervals</span></div>
          <div class="panel-body">
            <canvas id="conf-histogram" height="140"></canvas>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">Low-Confidence Parcels — Requires Review</div>
            <span class="tag error" style="margin-left:auto">31 parcels</span>
          </div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead><tr><th>Parcel ID</th><th>Class</th><th>Confidence</th><th>Reason</th><th>Topo</th><th>Action</th></tr></thead>
              <tbody>
                ${TERRA.parcels.filter(p=>p.conf<0.92).map(p=>`
                  <tr>
                    <td class="td-mono" style="font-weight:700;color:var(--color-primary)">${p.id}</td>
                    <td>${p.cls}</td>
                    <td>
                      <div class="conf-meter">
                        <div class="conf-meter-bar">
                          <div class="conf-meter-fill" style="width:${p.conf*100}%;background:${p.conf>=0.92?'var(--color-secondary)':p.conf>=0.75?'var(--color-amber)':'var(--color-coral)'}"></div>
                        </div>
                        <span class="conf-meter-val" style="color:${p.conf>=0.92?'var(--color-secondary)':p.conf>=0.75?'var(--color-amber)':'var(--color-coral)'}">${p.conf}</span>
                      </div>
                    </td>
                    <td style="font-size:11px;color:var(--color-ink-muted)">${p.topo!=='clean'?'Topology error':'Ambiguous boundary'}</td>
                    <td><span class="tag ${p.topo==='clean'?'validated':'error'}">${p.topo}</span></td>
                    <td><button class="btn btn-ghost" style="font-size:11px;padding:3px 8px" onclick="navigateTo('s10-review')">Review</button></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;

  // Donut chart
  const dCtx = document.getElementById("conf-donut").getContext("2d");
  new Chart(dCtx, {
    type: "doughnut",
    data: {
      datasets: [{ data:[1089,127,31], backgroundColor:["#4E8F73","#D9AD58","#CF655C"], borderWidth:0, hoverOffset:4 }]
    },
    options: { cutout:"72%", plugins:{ legend:{display:false} }, animation:{duration:600} }
  });

  // Histogram
  const hCtx = document.getElementById("conf-histogram").getContext("2d");
  new Chart(hCtx, {
    type: "bar",
    data: {
      labels:["0.60","0.65","0.70","0.75","0.80","0.85","0.90","0.95","1.00"],
      datasets:[{
        label:"Parcels",
        data:[8,12,11,28,62,98,182,548,298],
        backgroundColor: ctx => {
          const v = ctx.dataIndex;
          return v < 3 ? "#CF655C" : v < 5 ? "#D9AD58" : "#4E8F73";
        },
        borderRadius: 4,
        borderWidth: 0
      }]
    },
    options: {
      plugins:{ legend:{display:false} },
      scales:{
        x:{ grid:{display:false}, ticks:{color:"#657572",font:{size:11}} },
        y:{ grid:{color:"rgba(16,63,58,0.06)"}, ticks:{color:"#657572",font:{size:11}} }
      },
      animation:{duration:600}
    }
  });
}
