name := "FastEntityMapper"

version := "1.0"

scalaVersion := "2.12.18"

libraryDependencies ++= Seq(
  "org.apache.spark" %% "spark-core" % "3.3.2",
  "org.apache.spark" %% "spark-sql" % "3.3.2",
  "org.apache.spark" %% "spark-graphx" % "3.3.2",
  "net.snowflake" % "spark-snowflake_2.12" % "2.10.0-spark_3.2"
)

