import fs = require('fs');
import path = require('path');
import os = require('os');
import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');

async function run() {
    tl.setResourcePath(path.join(__dirname, 'task.json'));

    try {
        const clusterid: string = tl.getInput('clusterid', true);

        let clusterStatusRequest = tl.execSync("databricks", `clusters get --cluster-id ${clusterid} --profile AZDO`)

        let clusterInfo = JSON.parse(clusterStatusRequest.stdout);
        let clusterStatus: string = clusterInfo['state'];

        if(clusterStatus == 'RUNNING') {
            console.log(`Cluster is RUNNING. Skipping...`);
        } else {
            console.log(`Cluster is ${clusterStatus}. Starting...`);
        }
    } catch(err) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
}

run();