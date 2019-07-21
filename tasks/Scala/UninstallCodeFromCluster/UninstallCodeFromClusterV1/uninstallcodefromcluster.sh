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

    echo "Uninstalling $packagename.jar from $clusterid..."

    databricks libraries uninstall --cluster-id $clusterid --jar "dbfs:/jar/$packagename.jar" --profile AZDO

    echo "Successfully uninstalled $packagename.jar from $clusterid."
}

restartCluster() {
    clusterid=$1

    echo "Restarting cluster $clusterid"

    databricks clusters restart --cluster-id $clusterid --profile AZDO
}

waitClusterReboot() {
    clusterid=$1

    echo "Monitoring cluster $clusterid status..."

    lookfor=RUNNING

    clusterStatus=$(databricks clusters get --cluster-id $clusterid --profile AZDO | jq -r .state)

    echo "Status: $clusterStatus"

    if [ "$clusterStatus" == "TERMINATED" ]
    do
        echo "The cluster $clusterid is not rebooting."
        exit 1
    done

    while [ "$clusterStatus" != "$lookfor" ]
    do
        sleep 10
        clusterStatus=$(databricks clusters get --cluster-id $clusterid --profile AZDO | jq -r .state)

        echo "Restarting $clusterid. Status: $clusterStatus..."
    done
    echo "Running now..."
}

uninstallPackage $clusterid $packagename
restartCluster $clusterid
waitClusterReboot $clusterid
