import fs = require('fs');
import path = require('path');
import os = require('os');
import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');
import { async } from 'q';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function run() {
    tl.setResourcePath(path.join(__dirname, 'task.json'));

    try {
        const clusterid: string = tl.getInput('clusterid', true);

        let clusterStatus: string = await getClusterStatus(clusterid);

        if(clusterStatus == 'RUNNING') {
            console.log(`Cluster is RUNNING. Skipping...`);
        } else {
            console.log(`Cluster is ${clusterStatus}. Starting...`);
            startCluster(clusterid);
        }
    } catch(err) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
}

async function startCluster(clusterid: string){
    //databricks clusters start --cluster-id $clusterid --profile AZDO
    let clusterStartRequest = tl.execSync("databricks", `clusters start --cluster-id ${clusterid} --profile AZDO`);

    if(clusterStartRequest.code != 0) {
        tl.setResult(tl.TaskResult.Failed, "Error while requesting to start the cluster");
    }

    let clusterStatus: string = await getClusterStatus(clusterid);

    if(clusterStatus != 'RUNNING') {
        while(clusterStatus != 'RUNNING') {
            console.log(`Cluster Status: ${clusterStatus}`);
            clusterStatus = await getClusterStatus(clusterid);
            
            await sleep(10);
        }
    } 

    console.log(`Cluster is RUNNING.`);
}

async function getClusterStatus(clusterid: string) : Promise<string> {
    let clusterStartRequest = tl.execSync("databricks", `clusters get --cluster-id ${clusterid} --profile AZDO`);

    if(clusterStartRequest.code != 0) {
        tl.setResult(tl.TaskResult.Failed, "Error while requesting to start the cluster");
    }

    let clusterStatusRequest = tl.execSync("databricks", `clusters get --cluster-id ${clusterid} --profile AZDO`);

    let clusterInfo = JSON.parse(clusterStatusRequest.stdout);
    let clusterStatus: string = clusterInfo['state'];

    return clusterStatus;
}

run();