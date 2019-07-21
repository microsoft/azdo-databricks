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

compileAndPackage() {
    packagename=$1
    packageversion=$2
    scalaversion=$3

    echo "Compiling and Packaging $packagename..."

    # Overrides values on build.sbt by adding a second time
    cat >> build.sbt <<EOF

name := "${packagename}"
version := "${packageversion}"
scalaVersion := "${scalaversion}"
EOF

    sbt compile package

    compileResult=$?

    if [ $compileResult -ne 0 ]
    then
        echo "Error while compiling and packaging the code. Check the logs for more info."
        exit $compileResult
    fi
}

copySampleDatasetToCluster() {
    sampledatasetfilepath=$1

    sampledatasetfilename=$(basename $sampledatasetfilepath)
    
    echo "Copying $sampledatasetfilename to DBFS..."
    
    dbfs mkdirs dbfs:/docs --profile AZDO

    dbfs rm dbfs:/docs/$sampledatasetfilename --profile AZDO

    dbfs cp $sampledatasetfilepath dbfs:/docs/$sampledatasetfilename --profile AZDO
}

copyAndInstallJarToCluster() {
    clusterid=$1
    packagename=$2
    packageversion=$3
    scalaversionshort=$4

    echo "Copying $packagename.jar to $clusterid..."
    
    dbfs mkdirs dbfs:/jar --profile AZDO

    dbfs rm dbfs:/jar/$packagename.jar --profile AZDO
    SOURCEJAR=./target/scala-$scalaversionshort/${packagename}_${scalaversionshort}-$packageversion.jar
    dbfs cp $SOURCEJAR dbfs:/jar/$packagename.jar --profile AZDO
    dbfs ls dbfs:/jar/$packagename.jar --profile AZDO

    echo "Installing $packagename onto $clusterid..."

    databricks libraries install --cluster-id $clusterid --jar dbfs:/jar/$packagename.jar --profile AZDO
}

waitLibraryInstallation() {
    clusterid=$1
    packagename=$2

    echo "Now waiting for $packagename to be installed on $clusterid..."

    queryStatus=`databricks libraries list --cluster-id 0702-180342-bogie734 --profile AZDO | jq '.library_statuses[]' | jq "select(.library | has(\"jar\"))" | jq "select(.library.jar | contains(\"azdopack\"))" | jq -r .status`

    jarstatus=$(databricks libraries list --cluster-id $clusterid --profile AZDO | jq '.library_statuses[]' | jq "select(.library | has(\"jar\"))" | jq "select(.library.jar | contains(\"$packagename\"))" | jq -r .status)

    if [ "$jarstatus" == "" ]
    then
        echo "Could not find an installation of $packagename on $clusterid."
        exit 1
    fi

    while [ "$jarstatus" == "INSTALLING" ]
    do
        echo "Installing $packagename.jar on $clusterid..."

        sleep 10

        jarstatus=$(databricks libraries list --cluster-id $clusterid --profile AZDO | jq '.library_statuses[]' | jq "select(.library | has(\"jar\"))" | jq "select(.library.jar | contains(\"$packagename\"))" | jq -r .status)
    done

    if [ "$jarstatus" == "FAILED" ]
    then
        echo "Error while installing library $packagename to cluster $clusterid. The installation failed."
        exit 1
    fi
}

compileAndPackage $packagename $packageversion $scalaversion
copySampleDatasetToCluster $sampledatasetfilepath
copyAndInstallJarToCluster $clusterid $packagename $packageversion $scalaversionshort
waitLibraryInstallation $clusterid $packagename