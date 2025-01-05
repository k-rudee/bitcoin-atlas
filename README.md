# Bitcoin Node Analysis Project 

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

# Data Visualization

## Backend Overview 

This backend system facilitates dimensional analysis of Bitcoin entities through Principal Component Analysis (PCA) and clustering techniques. Built with FastAPI and SQLite, it provides efficient querying of high-dimensional clustering results for visualization purposes.

## Project Structure

app/
main.py
+ Contains the FastAPI application and endpoint definitions.

models.py
+ Defines the SQLAlchemy models for database interactions.

database.py
+ Handles the database connection setup and session management.

import_data.py
+ A script for ingesting data into the application.

requirements.txt
+ Lists all the dependencies required for the project.

.env
+ Stores environment variables for database credentials and configuration details.


data/
dataset_pca_cluster_sample.csv
+ A sample dataset containing entity clustering information used in the application.



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






# FrontEnd Overview
The frontend system provides a highly interactive interface for visualizing and analyzing Bitcoin entity clustering data. Built with React, D3.js, and Three.js, it seamlessly integrates 2D statistical analysis and 3D clustering visualizations to enhance user understanding of Bitcoin clustering results.

## Project Structure

public/data/

entity2.csv
+ Data file containing network statistics.

src/components/

Clustering3D.jsx
+ Component for 3D clustering visualization using the dataset.

StatAnalysisChart.jsx
+ Renders statistical analysis charts for visual insights.

StatisticsPanel.jsx
+ Displays key statistical summaries in the application.

src/
App.jsx
+ The main React component serving as the application entry point.

index.css
+ Defines global CSS styles for the application.

index.js
+ Entry point for the React application, rendering the root component.

utils.js
+ Contains utility functions used across the application.

Root Files

package.json
+ Manages project dependencies and scripts for building, testing, and running the application.

README.md
+ Documentation for the project, including instructions and usage details.



## Quick Start

0. Consolidated Command to do everything below at once

```bash
(cd viz/dash/frontend && npm install && npm run dev)
```
1. Install dependencies 
```bash
npm install 
```
2. Start the development server
```bash
npm run dev
```
3. Access the application on localhost to view visulizations 



    


