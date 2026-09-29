/* ============================================================
   TERRA-CADASTRAL AI — Locked Mock Data
   All numbers are frozen per the product specification.
   DO NOT change parcel counts, IDs, or mission parameters.
   ============================================================ */

const TERRA = {

  mission: {
    id:           "TC-2024-GJ04",
    region:       "Gujarat",
    sector:       "Sector 04",
    district:     "Gandhinagar",
    village:      "Chandkheda",
    flightDate:   "2024-11-14",
    pilot:        "Op. Ramesh Patel",
    area_km2:     2.34,
    drone:        "DJI Matrice 350 RTK",
    camera:       "Zenmuse P1 (45 MP)",
    gsd_cm:       2.8,
    overlap_fwd:  80,
    overlap_lat:  75,
    altitude_m:   120,
    images:       847,
    flightTime:   "42 min 18 sec",
    gcp_count:    12,
    rtk_accuracy: "±0.8 cm",
    epsg:         32643,
    epsg_name:    "WGS 84 / UTM Zone 43N",
    crs_label:    "EPSG:32643"
  },

  summary: {
    total_parcels:    1247,
    validated:        1089,
    flagged_review:   127,
    low_confidence:   31,
    pct_validated:    87.3,
    pct_review:       10.2,
    pct_low:          2.5
  },

  topology: {
    total_checks:   3741,
    errors_total:   23,
    gap_errors:     9,
    overlap_errors: 11,
    sliver_poly:    3,
    pct_clean:      99.4
  },

  storage: {
    db_host:       "postgis-kshetra-gj04.internal",
    db_name:       "postgis_kshetra_gj04",
    table:         "cadastral_parcels_gj04",
    srid:          "EPSG:32643",
    geom_type:     "MULTIPOLYGON",
    records:       1247,
    size_mb:       48.6,
    indexed:       true,
    last_commit:   "2024-11-15 03:42:17 UTC"
  },

  reference_gis: {
    source:        "Survey of India (SOI)",
    year:          2019,
    parcels:       1180,
    matched_ai:    1103,
    new_detected:  144,
    missing_vs_ai: 21,
    pct_match:     93.5
  },

  preprocessing: {
    stages: [
      { id: "ortho",   label: "Orthomosaic Generation",  status: "done",   duration: "18 min 42 sec", output: "847-image ortho @ 2.8cm GSD" },
      { id: "dem",     label: "DEM / DSM Generation",     status: "done",   duration: "12 min 05 sec", output: "0.05m resolution DEM" },
      { id: "radiom",  label: "Radiometric Correction",   status: "done",   duration: "3 min 22 sec",  output: "BRDF-corrected reflectance" },
      { id: "geom",    label: "Geometric Registration",   status: "done",   duration: "4 min 11 sec",  output: "RMS error: 0.6 px" },
      { id: "tile",    label: "Tile Generation (WMTS)",   status: "done",   duration: "6 min 58 sec",  output: "Z12–Z21, 3 bands" }
    ]
  },

  ai_model: {
    name:        "ParcelNet-v3.1",
    backbone:    "Swin Transformer-L",
    task:        "Instance Segmentation + Boundary Detection",
    trained_on:  "DLR-India Cadastral Dataset + custom GJ annotations",
    input_gsd:   "2–5 cm/px",
    inference:   "14 min 31 sec",
    gpu:         "NVIDIA A100 40GB",
    classes:     ["Residential Plot", "Commercial Plot", "Open Land", "Road", "Water Body", "Agricultural"],
    iou_val:     0.913,
    f1_val:      0.887
  },

  /* Parcel table — 12 representative rows shown in UI tables */
  parcels: [
    { id:"GJ04-0001", area:312,  cls:"Residential Plot", conf:0.97, status:"validated",    topo:"clean",   match:"SOI-1103",  edited:false },
    { id:"GJ04-0002", area:248,  cls:"Residential Plot", conf:0.95, status:"validated",    topo:"clean",   match:"SOI-1104",  edited:false },
    { id:"GJ04-0003", area:189,  cls:"Commercial Plot",  conf:0.91, status:"validated",    topo:"clean",   match:"SOI-1107",  edited:false },
    { id:"GJ04-0004", area:540,  cls:"Open Land",        conf:0.83, status:"review",       topo:"clean",   match:"SOI-1109",  edited:false },
    { id:"GJ04-0005", area:97,   cls:"Residential Plot", conf:0.78, status:"review",       topo:"gap",     match:null,        edited:false },
    { id:"GJ04-0006", area:421,  cls:"Agricultural",     conf:0.96, status:"validated",    topo:"clean",   match:"SOI-1115",  edited:false },
    { id:"GJ04-0007", area:68,   cls:"Residential Plot", conf:0.61, status:"discrepancy",  topo:"overlap", match:null,        edited:false },
    { id:"GJ04-0008", area:233,  cls:"Commercial Plot",  conf:0.89, status:"review",       topo:"clean",   match:"SOI-1122",  edited:false },
    { id:"GJ04-0009", area:177,  cls:"Road",             conf:0.98, status:"validated",    topo:"clean",   match:"SOI-1128",  edited:false },
    { id:"GJ04-0010", area:502,  cls:"Open Land",        conf:0.72, status:"discrepancy",  topo:"sliver",  match:null,        edited:false },
    { id:"GJ04-0011", area:144,  cls:"Residential Plot", conf:0.94, status:"validated",    topo:"clean",   match:"SOI-1135",  edited:false },
    { id:"GJ04-0012", area:388,  cls:"Agricultural",     conf:0.88, status:"review",       topo:"clean",   match:"SOI-1139",  edited:false }
  ],

  /* Topology error list */
  topo_errors: [
    { id:"TOPO-001", type:"gap",     severity:"medium", parcels:["GJ04-0005","GJ04-0011"], area_m2:2.3  },
    { id:"TOPO-002", type:"overlap", severity:"high",   parcels:["GJ04-0007","GJ04-0008"], area_m2:14.7 },
    { id:"TOPO-003", type:"sliver",  severity:"low",    parcels:["GJ04-0010"],             area_m2:0.8  },
    { id:"TOPO-004", type:"gap",     severity:"low",    parcels:["GJ04-0003","GJ04-0004"], area_m2:1.1  },
    { id:"TOPO-005", type:"overlap", severity:"medium", parcels:["GJ04-0001","GJ04-0002"], area_m2:7.2  }
  ],

  /* Processing timeline for Stage 02 */
  timeline: [
    { t:0,   label:"Images ingested",          pct:0   },
    { t:180, label:"SfM point cloud",           pct:18  },
    { t:420, label:"Orthomosaic complete",      pct:42  },
    { t:600, label:"DEM/DSM generated",         pct:60  },
    { t:780, label:"Tiles published",           pct:78  },
    { t:900, label:"AI inference started",      pct:90  },
    { t:990, label:"Feature extraction done",   pct:99  },
    { t:1020,label:"Vectorization complete",    pct:100 }
  ],

  /* Export formats for Stage 11 */
  export_formats: [
    { fmt:"GeoPackage (.gpkg)", standard:"OGC",          srid:"EPSG:32643", size:"14.2 MB", status:"ready"   },
    { fmt:"Shapefile (.shp)",   standard:"ESRI",         srid:"EPSG:32643", size:"11.8 MB", status:"ready"   },
    { fmt:"GeoJSON (.geojson)", standard:"RFC 7946",     srid:"EPSG:4326",  size:"22.1 MB", status:"ready"   },
    { fmt:"KML (.kml)",         standard:"OGC/Google",   srid:"EPSG:4326",  size:"9.4 MB",  status:"ready"   },
    { fmt:"PostGIS Dump (.sql)",standard:"PostgreSQL 15", srid:"EPSG:32643", size:"31.7 MB", status:"ready"   },
    { fmt:"DXF (CAD ready)",    standard:"AutoCAD 2018", srid:"local grid", size:"8.1 MB",  status:"pending" }
  ]

};

window.TERRA = TERRA;
