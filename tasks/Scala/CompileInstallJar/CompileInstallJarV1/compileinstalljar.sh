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
packagename=$2
packageversion=$3
scalaversion=$4
scalaversionshort=$5
sampledatasetfilepath=$6

sampledatasetfilename=$(basename $sampledatasetfilepath)
echo "Sample dataset file name: $sampledatasetfilename"

echo "sbt compile package"

# Overrides values on build.sbt by adding a second time
cat >> build.sbt <<EOF

name := "${packagename}"
version := "${packageversion}"
scalaVersion := "${scalaversion}"
EOF

sbt compile package
#========================
# Copy data file to cluster
#========================
dbfs mkdirs dbfs:/docs --profile AZDO
dbfs mkdirs dbfs:/jar --profile AZDO

dbfs rm dbfs:/docs/$sampledatasetfilename --profile AZDO
dbfs cp $sampledatasetfilepath dbfs:/docs/$sampledatasetfilename --profile AZDO
#========================
# Install new jar
#========================
echo "Install new jar"
dbfs rm dbfs:/jar/$packagename.jar --profile AZDO
SOURCEJAR=./target/scala-$scalaversionshort/${packagename}_${scalaversionshort}-$packageversion.jar
dbfs cp $SOURCEJAR dbfs:/jar/$packagename.jar --profile AZDO
dbfs ls dbfs:/jar/$packagename.jar --profile AZDO

databricks libraries install --cluster-id $clusterid --jar dbfs:/jar/$packagename.jar --profile AZDO --profile AZDO