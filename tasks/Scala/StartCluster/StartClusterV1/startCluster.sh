#!/bin/bash
# ===================================================================================
#
# FILE:  0-start-cluster.sh
#
# USAGE:  bash 0-start-cluster.sh ...
#
#   DESCRIPTION: Uses Databricks API to put Spark cluster into a running state.
#                Uses databricks utility to check for "RUNNING" state.
#                Uses api/2.0/clusters/start to start cluster.
#
# NOTES:  ---
# AUTHOR:  Bruno Terkaly
# VERSION:  1.0
# CREATED:  June 10, 2019
#===================================================================================

#=======================================================
# Purpose: Start cluster
#  - Asssumptions: Just one cluster to check
#                  Add code for more than one cluster
#=======================================================
clusterid=$1
lookfor=RUNNING

clusterStatus=$(databricks clusters get --cluster-id $clusterid --profile AZDO | jq -r .state)
if [ "$clusterStatus" != "$lookfor" ]
then
   echo "Cluster $clusterid not running, turning on..."
else
   echo "Cluster $clusterid already running, skipping..."
   exit 0
fi

#=======================================================
# Since cluster is not running, run it
#=======================================================
databricks clusters start --cluster-id $clusterid --profile AZDO
#=======================================================
# Now loop (stay here) until running
#=======================================================
clusterStatus=$(databricks clusters get --cluster-id $clusterid --profile AZDO | jq -r .state)
while [ "$clusterStatus" != "$lookfor" ]
do
    sleep 30
    echo "Starting..."
    clusterStatus=$(databricks clusters get --cluster-id $clusterid --profile AZDO | jq -r .state)
done
echo "Running now..."
