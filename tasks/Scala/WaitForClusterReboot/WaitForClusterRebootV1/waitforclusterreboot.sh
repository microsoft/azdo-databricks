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
result=$(databricks clusters list | awk '{print $3}')
echo $result
while [ "$result" != "$lookfor" ]
do
    sleep 1
    echo "Restarting..."
    result=$(databricks clusters list | awk '{print $3}')
done
echo "Running now..."