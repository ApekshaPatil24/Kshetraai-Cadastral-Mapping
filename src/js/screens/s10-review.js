/* S10 — Human-in-the-Loop Review */
let reviewMap = null;
let reviewQueue = [];
let currentReviewIdx = 0;

function init_s10_review() {
  const el = document.getElementById("s10-review");
  if (el._initialized) { if(reviewMap) reviewMap.invalidateSize(); return; }
  el._initialized = true;

  reviewQueue = TERRA.parcels.filter(p => p.status !== "validated");

  el.innerHTML = `
    <div class="screen-topbar">
      <div>
        <div class="screen-title">Human-in-the-Loop Review</div>
        <div class="screen-subtitle">158 parcels requiring human verification — 0 reviewed this session</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:var(--space-3)">
        <span class="conf-pill medium">127 Flagged</span>
        <span class="conf-pill low">31 Discrepancy</span>
      </div>
    </div>

    <div class="review-layout">

      <!-- Review queue -->
      <div class="review-queue">
        <div class="review-queue-header">
          <div style="font-size:11px;font-weight:700;color:var(--color-ink-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:var(--space-2)">Review Queue</div>
          <div style="display:flex;gap:var(--space-2)">
            <span class="tag review" style="flex:1;justify-content:center">${reviewQueue.filter(p=>p.status==='review').length} Flagged</span>
            <span class="tag error" style="flex:1;justify-content:center">${reviewQueue.filter(p=>p.status==='discrepancy').length} Discrepancy</span>
          </div>
        </div>
        <div class="review-queue-list">
          ${reviewQueue.map((p, i) => `
            <div class="review-item${i===0?' selected':''}" onclick="selectReviewItem(this, ${i})" id="ritem-${i}">
              <div class="review-item-marker" style="background:${p.status==='discrepancy'?'var(--color-coral)':'var(--color-amber)'}"></div>
              <div class="review-item-body">
                <div class="review-item-id">${p.id}</div>
                <div class="review-item-issue">${p.topo!=='clean'?p.topo.toUpperCase()+' topology':'Low confidence boundary'} &nbsp;·&nbsp; ${p.cls}</div>
              </div>
              <div class="review-item-conf" style="color:${p.status==='discrepancy'?'var(--color-coral)':'var(--color-amber)'}">${p.conf}</div>
            </div>
          `).join("")}
          <div style="padding:var(--space-3) var(--space-4);font-size:11px;color:var(--color-ink-muted);border-top:1px solid var(--border-color)">
            + 146 more in full queue
          </div>
        </div>
      </div>

      <!-- Map + action bar -->
      <div class="review-main">
        <div id="review-map"></div>

        <!-- Review toolbar overlay -->
        <div style="position:absolute;top:12px;left:12px;z-index:500;display:flex;flex-direction:column;gap:4px">
          <button class="map-toolbar-btn" title="Edit vertices" onclick="">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="map-toolbar-btn" title="Redraw polygon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>
          </button>
          <div class="map-toolbar-separator"></div>
          <button class="map-toolbar-btn" title="Toggle SOI layer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
          </button>
        </div>

        <!-- Parcel detail overlay (top-right) -->
        <div style="position:absolute;top:12px;right:12px;z-index:500;background:rgba(255,255,255,0.97);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:var(--space-4);min-width:220px;box-shadow:var(--shadow-md)">
          <div id="review-parcel-id" style="font-size:13px;font-weight:700;color:var(--color-primary);margin-bottom:var(--space-2)">${reviewQueue[0]?.id}</div>
          <div style="display:flex;flex-direction:column;gap:4px" id="review-parcel-meta">
            <div style="display:flex;justify-content:space-between;font-size:11px">
              <span style="color:var(--color-ink-muted)">Class</span>
              <span style="font-weight:600">${reviewQueue[0]?.cls}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px">
              <span style="color:var(--color-ink-muted)">Area</span>
              <span style="font-weight:600">${reviewQueue[0]?.area} m²</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px">
              <span style="color:var(--color-ink-muted)">Confidence</span>
              <span style="font-weight:700;color:var(--color-amber)">${reviewQueue[0]?.conf}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px">
              <span style="color:var(--color-ink-muted)">Issue</span>
              <span style="font-weight:600;color:var(--color-coral)">${reviewQueue[0]?.topo !== 'clean' ? reviewQueue[0]?.topo + ' error' : 'Low conf.'}</span>
            </div>
          </div>
        </div>

        <div class="review-action-bar">
          <div class="review-action-info">
            <div class="review-action-parcel-id" id="action-parcel-id">${reviewQueue[0]?.id} — ${reviewQueue[0]?.cls}</div>
            <div class="review-action-issue" id="action-issue">Review reason: ${reviewQueue[0]?.topo!=='clean'?reviewQueue[0]?.topo.toUpperCase()+' topology error':'Low confidence boundary (conf: '+reviewQueue[0]?.conf+')'}</div>
          </div>
          <button class="btn btn-ghost" onclick="reviewAction('skip')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><polyline points="9 18 15 12 9 6"/></svg>
            Skip
          </button>
          <button class="btn btn-secondary" onclick="reviewAction('edit')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Geometry
          </button>
          <button class="btn btn-secondary" style="border-color:var(--color-coral);color:var(--color-coral)" onclick="reviewAction('reject')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Reject
          </button>
          <button class="btn btn-primary" onclick="reviewAction('approve')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><polyline points="20 6 9 17 4 12"/></svg>
            Approve
          </button>
        </div>
      </div>

    </div>
  `;

  reviewMap = L.map("review-map", { center:[23.108, 72.605], zoom:18, zoomControl:false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:21 }).addTo(reviewMap);

  drawReviewParcel(0);
}

function drawReviewParcel(idx) {
  if (!reviewMap) return;
  reviewMap.eachLayer(l => { if (l instanceof L.Polygon) reviewMap.removeLayer(l); });
  const p = reviewQueue[idx];
  if (!p) return;

  const col = p.status==="discrepancy"?"#CF655C":"#D9AD58";
  const soiCol = "#4B82B8";

  const lat = 23.1090 - idx*0.0003;
  const lng = 72.605;
  const w=0.0009, h=0.0007;

  // AI parcel
  L.polygon([[lat,lng],[lat,lng+w],[lat-h,lng+w],[lat-h,lng]],{
    color:col, weight:2.5, fillColor:col, fillOpacity:0.25
  }).addTo(reviewMap).bindPopup("AI: " + p.id);

  // SOI reference (offset)
  if (p.match) {
    L.polygon([[lat+0.0001,lng-0.00005],[lat+0.0001,lng+w-0.00005],[lat-h+0.0001,lng+w-0.00005],[lat-h+0.0001,lng-0.00005]],{
      color:soiCol, weight:1.5, fillColor:soiCol, fillOpacity:0.08, dashArray:"5,3"
    }).addTo(reviewMap).bindPopup("SOI: " + p.match);
  }

  reviewMap.setView([lat-h/2, lng+w/2], 19);
}

function selectReviewItem(el, idx) {
  document.querySelectorAll(".review-item").forEach(e => e.classList.remove("selected"));
  el.classList.add("selected");
  currentReviewIdx = idx;
  const p = reviewQueue[idx];
  if (p) {
    document.getElementById("review-parcel-id").textContent = p.id;
    document.getElementById("action-parcel-id").textContent = p.id + " — " + p.cls;
    document.getElementById("action-issue").textContent = "Review reason: " + (p.topo!=='clean' ? p.topo.toUpperCase()+' topology error' : 'Low confidence boundary (conf: '+p.conf+')');
    drawReviewParcel(idx);
  }
}

function reviewAction(action) {
  const item = document.getElementById("ritem-" + currentReviewIdx);
  if (action === "approve") {
    item.style.opacity = "0.4";
    item.style.pointerEvents = "none";
    const marker = item.querySelector(".review-item-marker");
    if (marker) marker.style.background = "var(--color-secondary)";
  } else if (action === "reject") {
    item.style.opacity = "0.4";
    item.style.pointerEvents = "none";
  }
  // Advance to next
  if (currentReviewIdx < reviewQueue.length - 1) {
    currentReviewIdx++;
    selectReviewItem(document.getElementById("ritem-" + currentReviewIdx), currentReviewIdx);
  }
}
