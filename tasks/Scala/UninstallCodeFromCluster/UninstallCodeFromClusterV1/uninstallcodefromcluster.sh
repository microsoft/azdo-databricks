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
#========================
# Un-install jar
#========================
clusterid=$1
libraryFileName=$2
databricks libraries uninstall --cluster-id $clusterid --jar "dbfs:/jar/$libraryFileName" --profile AZDO
#========================
# Restart cluster
#========================
databricks clusters restart --cluster-id $clusterid --profile AZDO