#!/bin/bash
# ===================================================================================
#
# FILE:  1-run-jar.sh
#
# USAGE:  bash 1-run-jar.sh ...
#
#   DESCRIPTION: Uses Databricks API to launch Spark Job.
#                Relies on an existing JAR file being present.
#                Uses API api/2.0/jobs/create
#                         api/2.0/jobs/run-now
#                Results in a Run Id that is needed later to validate SUCCESS
#
# NOTES:  ---
# AUTHOR:  Bruno Terkaly
# VERSION:  1.0
# CREATED:  June 10, 2019
#===================================================================================

#---------Create job

clusterid=$1
packagename=$2
mainclassname=$3
additionalparams=$4

echo "Run a job"
cat > job-configuration.json << EOF
{
  "name": "MySparkJob",
  "existing_cluster_id": "$clusterid",
  "libraries": [
    {
      "jar": "dbfs:/jar/$packagename.jar"
    }
  ],
  "spark_jar_task": {
    "main_class_name": "$mainclassname"
  }
}
EOF
cat job-configuration.json

result=$(databricks jobs create --json-file job-configuration.json --profile AZDO)
echo "result = $result"
echo "Finished creating Databricks Job"

jobid=$(echo $result | jq -r ".job_id")
echo "=================================="
echo "Job id "$jobid
echo "=================================="

#---------Run the job

echo "Additional params: $additionalparams"

if [ "$additionalparams" == "" ]; then
    echo "No additional params passed."
    result=$(databricks jobs run-now --job-id $jobid --profile AZDO)
else
    result=$(databricks jobs run-now --job-id $jobid --jar-params "$additionalparams" --profile AZDO)
fi
echo "result = $result"
runid=`echo $result | jq -r ".run_id"`
number_in_job=`echo $result | jq ".number_in_job"`
echo "number_in_job = "$number_in_job

echo "=================================="
echo "Run id = "$runid
echo "Number in Job = "$number_in_job
echo "=================================="

echo $runid > last-run.txt
cat last-run.txt