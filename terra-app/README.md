# KshetraAI

## AI-Powered Urban Cadastral Mapping & Verification

## Core workflow

1. Data Acquisition
2. AI Processing
3. GIS Conversion
4. Topology Validation
5. Confidence Scoring
6. Spatial Storage
7. Web GIS
8. Human Review
9. GIS-ready Output

## Prototype features

- multi-source geospatial data ingestion
- AI processing simulation
- feature extraction visualization
- GIS vectorization simulation
- preliminary parcel generation
- topology validation
- confidence-based flagging
- spatial storage simulation
- Web GIS workspace
- human-in-the-loop review
- GIS-ready demo export

## Technology Stack
- React
- React Router
- React Leaflet (Map Visualization)
- Vite

> **Note:** This repository contains a frontend demonstration/prototype of the proposed KshetraAI workflow. AI processing, spatial database operations and GIS analysis are represented through simulated/demo interactions unless explicitly implemented.

---

## Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Build for Production

```bash
npm run build
```

## Deployment

This project is prepared for static frontend deployment (e.g., Vercel, Netlify).
The repository includes a `vercel.json` file to configure SPA routing fallbacks for production hosting. All environment configurations are client-safe and no database dependencies are required to serve the UI.
