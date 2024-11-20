# bitcoin-class-project
Class project for CSE 6242




# HOW TO RUN
## ETL

## Scala 
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



## Clusterization
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

## Data visualization 
