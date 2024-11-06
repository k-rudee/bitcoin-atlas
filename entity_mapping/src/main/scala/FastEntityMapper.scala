import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._
import org.apache.spark.graphx._
import org.apache.spark.rdd.RDD

object FastEntityMapper {
  def main(args: Array[String]): Unit = {
    // Initialize Spark session
    val spark = SparkSession.builder.appName("SnowflakeConnector").getOrCreate()

    // Import implicits
    import spark.implicits._

    // Set checkpoint directory
    spark.sparkContext.setCheckpointDir("/tmp/spark-checkpoint")

    // Snowflake connection options
    val snowflakeOptions = Map(
      "sfURL" -> sys.env("SNOWFLAKE_URL"),
      "sfUser" -> sys.env("SNOWFLAKE_USER"),
      "sfPassword" -> sys.env("SNOWFLAKE_PASSWORD"),
      "sfDatabase" -> "warehouse",
      "sfSchema" -> "shared_sandbox",
      "sfWarehouse" -> sys.env("SNOWFLAKE_WAREHOUSE"),
      "sfRole" -> sys.env("SNOWFLAKE_ROLE"),
      "sfSSL" -> "on"
    )

    // Read data from Snowflake into a Spark DataFrame and change to lowercase
    val txinsDF = spark.read
      .format("snowflake")
      .options(snowflakeOptions)
      .option("dbtable", "warehouse.shared_sandbox.input_address_pairs_50")
      .load()
      .withColumnRenamed("TX_ID", "tx_id")
      .withColumnRenamed("PUBLIC_KEY_UUID", "public_key_uuid")

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
      .filter($"src" < $"dst") // Avoid duplicate pairs and self-pairs
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

    // Build the Graph and Compute Connected Components
    val graph = Graph(vertices, edges)
    val cc = graph.connectedComponents().vertices

    // Map back the vertex IDs to public_key_uuid
    val ccMapped = cc.join(vertices).map {
      case (id, (ccId, publicKey)) => (publicKey, ccId)
    }.toDF("public_key_uuid", "entity_id")

    // Write the entity mapping DataFrame to Snowflake
    ccMapped.write
      .format("snowflake")
      .options(snowflakeOptions)
      .option("dbtable", "entity_mapping_2")
      .mode("overwrite")
      .save()

    // Optional: Verify the write by reading back from Snowflake
    val verifyDF = spark.read
      .format("snowflake")
      .options(snowflakeOptions)
      .option("dbtable", "entity_mapping_50")
      .load()

    verifyDF.show()
    
    // Stop Spark session
    spark.stop()
  }
}

