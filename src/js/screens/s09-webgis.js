/* ============================================================
   S09 — Web GIS View (Hero Screen)
   The GIS map is the dominant element.
   ============================================================ */

let webgisMap = null;
let webgisLayers = {};

function init_s09_webgis() {
  const el = document.getElementById("s09-webgis");
  if (el._initialized) {
    if (webgisMap) webgisMap.invalidateSize();
    return;
  }
  el._initialized = true;

  el.innerHTML = `
    <div class="webgis-layout">
      <div class="webgis-map-area">

        <!-- Map container -->
        <div id="leaflet-map"></div>

        <!-- Map toolbar -->
        <div class="map-toolbar">
          <button class="map-toolbar-btn" title="Zoom In" onclick="webgisMap.zoomIn()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="map-toolbar-btn" title="Zoom Out" onclick="webgisMap.zoomOut()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <div class="map-toolbar-separator"></div>
          <button class="map-toolbar-btn" title="Fit to extent" onclick="fitWebgisExtent()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9V5h4M21 9V5h-4M3 15v4h4M21 15v4h-4"/></svg>
          </button>
          <div class="map-toolbar-separator"></div>
          <button class="map-toolbar-btn" title="Measure" id="btn-measure">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 6L3 6M21 12l-8 0M21 18l-4 0"/></svg>
          </button>
          <button class="map-toolbar-btn" title="Select parcel" id="btn-select">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
          </button>
        </div>

        <!-- Layer legend -->
        <div class="map-layers-badge">
          <div class="map-layer-title">Map Layers</div>

          <div class="map-layer-row" id="layer-toggle-ai">
            <div class="map-layer-swatch" style="background:rgba(78,143,115,0.35);border-color:#4E8F73"></div>
            <span class="map-layer-label">AI Parcels</span>
            <span class="map-layer-count">1,247</span>
          </div>
          <div class="map-layer-row" id="layer-toggle-soi">
            <div class="map-layer-swatch" style="background:rgba(75,130,184,0.25);border-color:#4B82B8"></div>
            <span class="map-layer-label">SOI Reference</span>
            <span class="map-layer-count">1,180</span>
          </div>
          <div class="map-layer-row" id="layer-toggle-review">
            <div class="map-layer-swatch" style="background:rgba(217,173,88,0.4);border-color:#D9AD58"></div>
            <span class="map-layer-label">Flagged Review</span>
            <span class="map-layer-count">127</span>
          </div>
          <div class="map-layer-row" id="layer-toggle-topo">
            <div class="map-layer-swatch" style="background:rgba(207,101,92,0.35);border-color:#CF655C"></div>
            <span class="map-layer-label">Topology Errors</span>
            <span class="map-layer-count">23</span>
          </div>
        </div>

        <!-- Coordinate bar -->
        <div class="map-coord-bar" id="map-coord-bar">
          UTM 43N &nbsp;|&nbsp; E 388,420.4 &nbsp; N 2,564,318.7 &nbsp;|&nbsp; EPSG:32643
        </div>

      </div>

      <!-- Right Info Panel -->
      <div class="webgis-right-panel">

        <div class="gis-panel-tabs">
          <div class="gis-tab active" id="tab-summary" onclick="switchGisTab('summary')">Summary</div>
          <div class="gis-tab" id="tab-parcel" onclick="switchGisTab('parcel')">Parcel</div>
          <div class="gis-tab" id="tab-layers" onclick="switchGisTab('layers')">CRS</div>
        </div>

        <!-- SUMMARY TAB -->
        <div class="gis-panel-body" id="gis-body-summary">
          <div class="gis-stat-grid">
            <div class="gis-stat-box">
              <div class="gis-stat-val" style="color:var(--color-ink)">1,247</div>
              <div class="gis-stat-lbl">Total Parcels</div>
            </div>
            <div class="gis-stat-box">
              <div class="gis-stat-val" style="color:var(--color-secondary)">1,089</div>
              <div class="gis-stat-lbl">Validated</div>
            </div>
            <div class="gis-stat-box">
              <div class="gis-stat-val" style="color:var(--color-amber)">127</div>
              <div class="gis-stat-lbl">Review</div>
            </div>
            <div class="gis-stat-box">
              <div class="gis-stat-val" style="color:var(--color-coral)">31</div>
              <div class="gis-stat-lbl">Discrepancy</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="section-heading" style="margin-bottom:var(--space-3)">Confidence Distribution</div>

          <div class="conf-bar-wrap">
            <div class="conf-bar-label">
              <span class="conf-bar-name">High &ge; 0.92</span>
              <span class="conf-bar-pct" style="color:var(--color-secondary)">87.3%</span>
            </div>
            <div class="conf-bar-track">
              <div class="conf-bar-fill" style="width:87.3%;background:var(--color-secondary)"></div>
            </div>
          </div>

          <div class="conf-bar-wrap">
            <div class="conf-bar-label">
              <span class="conf-bar-name">Medium 0.75–0.91</span>
              <span class="conf-bar-pct" style="color:var(--color-amber)">10.2%</span>
            </div>
            <div class="conf-bar-track">
              <div class="conf-bar-fill" style="width:10.2%;background:var(--color-amber)"></div>
            </div>
          </div>

          <div class="conf-bar-wrap">
            <div class="conf-bar-label">
              <span class="conf-bar-name">Low &lt; 0.75</span>
              <span class="conf-bar-pct" style="color:var(--color-coral)">2.5%</span>
            </div>
            <div class="conf-bar-track">
              <div class="conf-bar-fill" style="width:2.5%;background:var(--color-coral)"></div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="section-heading" style="margin-bottom:var(--space-3)">Topology Status</div>
          <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)">
            <div style="flex:1">
              <div style="font-size:11px;font-weight:600;color:var(--color-ink-muted);margin-bottom:3px">Clean parcels</div>
              <div style="font-size:18px;font-weight:700;color:var(--color-secondary)">1,224</div>
            </div>
            <div style="flex:1">
              <div style="font-size:11px;font-weight:600;color:var(--color-ink-muted);margin-bottom:3px">Errors detected</div>
              <div style="font-size:18px;font-weight:700;color:var(--color-coral)">23</div>
            </div>
          </div>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
            <span class="tag error">9 Gap Errors</span>
            <span class="tag review">11 Overlaps</span>
            <span class="tag pending">3 Slivers</span>
          </div>

          <div class="divider"></div>

          <div class="section-heading" style="margin-bottom:var(--space-3)">SOI Comparison</div>
          <div style="font-size:12px;color:var(--color-ink-muted);line-height:1.7">
            <div style="display:flex;justify-content:space-between"><span>SOI baseline (2019)</span><span style="font-weight:600;color:var(--color-gis-blue)">1,180</span></div>
            <div style="display:flex;justify-content:space-between"><span>Matched to AI output</span><span style="font-weight:600;color:var(--color-secondary)">1,103</span></div>
            <div style="display:flex;justify-content:space-between"><span>New (not in SOI)</span><span style="font-weight:600;color:var(--color-amber)">144</span></div>
            <div style="display:flex;justify-content:space-between"><span>Missing vs AI</span><span style="font-weight:600;color:var(--color-coral)">21</span></div>
          </div>

          <div class="divider"></div>

          <div style="display:flex;gap:var(--space-2)">
            <button class="btn btn-primary" style="flex:1" onclick="navigateTo('s10-review')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Start Review
            </button>
            <button class="btn btn-secondary" onclick="navigateTo('s11-export')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
          </div>
        </div>

        <!-- PARCEL DETAIL TAB -->
        <div class="gis-panel-body hidden" id="gis-body-parcel">
          <div style="font-size:12px;color:var(--color-ink-muted);margin-bottom:var(--space-3)">Click a parcel on the map to inspect it.</div>
          <div id="parcel-detail-content">
            <div class="parcel-info-card">
              <div class="parcel-info-id">GJ04-0001</div>
              <div class="parcel-info-row">
                <span class="parcel-info-key">Class</span>
                <span class="parcel-info-val">Residential Plot</span>
              </div>
              <div class="parcel-info-row">
                <span class="parcel-info-key">Area</span>
                <span class="parcel-info-val">312 m²</span>
              </div>
              <div class="parcel-info-row">
                <span class="parcel-info-key">Confidence</span>
                <span class="conf-pill high">0.97</span>
              </div>
              <div class="parcel-info-row">
                <span class="parcel-info-key">Topology</span>
                <span class="tag validated">Clean</span>
              </div>
              <div class="parcel-info-row">
                <span class="parcel-info-key">SOI Match</span>
                <span class="parcel-info-val">SOI-1103</span>
              </div>
              <div class="parcel-info-row">
                <span class="parcel-info-key">Status</span>
                <span class="tag validated">Validated</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CRS / LAYERS TAB -->
        <div class="gis-panel-body hidden" id="gis-body-layers">
          <div class="section-heading" style="margin-bottom:var(--space-3)">Coordinate Reference System</div>
          <div style="background:var(--color-mist);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4)">
            <div style="font-size:13px;font-weight:700;color:var(--color-primary);margin-bottom:6px">EPSG:32643</div>
            <div style="font-size:12px;font-weight:600;color:var(--color-ink);margin-bottom:4px">WGS 84 / UTM Zone 43N</div>
            <div style="font-size:11px;color:var(--color-ink-muted);line-height:1.7">
              Datum: WGS 84<br>
              Projection: Transverse Mercator<br>
              False Easting: 500,000 m<br>
              Central Meridian: 75° E<br>
              Scale Factor: 0.9996<br>
              Units: Metres
            </div>
          </div>

          <div class="section-heading" style="margin-bottom:var(--space-3)">Data Layers</div>
          <div style="display:flex;flex-direction:column;gap:var(--space-2)">
            <div style="display:flex;align-items:center;gap:var(--space-3);padding:8px;background:rgba(78,143,115,0.07);border-radius:var(--radius-sm)">
              <div style="width:12px;height:12px;background:var(--color-secondary);border-radius:2px;flex-shrink:0"></div>
              <div style="flex:1">
                <div style="font-size:12px;font-weight:700;color:var(--color-ink)">AI Parcel Layer</div>
                <div style="font-size:10px;color:var(--color-ink-muted)">ParcelNet-v3.1 · MULTIPOLYGON</div>
              </div>
              <span class="tag validated">Active</span>
            </div>
            <div style="display:flex;align-items:center;gap:var(--space-3);padding:8px;background:rgba(75,130,184,0.07);border-radius:var(--radius-sm)">
              <div style="width:12px;height:12px;background:var(--color-gis-blue);border-radius:2px;flex-shrink:0"></div>
              <div style="flex:1">
                <div style="font-size:12px;font-weight:700;color:var(--color-ink)">SOI Reference 2019</div>
                <div style="font-size:10px;color:var(--color-ink-muted)">Survey of India baseline</div>
              </div>
              <span class="tag stored">Active</span>
            </div>
            <div style="display:flex;align-items:center;gap:var(--space-3);padding:8px;background:rgba(90,174,188,0.07);border-radius:var(--radius-sm)">
              <div style="width:12px;height:12px;background:var(--color-cyan);border-radius:2px;flex-shrink:0"></div>
              <div style="flex:1">
                <div style="font-size:12px;font-weight:700;color:var(--color-ink)">DEM / Elevation</div>
                <div style="font-size:10px;color:var(--color-ink-muted)">0.05m resolution TIFF</div>
              </div>
              <span class="tag pending">Off</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Init Leaflet map
  webgisMap = L.map("leaflet-map", {
    center: [23.108, 72.605],
    zoom: 15,
    zoomControl: false,
    attributionControl: true
  });

  // Satellite tile layer (OpenStreetMap as fallback)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 21
  }).addTo(webgisMap);

  // Generate synthetic parcel polygons around Chandkheda, Gandhinagar
  const center = [23.108, 72.605];
  webgisMap.setView(center, 16);

  // Draw mock parcel grid
  const aiParcels   = L.layerGroup();
  const soiParcels  = L.layerGroup();
  const reviewLayer = L.layerGroup();
  const topoLayer   = L.layerGroup();

  const parcels = TERRA.parcels;

  // Generate synthetic polygons in a grid
  function makeParcelPoly(lat, lng, w, h) {
    return [
      [lat,      lng],
      [lat,      lng + w],
      [lat - h,  lng + w],
      [lat - h,  lng]
    ];
  }

  let row = 0, col = 0;
  const baseLat = 23.1095, baseLng = 72.598;
  const cellW = 0.0009, cellH = 0.0007;
  const cols = 8;

  parcels.forEach((p, i) => {
    col = i % cols;
    row = Math.floor(i / cols);
    const lat = baseLat - row * (cellH + 0.0002);
    const lng = baseLng + col * (cellW + 0.0002);
    const poly = makeParcelPoly(lat, lng, cellW, cellH);

    const isReview = p.status === "review";
    const isDisc   = p.status === "discrepancy";
    const color    = isDisc ? "#CF655C" : isReview ? "#D9AD58" : "#4E8F73";

    const lPoly = L.polygon(poly, {
      color: color,
      weight: 1.5,
      fillColor: color,
      fillOpacity: 0.22,
      opacity: 0.85
    });

    lPoly.bindPopup(`
      <div style="font-family:Inter,sans-serif;min-width:160px">
        <div style="font-size:13px;font-weight:700;color:#103F3A;margin-bottom:6px">${p.id}</div>
        <table style="font-size:11px;width:100%;border-collapse:collapse">
          <tr><td style="color:#657572;padding:2px 0">Class</td><td style="font-weight:600;text-align:right">${p.cls}</td></tr>
          <tr><td style="color:#657572;padding:2px 0">Area</td><td style="font-weight:600;text-align:right">${p.area} m²</td></tr>
          <tr><td style="color:#657572;padding:2px 0">Confidence</td><td style="font-weight:700;text-align:right;color:${color}">${p.conf}</td></tr>
          <tr><td style="color:#657572;padding:2px 0">Topology</td><td style="font-weight:600;text-align:right">${p.topo}</td></tr>
          <tr><td style="color:#657572;padding:2px 0">Status</td><td style="font-weight:700;text-align:right;color:${color}">${p.status}</td></tr>
        </table>
      </div>
    `);

    aiParcels.addLayer(lPoly);
    if (isReview) reviewLayer.addLayer(lPoly);
    if (isDisc)   topoLayer.addLayer(lPoly);
  });

  // Add SOI reference (slightly offset, blue)
  for (let i = 0; i < 8; i++) {
    const lat = baseLat - i * (cellH + 0.0002) - 0.00015;
    const lng = baseLng - 0.0002;
    const poly = makeParcelPoly(lat, lng, cellW, cellH);
    soiParcels.addLayer(L.polygon(poly, {
      color: "#4B82B8", weight: 1, fillColor: "#4B82B8", fillOpacity: 0.08, dashArray: "4,3"
    }));
  }

  aiParcels.addTo(webgisMap);
  soiParcels.addTo(webgisMap);

  webgisLayers = { ai: aiParcels, soi: soiParcels, review: reviewLayer, topo: topoLayer };

  // Coordinate bar update
  webgisMap.on("mousemove", (e) => {
    const bar = document.getElementById("map-coord-bar");
    if (bar) {
      bar.textContent = `UTM 43N  |  Lat ${e.latlng.lat.toFixed(5)}°   Lng ${e.latlng.lng.toFixed(5)}°  |  EPSG:32643`;
    }
  });

  if (typeof lucide !== "undefined") lucide.createIcons();
}

function fitWebgisExtent() {
  if (webgisMap) webgisMap.setView([23.108, 72.605], 16);
}

function switchGisTab(tab) {
  ["summary","parcel","layers"].forEach(t => {
    document.getElementById("tab-" + t)?.classList.toggle("active", t === tab);
    document.getElementById("gis-body-" + t)?.classList.toggle("hidden", t !== tab);
  });
}
