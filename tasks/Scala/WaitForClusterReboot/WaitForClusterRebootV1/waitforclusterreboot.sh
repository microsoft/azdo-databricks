#!/bin/bash
# ===================================================================================
#
# FILE:  4-wait-for-reboot.sh
#
# USAGE:  bash 4-wait-for-reboot.sh
#
#   DESCRIPTION: Uses Databricks API to get id for cluster.
#                Polls cluster state to see if cluster is running.
#                Pauses execution of pipeline so new Spark JAR file can be installed.
#
# NOTES:  ---
# AUTHOR:  Bruno Terkaly
# VERSION:  1.0
# CREATED:  June 10, 2019
#===================================================================================
lookfor=RUNNING

clusterStatus=$(databricks clusters get --cluster-id $clusterid --profile AZDO | jq -r .state)

if [ "$clusterStatus" == "TERMINATED"]
do
    echo "The cluster is not rebooting."
    exit 1
done

while [ "$clusterStatus" != "$lookfor" ]
do
    sleep 30
    echo "Restarting..."
    clusterStatus=$(databricks clusters get --cluster-id $clusterid --profile AZDO | jq -r .state)
done
echo "Running now..."