# bitcoin-class-project
Class project for CSE 6242




# ETL
This repository organizes and processes Bitcoin blockchain data within Snowflake. The ETL pipeline follows a sequential structure, where each directory and script must be executed in order. The final output, `F_input_address_pairs.sql`, is consumed by the Scala entity mapping code.

## Structure Overview

### Directory and Script Sequence
1. **0_stnd**: Standardizes raw blockchain data.
   - `stnd_blocks.sql`: Standardizes block data.
   - `stnd_txins.sql`: Standardizes transaction input data.
   - `stnd_txouts.sql`: Standardizes transaction output data.
   - `stnd_txs.sql`: Standardizes transaction data.

2. **1_core**: Processes core features of the blockchain.
   - `bitcoin.sql`: Processes fundamental Bitcoin data.
   - `core_txouts.sql`: Processes transaction outputs.
   - **public_keys**:
     - `core_drop_new_public_keys.sql`: Drops temporary public key tables.
     - `core_new_public_keys.sql`: Identifies new public keys.
     - `core_public_keys_insert_records.sql`: Inserts new public key records.
     - `core_public_keys.sql`: Maintains the complete public key table.

3. **1_work**: Additional exploratory features (not currently used).
   - `fees_per_block.sql`: Calculates transaction fees per block.
   - `time_between_blocks.sql`: Measures time intervals between blocks.

4. **2_base**: Constructs base tables and contextual data.
   - `A_blocks_since_halving.sql`: Aggregates block data since the last halving.
   - `B_txs_since_halving.sql`: Aggregates transaction data since the last halving.
   - `C_txins_since_halving.sql`: Aggregates transaction input data since the last halving.
   - `C_txouts_since_halving.sql`: Aggregates transaction output data since the last halving.
   - `D_txins.sql`: Processes all transaction input data.
   - `D_txouts_context.sql`: Adds context to transaction outputs.
   - `D_txs_context.sql`: Adds context to transactions.
   - `E_blocks_context.sql`: Adds context to blocks.
   - `E_txouts.sql`: Processes final transaction outputs.
   - `E_txs.sql`: Processes final transactions.
   - `F_blocks.sql`: Processes final block data.
   - `F_input_address_pairs.sql`: Generates the final dataset consumed by the Scala entity mapper.

### Dependencies
- Scripts within each subfolder depend on prior scripts in numerical and alphabetical order (e.g., `0_stnd` must run before `1_core`; `A_` must run before `B_` within `2_base`).

## Running the ETL Pipeline

1. **Configure Snowflake Connection**:
   Set up your Snowflake connection settings within your environment or preferred query tool.

2. **Run Scripts in Order**:
   Execute scripts in their respective order, starting from `0_stnd` and progressing to `2_base`. For example:
   - Navigate to `sql/0_stnd` and run:
     ```sql
     -- Example: Run stnd_blocks.sql
     SOURCE stnd_blocks.sql;
     ```
   - Proceed sequentially through all directories and scripts.

3. **Verify Outputs**:
   After running the scripts, verify that the final output table, `F_input_address_pairs`, is correctly populated:
   ```sql
   SELECT * FROM F_input_address_pairs;
   ```

## Notes on "Since Halving" Tables
The `_since_halving.sql` tables (e.g., `A_blocks_since_halving.sql`) include approximately 2016 blocks (~two weeks of data starting at the last halving height of 840,000). These are exploratory features and are not currently used in downstream processes.

## Example Output
The `F_input_address_pairs` table contains transaction input pairs. Example:
| tx_id     | public_key_uuid_1 | public_key_uuid_2 |
|-----------|-------------------|-------------------|
| tx12345   | uuid1             | uuid2             |
| tx67890   | uuid3             | uuid4             |

For additional details or troubleshooting, consult the team or Snowflake documentation.


# Scala 
This project utilizes Spark and GraphX to perform entity mapping based on transaction input pairs. The `FastEntityMapper.scala` script reads transaction data from Snowflake, builds a graph of co-occurring public keys, computes connected components, and writes the resulting entity mapping back to Snowflake. Follow the steps below to set up and execute the script.

## Prerequisites
- **Spark**: Ensure Apache Spark is installed and configured.
- **Snowflake Connector**: The Snowflake Spark connector must be available.
- **Docker (optional)**: If running with Docker, ensure Docker and Docker Compose are installed.

## Steps to Run

1. **Set up Snowflake credentials**:
   Ensure the following environment variables are defined:
   ```bash
   export SNOWFLAKE_URL=<your_snowflake_url>
   export SNOWFLAKE_USER=<your_username>
   export SNOWFLAKE_PASSWORD=<your_password>
   export SNOWFLAKE_WAREHOUSE=<your_warehouse>
   export SNOWFLAKE_ROLE=<your_role>
   ```

2. **Build the project**:
   Use `sbt` to compile the project:
   ```bash
   sbt compile
   ```

3. **Run the script locally**:
   Execute the main method of the `FastEntityMapper` object:
   ```bash
   sbt run
   ```

4. **Run using Docker** (optional):
   Build the Docker image:
   ```bash
   docker build -t entity-mapper .
   ```
   Run the container:
   ```bash
   docker-compose up
   ```

5. **Verify output**:
   The script writes the entity mapping to the `entity_mapping_50` table in Snowflake. You can verify the output by querying Snowflake:
   ```sql
   SELECT * FROM warehouse.shared_sandbox.entity_mapping_50;
   ```

## Key Parameters and Configuration

- **Input Table**: The script reads data from `warehouse.shared_sandbox.input_address_pairs_50` in Snowflake.
- **Checkpoint Directory**: Spark checkpoints intermediate data to `/tmp/spark-checkpoint` to improve fault tolerance.
- **Output Table**: The resulting entity mapping is saved to `entity_mapping_50`.

## Script Details
- **Graph Construction**:
  - Public keys involved in the same transaction are treated as nodes.
  - Edges are created between co-occurring public keys.
  - GraphX's connected components algorithm identifies entities.
- **Data Transformation**:
  - Transaction input pairs are grouped by `tx_id`.
  - Unique pairs of public keys (`src` and `dst`) are extracted.
- **Entity Mapping**:
  - Public keys are mapped to unique entity IDs based on connected components.

## Example Output
The resulting Snowflake table will contain two columns:
- `public_key_uuid`: Unique identifier for each public key.
- `entity_id`: ID of the entity to which the public key belongs.

For example:
| public_key_uuid         | entity_id |
|--------------------------|-----------|
| 123e4567-e89b-12d3-a456 | 1         |
| 987f6543-e21b-34c6-d789 | 1         |
| abc12345-d678-90ef-ghij | 2         |



# Clusterization
The provided Python script determines the optimal number of clusters and 
prepares the dataset for visualization. Follow the steps below to set up and 
run the script:

1. **Create a new Conda environment**:  
   Run the command:  
   ```bash
   conda env create -f environment.yml
   ```

2. **Activate the Conda environment**:  
   ```bash
   conda activate cse6242_project
   ```

3. **Set parameters based on your goal**:
   - To find the optimal number of clusters, set the parameter:  
     ```python
     find_clustering: bool = True
     ```  
     Ensure other parameters are configured as needed for the experiment.
   - To prepare the dataset based on a specific number of clusters, set the parameters:  
     ```python
     find_clustering: bool = False
     n_components: int = <desired_number_of_clusters>
     ```

4. **Run the application**:  
   Execute the following command:  
   ```bash
   python -m bitcoin_app.bitcoin
   ```  

# Data visualization 

The data visualization component consists of a FastAPI backend for data processing and a React frontend for interactive visualization of Bitcoin entity clusters.

Backend

Overview: Built with FastAPI and SQLite, the backend facilitates dimensional analysis of Bitcoin entities through PCA and clustering techniques.

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

Setup and Installation

1. Create and activate virtual environment
 ```bash
   python -m venv btc
   source btc/Scripts/activate
   ```
2. Install Dependencies
   ```bash
   pip install -r requirements.txt
   ```
4. Import Data
   ```bash
   python import_data.py
   ```
6. Start Server
   ```bash
   uvicorn main:app --reload
   ```


API Endpoints

1. GET /api/cluster-data

Returns sampled cluster data for 3D visualization
Query Parameters:

sample_size (int, default=1000): Number of entities to return

Response: Array of entities with PCA coordinates and cluster probabilities


2. GET /api/entity/{entity_id}

Returns detailed data for a specific entity
Path Parameters:

entity_id (int): Unique identifier for Bitcoin entity

Response: Entity details including transaction metrics and cluster memberships


Frontend

Overview: Built with React, D3.js, and Three.js, the frontend provides interactive 2D and 3D visualizations of entity clustering results.

Directory Structure: 

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

Key Components

1. App.jsx (Main Application)

Manages data loading and processing
Handles tab navigation between analysis views
Controls global styling and theme settings

2. Clustering3D.jsx (3D Visualization)

Features:

Interactive 3D point cloud visualization
Real-time entity search and highlighting
Adjustable sample size controls

3. StatAnalysisChart.jsx 

Visualizations:

Entity type distribution (Pie Chart)
Transaction size distribution (Histogram)

4. StatisticsPanel.jsx 

Displays key dataset metrics
Provides summary statistics cards


Setup and Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Access application: Open browser and navigate to the localhost address shown in terminal



    


