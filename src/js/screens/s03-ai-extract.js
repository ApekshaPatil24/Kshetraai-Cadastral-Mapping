/* S03 — AI Feature Extraction */
function init_s03_ai_extract() {
  const el = document.getElementById("s03-ai-extract");
  if (el._initialized) return;
  el._initialized = true;
  const ai = TERRA.ai_model;

  el.innerHTML = `
    <div class="screen-topbar">
      <div>
        <div class="screen-title">AI Feature Extraction</div>
        <div class="screen-subtitle">Instance segmentation &amp; boundary detection — ${ai.name}</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:var(--space-3)">
        <span class="tag validated">Inference Complete</span>
        <span style="font-size:var(--text-sm);font-weight:600;color:var(--color-ink-muted)">${ai.inference}</span>
      </div>
    </div>
    <div class="preprocess-layout">

      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-label">Parcels Extracted</div>
          <div class="metric-value">1,247</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">IoU (Validation)</div>
          <div class="metric-value green">${ai.iou_val}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">F1 Score</div>
          <div class="metric-value green">${ai.f1_val}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Inference Time</div>
          <div class="metric-value cyan">${ai.inference}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">GPU</div>
          <div class="metric-value" style="font-size:13px">A100 40GB</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5)">

        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">Model Details</div>
          </div>
          <div class="panel-body" style="display:flex;flex-direction:column;gap:var(--space-3)">
            ${[
              ["Model Name", ai.name],
              ["Backbone", ai.backbone],
              ["Task", ai.task],
              ["Training Data", ai.trained_on],
              ["Input GSD Range", ai.input_gsd],
              ["GPU", ai.gpu],
            ].map(r => `
              <div style="display:flex;gap:var(--space-3);justify-content:space-between;align-items:flex-start;padding:5px 0;border-bottom:1px solid var(--border-color)">
                <span style="font-size:11px;font-weight:600;color:var(--color-ink-muted);text-transform:uppercase;letter-spacing:0.04em;white-space:nowrap">${r[0]}</span>
                <span style="font-size:12px;font-weight:600;color:var(--color-ink);text-align:right">${r[1]}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">Feature Classes Detected</div>
          </div>
          <div class="panel-body" style="display:flex;flex-direction:column;gap:var(--space-2)">
            ${[
              ["Residential Plot",  642, "#4E8F73"],
              ["Open Land",         218, "#5AAEBC"],
              ["Agricultural",      187, "#D9AD58"],
              ["Commercial Plot",   121, "#4B82B8"],
              ["Road",               54, "#657572"],
              ["Water Body",         25, "#CF655C"],
            ].map(r => `
              <div style="display:flex;align-items:center;gap:var(--space-3);padding:5px 0">
                <div style="width:10px;height:10px;border-radius:2px;background:${r[2]};flex-shrink:0"></div>
                <span style="font-size:12px;font-weight:600;color:var(--color-ink);flex:1">${r[0]}</span>
                <span style="font-size:12px;font-weight:700;color:var(--color-ink-muted)">${r[1]}</span>
                <div style="width:80px;height:4px;background:var(--border-color);border-radius:2px;overflow:hidden">
                  <div style="height:100%;background:${r[2]};width:${Math.round(r[1]/1247*100)}%;border-radius:2px"></div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

      </div>

      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Boundary Detection Quality</div>
          <span style="margin-left:auto;font-size:11px;color:var(--color-ink-muted)">Per-class IoU on Gujarat validation set</span>
        </div>
        <div class="panel-body">
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:var(--space-4)">
            ${[
              ["Residential","0.931","green"],
              ["Open Land","0.901","green"],
              ["Agricultural","0.887","green"],
              ["Commercial","0.918","green"],
              ["Road","0.958","green"],
              ["Water","0.862","amber"],
            ].map(r => `
              <div style="text-align:center;background:var(--color-mist);border-radius:var(--radius-md);padding:var(--space-3)">
                <div style="font-size:18px;font-weight:700;color:${r[2]==='green'?'var(--color-secondary)':'var(--color-amber)'}">${r[1]}</div>
                <div style="font-size:10px;font-weight:600;color:var(--color-ink-muted);margin-top:3px;text-transform:uppercase;letter-spacing:0.04em">${r[0]}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

    </div>
  `;
}
