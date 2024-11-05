import org.apache.spark.sql.SparkSession

// Initialize Spark session
val spark = SparkSession.builder.appName("SnowflakeConnector").getOrCreate()

// Set checkpoint directory
spark.sparkContext.setCheckpointDir("/tmp/spark-checkpoint")

// Snowflake connection options
val snowflakeOptions = Map(
  "sfURL" -> <snowflake url>,
  "sfUser" -> <snowflake user>,
  "sfPassword" -> <snowflake pw>,
  "sfDatabase" -> "warehouse",
  "sfSchema" -> "shared_sandbox",
  "sfWarehouse" -> <snowflake warehouse>,
  "sfRole" -> <snowflake role>,
  "sfSSL" -> "on"  // Enforce SSL for secure connections
)

// Read data from Snowflake into a Spark DataFrame and change to lowercase
val txinsDF = spark.read
  .format("snowflake")
  .options(snowflakeOptions)
  .option("dbtable", "warehouse.shared_sandbox.input_address_pairs")
  .load()
  .withColumnRenamed("TX_ID", "tx_id")
  .withColumnRenamed("PUBLIC_KEY_UUID", "public_key_uuid")

// Display data to verify the read operation
// txinsDF.show()


import org.apache.spark.sql.functions._
import org.apache.spark.sql.{DataFrame, SparkSession}
import org.graphframes.GraphFrame

val spark = SparkSession.builder.appName("EntityMappingGraph").getOrCreate()

// Define Vertices
// Vertices include all unique public_key_uuid and tx_id (transaction virtual nodes)
val publicKeys = txinsDF.select(col("public_key_uuid").as("id")).distinct()
val transactions = txinsDF.select(col("tx_id").cast("string").as("id")).distinct()
val vertices = publicKeys.union(transactions)

// Define Edges
// Create edges between each public_key_uuid and its transaction node
val edges = txinsDF
  .select(col("public_key_uuid").as("src"), col("tx_id").cast("string").as("dst"))

// Create the GraphFrame and Run Connected Components
val graph = GraphFrame(vertices, edges)
val connectedComponents = graph.connectedComponents.run()

// Map each public_key_uuid to its entity (connected component)
val entityMappingDF = connectedComponents
  .filter(!col("id").startsWith("tx_"))  // Filter out the virtual transaction nodes
  .select(col("id").as("public_key_uuid"), col("component").as("entity_id"))

// Display the final mapping of public_key_uuid to entity_id
entityMappingDF.show(10, truncate=false)  // Shows 10 rows with full column contents

// Write the entity mapping DataFrame to Snowflake
entityMappingDF.write
  .format("snowflake")
  .options(snowflakeOptions)
  .option("dbtable", "entity_mapping") // Target table in Snowflake
  .mode("overwrite")  // Use "append" if needed
  .save()

// Optional: Verify the write by reading back from Snowflake
val verifyDF = spark.read
  .format("snowflake")
  .options(snowflakeOptions)
  .option("dbtable", "entity_mapping")
  .load()

// verifyDF.show()

