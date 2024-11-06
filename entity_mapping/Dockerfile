# Start with an official Spark image compatible with Scala 2.12
FROM bitnami/spark:3.3.2

# Switch to root user to install SDKMAN!, Java, wget, and other packages
USER root

# Install Java 11, wget, curl, and SDKMAN!
RUN apt-get update && \
    apt-get install -y openjdk-11-jdk wget curl zip unzip && \
    rm -rf /var/lib/apt/lists/* && \
    curl -s "https://get.sdkman.io" | bash

# Set JAVA_HOME for OpenJDK 11
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH=$PATH:$JAVA_HOME/bin:$HOME/.sdkman/candidates/scala/current/bin

# Download Snowflake Connector JARs
RUN mkdir -p /opt/spark/jars && \
    wget -P /opt/spark/jars https://repo1.maven.org/maven2/net/snowflake/spark-snowflake_2.12/2.16.0-spark_3.3/spark-snowflake_2.12-2.16.0-spark_3.3.jar && \
    wget -P /opt/spark/jars https://repo1.maven.org/maven2/net/snowflake/snowflake-jdbc/3.20.0/snowflake-jdbc-3.20.0.jar

# Install Scala 2.12 using SDKMAN!
RUN bash -c "source $HOME/.sdkman/bin/sdkman-init.sh && \
    sdk install scala 2.12.18"

# Download Snowflake Connector JARs
#RUN mkdir -p /opt/spark/jars && \
#    wget -P /opt/spark/jars https://repo1.maven.org/maven2/net/snowflake/spark-snowflake_2.12/2.10.0-spark_3.2/spark-snowflake_2.12-2.10.0-spark_3.2.jar && \
#    wget -P /opt/spark/jars https://repo1.maven.org/maven2/net/snowflake/snowflake-jdbc/3.13.14/snowflake-jdbc-3.13.14.jar

# Optionally, switch back to non-root user (uncomment if necessary)
# USER 1001

# Set Spark configuration
COPY spark-defaults.conf /opt/bitnami/spark/conf/

# Set Spark as the entrypoint
ENTRYPOINT ["/opt/bitnami/spark/bin/spark-submit"]

