import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import shell = require('shelljs');
import { async } from 'q';

const clusterid: string = tl.getInput('clusterid', true);
const failOnStderr: boolean = tl.getBoolInput('failOnStderr', false);

async function runJarJob(){
    const packageName: string = tl.getInput('packageName', true);
    const mainClassName: string = tl.getInput('mainClassName', true);
    const jarParameters: string = tl.getInput('jarParameters', false);

    let jarParametersJson = JSON.stringify(jarParameters);

    let fileName = 'executedatabricksjob.sh';
    let filePath = path.join(__dirname, fileName);

    let runJobExec = shell.exec(`bash ${filePath} ${clusterid} ${packageName} ${mainClassName} ${jarParametersJson}`.trim());

    if(runJobExec.code != 0) {
        tl.setResult(tl.TaskResult.Failed, `Error while executing command: ${runJobExec.stderr}`);
    }

    if(failOnStderr && runJobExec.stderr != "") {
        tl.setResult(tl.TaskResult.Failed, `Command wrote to stderr: ${runJobExec.stderr}`);
    }
}

async function runNotebookJob() {

}

async function run() {
    try {
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        const targetType: string = tl.getInput('targetType');
        
        if(targetType.toUpperCase() == "JARJOB"){
            await runJarJob();
        } else if(targetType.toUpperCase() == "NOTEBOOKJOB"){
            await runNotebookJob();
        } else {
            tl.setResult(tl.TaskResult.Failed, "Could not retrieve Job Type.");
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
