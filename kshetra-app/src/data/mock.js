// ============================================================
// KshetraAI — Locked Mock Data
// All numbers frozen per product specification.
// ============================================================

export const MOCK = {
  mission: {
    id: "TC-2024-GJ04",
    region: "Gujarat",
    sector: "Sector 04",
    district: "Gandhinagar",
    village: "Chandkheda",
    flightDate: "2024-11-14",
    pilot: "Op. Ramesh Patel",
    area_km2: 2.34,
    drone: "DJI Matrice 350 RTK",
    camera: "Zenmuse P1 (45 MP)",
    gsd_cm: 2.8,
    overlap_fwd: 80,
    overlap_lat: 75,
    altitude_m: 120,
    images: 847,
    flightTime: "42 min 18 sec",
    gcp_count: 12,
    rtk_accuracy: "±0.8 cm",
    epsg: 32643,
    crs_label: "EPSG:32643",
    epsg_name: "WGS 84 / UTM Zone 43N",
  },

  summary: {
    total_parcels: 1247,
    validated: 1089,
    flagged_review: 127,
    low_confidence: 31,
    pct_validated: 87.3,
    pct_review: 10.2,
    pct_low: 2.5,
  },

  topology: {
    total_checks: 3741,
    errors_total: 23,
    gap_errors: 9,
    overlap_errors: 11,
    sliver_poly: 3,
    pct_clean: 99.4,
  },

  storage: {
    db_name: "postgis_terra_gj04",
    db_host: "postgis-terra-gj04.internal",
    table: "cadastral_parcels_gj04",
    srid: "EPSG:32643",
    geom_type: "MULTIPOLYGON",
    records: 1247,
    size_mb: 48.6,
    last_commit: "2024-11-15 03:42:17 UTC",
  },

  reference_gis: {
    source: "Survey of India (SOI)",
    year: 2019,
    parcels: 1180,
    matched_ai: 1103,
    new_detected: 144,
    missing_vs_ai: 21,
    pct_match: 93.5,
  },

  ai_model: {
    name: "ParcelNet-v3.1",
    backbone: "Swin Transformer-L",
    task: "Instance Segmentation + Boundary Detection",
    iou_val: 0.913,
    f1_val: 0.887,
    inference: "14 min 31 sec",
    gpu: "NVIDIA A100 40GB",
    classes: ["Residential Plot","Commercial Plot","Open Land","Road","Water Body","Agricultural"],
  },

  workflow_stages: [
    { id: 1, label: "Acquisition",    short: "Acquisition"  },
    { id: 2, label: "Preprocess",     short: "Preprocess"   },
    { id: 3, label: "AI Extract",     short: "AI Extract"   },
    { id: 4, label: "Vectorize",      short: "Vectorize"    },
    { id: 5, label: "Parcels",        short: "Parcels"      },
    { id: 6, label: "Topology",       short: "Topology"     },
    { id: 7, label: "Confidence",     short: "Confidence"   },
    { id: 8, label: "Storage",        short: "Storage"      },
    { id: 9, label: "Web GIS",        short: "Web GIS"      },
    { id: 10, label: "Human Review",  short: "Review"       },
    { id: 11, label: "Export",        short: "Export"       },
  ],

  parcels: [
    { id:"GJ04-0001", area:312,  cls:"Residential Plot", conf:0.97, status:"validated",   topo:"clean",   match:"SOI-1103" },
    { id:"GJ04-0002", area:248,  cls:"Residential Plot", conf:0.95, status:"validated",   topo:"clean",   match:"SOI-1104" },
    { id:"GJ04-0003", area:189,  cls:"Commercial Plot",  conf:0.91, status:"validated",   topo:"clean",   match:"SOI-1107" },
    { id:"GJ04-0004", area:540,  cls:"Open Land",        conf:0.83, status:"review",      topo:"clean",   match:"SOI-1109" },
    { id:"GJ04-0005", area:97,   cls:"Residential Plot", conf:0.78, status:"review",      topo:"gap",     match:null        },
    { id:"GJ04-0006", area:421,  cls:"Agricultural",     conf:0.96, status:"validated",   topo:"clean",   match:"SOI-1115" },
    { id:"GJ04-0007", area:68,   cls:"Residential Plot", conf:0.61, status:"discrepancy", topo:"overlap", match:null        },
    { id:"GJ04-0008", area:233,  cls:"Commercial Plot",  conf:0.89, status:"review",      topo:"clean",   match:"SOI-1122" },
    { id:"GJ04-0009", area:177,  cls:"Road",             conf:0.98, status:"validated",   topo:"clean",   match:"SOI-1128" },
    { id:"GJ04-0010", area:502,  cls:"Open Land",        conf:0.72, status:"discrepancy", topo:"sliver",  match:null        },
    { id:"GJ04-0011", area:144,  cls:"Residential Plot", conf:0.94, status:"validated",   topo:"clean",   match:"SOI-1135" },
    { id:"GJ04-0012", area:388,  cls:"Agricultural",     conf:0.88, status:"review",      topo:"clean",   match:"SOI-1139" },
  ],

  topo_errors: [
    { id:"TOPO-001", type:"gap",     severity:"medium", parcels:["GJ04-0005","GJ04-0011"], area_m2:2.3  },
    { id:"TOPO-002", type:"overlap", severity:"high",   parcels:["GJ04-0007","GJ04-0008"], area_m2:14.7 },
    { id:"TOPO-003", type:"sliver",  severity:"low",    parcels:["GJ04-0010"],             area_m2:0.8  },
    { id:"TOPO-004", type:"gap",     severity:"low",    parcels:["GJ04-0003","GJ04-0004"], area_m2:1.1  },
    { id:"TOPO-005", type:"overlap", severity:"medium", parcels:["GJ04-0001","GJ04-0002"], area_m2:7.2  },
  ],

  export_formats: [
    { fmt:"GeoPackage (.gpkg)", standard:"OGC",         srid:"EPSG:32643", size:"14.2 MB", status:"ready"   },
    { fmt:"Shapefile (.shp)",   standard:"ESRI",        srid:"EPSG:32643", size:"11.8 MB", status:"ready"   },
    { fmt:"GeoJSON (.geojson)", standard:"RFC 7946",    srid:"EPSG:4326",  size:"22.1 MB", status:"ready"   },
    { fmt:"KML (.kml)",         standard:"OGC/Google",  srid:"EPSG:4326",  size:"9.4 MB",  status:"ready"   },
    { fmt:"PostGIS Dump (.sql)",standard:"PostgreSQL 15",srid:"EPSG:32643", size:"31.7 MB", status:"ready"   },
    { fmt:"DXF (CAD ready)",    standard:"AutoCAD 2018",srid:"local grid", size:"8.1 MB",  status:"pending" },
  ],
};
