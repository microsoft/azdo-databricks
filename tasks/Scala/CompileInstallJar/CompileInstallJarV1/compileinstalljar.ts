import path = require('path')
import tl = require('azure-pipelines-task-lib');
import shell = require('shelljs');

async function compileInstallJar(clusterid: string, failOnStderr: boolean){
    let fileName = 'compileinstalljar.sh'
    let filePath = path.join(__dirname, fileName);
    
    let compileInstallExec = shell.exec(`bash ${filePath} ${clusterid}`);

    if(compileInstallExec.code != 0) {
        tl.setResult(tl.TaskResult.Failed, `Error while executing command: ${compileInstallExec.stderr}`);
    }

    if(failOnStderr && compileInstallExec.stderr != ""){
        tl.setResult(tl.TaskResult.Failed, `Command wrote to stderr: ${compileInstallExec.stderr}`);
    }
}

async function run() {
    try{
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        const failOnStderr: boolean = tl.getBoolInput('failOnStderr', false);
        const clusterid: string = tl.getInput('clusterid', true);

        if(!shell.which('databricks')){
            tl.setResult(tl.TaskResult.Failed, "databricks-cli was not found. Use the task 'Configure Databricks CLI' to install and configure it.");
        } else {
            await compileInstallJar(clusterid, failOnStderr);
        }

        await compileInstallJar(clusterid, failOnStderr);
    } catch(err){
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();