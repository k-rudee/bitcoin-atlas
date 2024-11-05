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
import org.apache.spark.graphx._
import org.apache.spark.rdd.RDD

import spark.implicits._

// Group by transaction and collect public keys as a set
val txPublicKeysDF = txinsDF
  .groupBy("tx_id")
  .agg(collect_set("public_key_uuid").as("public_keys"))

// Generate edges between public keys that co-occur in the same transaction
val publicKeyPairsDF = txPublicKeysDF
  .withColumn("public_key", explode($"public_keys"))
  .withColumn("public_key_others", array_except($"public_keys", array($"public_key")))
  .withColumn("public_key_other", explode($"public_key_others"))
  .select($"public_key".as("src"), $"public_key_other".as("dst"))
  .filter($"src" < $"dst") // To avoid duplicate pairs and self-pairs
  .distinct()

// Create vertices RDD
val vertices: RDD[(VertexId, String)] = txinsDF
  .select("public_key_uuid")
  .distinct()
  .rdd
  .map(_.getString(0))
  .zipWithUniqueId()
  .map { case (publicKey, id) => (id, publicKey) }

// Create a mapping from public_key_uuid to vertexId
val vertexIdMap = vertices.map { case (id, publicKey) => (publicKey, id) }.collectAsMap()

// Broadcast the vertexIdMap
val vertexIdMapBroadcast = spark.sparkContext.broadcast(vertexIdMap)

// Create edges RDD
val edges: RDD[Edge[Int]] = publicKeyPairsDF.rdd.flatMap { row =>
  val src = row.getAs[String]("src")
  val dst = row.getAs[String]("dst")
  for {
    srcId <- vertexIdMapBroadcast.value.get(src)
    dstId <- vertexIdMapBroadcast.value.get(dst)
  } yield Edge(srcId, dstId, 0)
}

// Build the Graph
val graph = Graph(vertices, edges)

// Compute Connected Components
val cc = graph.connectedComponents().vertices

// Map back the vertex IDs to public_key_uuid
val ccMapped = cc.join(vertices).map {
  case (id, (ccId, publicKey)) => (publicKey, ccId)
}.toDF("public_key_uuid", "entity_id")


// Display the final mapping of public_key_uuid to entity_id
//ccMapped.show(10, truncate=false)  // Shows 10 rows with full column contents


// Write the entity mapping DataFrame to Snowflake
ccMapped.write
  .format("snowflake")
  .options(snowflakeOptions)
  .option("dbtable", "entity_mapping_2") // Target table in Snowflake
  .mode("overwrite")  // Use "append" if needed
  .save()

// Optional: Verify the write by reading back from Snowflake
val verifyDF = spark.read
  .format("snowflake")
  .options(snowflakeOptions)
  .option("dbtable", "entity_mapping_2")
  .load()

// verifyDF.show()
