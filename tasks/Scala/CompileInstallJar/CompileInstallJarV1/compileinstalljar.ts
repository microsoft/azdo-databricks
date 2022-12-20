import path = require('path')
import tl = require('azure-pipelines-task-lib');
import shell = require('shelljs');

async function compileInstallJar(){
    const failOnStderr: boolean = tl.getBoolInput('failOnStderr', false)!;
    const clusterid: string = tl.getInput('clusterid', true)!;
    const workingDirectory: string = tl.getInput('workingDirectory', false)!;
    const packageName: string = tl.getInput('packageName', true)!;
    const packageVersion: string = tl.getInput('packageVersion', true)!;
    const scalaVersion: string = tl.getInput('scalaVersion', true)!;
    const sampleDataSetFilePath: string = tl.getInput('sampleDataSetFilePath', true)!;

    if(workingDirectory){
        shell.cd(workingDirectory);
    }
    
    let fileName = 'compileinstalljar.sh'
    let filePath = path.join(__dirname, fileName);

    let scalaVersionArray: Array<string> = scalaVersion.split('.')
    let scalaVersionShort: string = `${scalaVersionArray[0]}.${scalaVersionArray[1]}`;
    
    let compileInstallExec = shell.exec(`bash ${filePath} ${clusterid} ${packageName} ${packageVersion} ${scalaVersion} ${scalaVersionShort} ${sampleDataSetFilePath}`);

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

        if(!shell.which('databricks')){
            tl.setResult(tl.TaskResult.Failed, "databricks-cli was not found. Use the task 'Configure Databricks CLI' to install and configure it.");
        } else {
            await compileInstallJar();
        }
    } catch(err: any){
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();