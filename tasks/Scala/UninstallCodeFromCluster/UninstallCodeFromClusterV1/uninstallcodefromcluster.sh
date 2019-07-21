#!/bin/bash
# ===================================================================================
#
# FILE:  3-clean.sh
#
# USAGE:  bash 3-clean.sh
#
#   DESCRIPTION: Removes old Spark code and reboots cluster.
#                Uses API api/2.0/libraries/uninstall
#                         api/2.0/clusters/restart
#
# NOTES:  ---
# AUTHOR:  Bruno Terkaly
# VERSION:  1.0
# CREATED:  June 10, 2019
#===================================================================================
clusterid=$1
packagename=$2

uninstallPackage() {
    clusterid=$1
    packagename=$2
    databricks libraries uninstall --cluster-id $clusterid --jar "dbfs:/jar/$packagename.jar" --profile AZDO
}

restartCluster() {
    clusterid=$1
    databricks clusters restart --cluster-id $clusterid --profile AZDO
}

waitClusterReboot() {
    clusterid=$1

    lookfor=RUNNING

    clusterStatus=$(databricks clusters get --cluster-id $clusterid --profile AZDO | jq -r .state)

    if [ "$clusterStatus" == "TERMINATED"]
    do
        echo "The cluster $clusterid is not rebooting."
        exit 1
    done

    while [ "$clusterStatus" != "$lookfor" ]
    do
        sleep 10
        echo "Restarting $clusterid..."
        clusterStatus=$(databricks clusters get --cluster-id $clusterid --profile AZDO | jq -r .state)
    done
    echo "Running now..."
}

uninstallPackage $clusterid $packagename
restartCluster $clusterid
waitClusterReboot $clusterid
