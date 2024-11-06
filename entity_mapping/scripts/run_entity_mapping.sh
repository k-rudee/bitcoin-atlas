# run_entity_mapping.sh
#!/bin/bash

docker-compose run spark \
    --class FastEntityMapper \
    --jars /opt/spark/jars/spark-snowflake_2.12-2.16.0-spark_3.3.jar,/opt/spark/jars/snowflake-jdbc-3.20.0.jar \
    /app/fastentitymapper_2.12-1.0.jar

