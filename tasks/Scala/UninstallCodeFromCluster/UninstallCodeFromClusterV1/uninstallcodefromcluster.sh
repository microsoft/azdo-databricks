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
curl -n -H "Content-Type: application/json" -X POST -d @- https://centralus.azuredatabricks.net/api/2.0/libraries/uninstall <<JSON
{
  "cluster_id": "$clusterid",
  "libraries": [
    {
      "jar": "dbfs:/jar/sparkcode.jar"
    }
  ]
}
JSON
#========================
# Restart cluster
#========================
curl -n -H "Content-Type: application/json" -X POST -d @- https://centralus.azuredatabricks.net/api/2.0/clusters/restart <<JSON
{
  "cluster_id": "$clusterid"
}
JSON