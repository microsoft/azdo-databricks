import shell = require('shelljs');
import path = require('path');
import tl = require('azure-pipelines-task-lib');
import { async } from 'q';

async function startCluster(clusterid: string, failOnStderr: boolean) {
    let fileName = 'startCluster.sh';
    let filePath = path.join(__dirname, fileName);

    let startClusterExec = shell.exec(`bash ${filePath} ${clusterid}`)

    if(startClusterExec.code != 0) {
        tl.setResult(tl.TaskResult.Failed, `Error while executing command: ${startClusterExec.stderr}`);
    }

    if(failOnStderr && startClusterExec.stderr != "") {
        tl.setResult(tl.TaskResult.Failed, `Command wrote to stderr: ${startClusterExec.stderr}`);
    }
}

async function run() {
    try{
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        const clusterid: string = tl.getInput('clusterid', true);
        const failOnStderr: boolean = tl.getBoolInput('failOnStderr', false);

        if(!shell.which('databricks')){
            tl.setResult(tl.TaskResult.Failed, "databricks-cli was not found. Use the task 'Configure Databricks CLI' to install and configure it.");
        } else {
            await startCluster(clusterid, failOnStderr);
        }
    } catch(err){
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();