#!/bin/bash
# ===================================================================================
#
# FILE:  5-compile-install-jar.sh
#
# USAGE:  bash 5-compile-install-jar.sh
#
#   DESCRIPTION: (1) Compiles Scala Code and packages as JAR.
#                (2) Copies production data to cluster for analysis.
#                (3) Copies and installs JAR file as Spark Library.
#                Uses API api/2.0/libraries/install
#                Results in a Run Id that is needed later to validate SUCCESS
#
# NOTES:  ---
# AUTHOR:  Bruno Terkaly
# VERSION:  1.0
# CREATED:  June 10, 2019
#===================================================================================
#========================
# Compile and Package
#========================
clusterid=$1
echo "sbt compile package"
sbt compile package
#========================
# Copy data file to cluster
#========================
dbfs rm  dbfs:/docs/MN212142_9392.csv
dbfs cp MN212142_9392.csv dbfs:/docs
#========================
# Install new jar
#========================
echo "Install new jar"
dbfs rm dbfs:/jar/sparkcode.jar
SOURCEJAR=./target/scala-2.11/sparkcode_2.11-1.0.jar
dbfs cp $SOURCEJAR dbfs:/jar/sparkcode.jar
dbfs ls dbfs:/jar/sparkcode.jar

databricks libraries install --cluster-id $clusterid --jar dbfs:/jar/sparkcode.jar --profile AZDO