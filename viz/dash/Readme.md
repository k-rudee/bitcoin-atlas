# Bitcoin Entity Clustering Backend

## Overview
This backend system facilitates dimensional analysis of Bitcoin entities through Principal Component Analysis (PCA) and clustering techniques. Built with FastAPI and SQLite, it provides efficient querying of high-dimensional clustering results for visualization purposes.

## Project Structure

backend/
├── app/
│   ├── main.py           # FastAPI application and endpoints
│   ├── models.py         # SQLAlchemy models
│   ├── database.py       # Database connection handling
│   ├── import_data.py    # Data ingestion script
│   ├── requirements.txt  # Dependencies
│   └── .env             # Environment variables
└── data/
    └── dataset_pca_cluster.csv  # Entity clustering dataset


## Quick Start


0. Consoldiated Command to do everything below at once
```bash
source ./viz/dash/backend/app/btc/Scripts/activate && \
pip install -r ./viz/dash/backend/app/requirements.txt && \
python ./viz/dash/backend/app/import_data.py && \
uvicorn --app-dir ./viz/dash/backend/app main:app --reload
```

1. Create and activate virtual environment:
```bash
source ./viz/dash/backend/app/btc/Scripts/activate
```
2. Install dependencies:
```bash
pip install -r viz/dash/backend/app/requirements.txt
```
3. change interpreter to use btc venv path..

4. Import data:
```bash
python ./viz/dash/backend/app/import_data.py
```
5. Start server:
```bash
uvicorn --app-dir ./viz/dash/backend/app main:app --reload
```

## API Endpoints

### GET /api/cluster-data
Returns sampled cluster data for 3D visualization.
- **Query Parameters**: 
  - sample_size (int, default=1000): Number of entities to return
- **Response**: Array of entities with PCA coordinates and cluster probabilities

### GET /api/entity/{entity_id}
Returns detailed data for a specific entity.
- **Path Parameters**:
  - entity_id (int): Unique identifier for Bitcoin entity
- **Response**: Entity details including transaction metrics and cluster memberships




# Bitcoin Entity Clustering FrontEnd

## Overview
The frontend system provides a highly interactive interface for visualizing and analyzing Bitcoin entity clustering data. Built with React, D3.js, and Three.js, it seamlessly integrates 2D statistical analysis and 3D clustering visualizations to enhance user understanding of Bitcoin clustering results.

## Project Structure
frontend/
├── public/
│   └── data/
│       └── entity2.csv            # Data file for network statistics
├── src/
│   ├── components/
│   │   ├── Clustering3D.jsx       # 3D clustering visualization
│   │   ├── StatAnalysisChart.jsx  # Statistical analysis charts
│   │   └── StatisticsPanel.jsx    # Key statistical summaries
│   ├── App.jsx                    # Main application component
│   ├── index.css                  # Global CSS styles
│   ├── index.js                   # React entry point
│   └── utils.js                   # Utility functions 
├── package.json                   # Dependencies and scripts
└── README.md                      # Documentation



## Key Components

# App.jsx
Loading and processing of CSV data.
Managing active tabs for switching between analysis views.
Rendering global styles and setting the theme.

# Clustering3D.jsx
Interactive 3D Points: Data points are plotted in a 3D space with PCA1, PCA2, and PCA3 axes.
User Controls:
Entity search by ID with real-time highlighting.
Adjustable sample sizes for performance optimization.
Enhanced Visualization:
Dynamic tooltips and axis labels.
Zoom, pan, and rotate functionality with OrbitControls.
Tools Used:
@react-three/fiber for rendering 3D objects.
@react-three/drei for camera controls and text rendering.
Fetches cluster data from the backend via REST API endpoints.

# StatAnalysisChart.jsx

Charts Rendered:
Pie Chart:
Visualizes entity type distribution.
Includes a legend with percentages and labels.
Histogram:
Represents transaction size distribution on a logarithmic scale.


# StatisticsPanel.jsx
Displays an overview of the dataset with cards summarizing key metrics.


## Quick Start

0. Consolidated Command to do everything below at once

```bash
(cd viz/dash/frontend && \
rm -rf node_modules package-lock.json && \
npm install vite @vitejs/plugin-react --save-dev && \
npm install && \
npm run dev)
```

1. Install dependencies (if running steps separately)
```bash
cd viz/dash/frontend
rm -rf node_modules package-lock.json
npm install vite @vitejs/plugin-react --save-dev
npm install
```

2. Start the development server
```bash
npm run dev
```

3. Access the application on localhost to view visulizations 


