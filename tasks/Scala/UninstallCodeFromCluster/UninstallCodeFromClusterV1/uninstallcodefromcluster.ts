import path = require('path')
import tl = require('azure-pipelines-task-lib');
import shell = require('shelljs');

function uninstallLibsFromCluster() {
    try {
        const failOnStderr: boolean = tl.getBoolInput('failOnStderr', false) ?? '';
        const libraryfilename: string = tl.getInput('libraryfilename', true) ?? '';
        const clusterid: string = tl.getInput('clusterid', true) ?? '';

        let fileName = 'uninstallcodefromcluster.sh'
        let filePath = path.join(__dirname, fileName);

        let uninstallExec = shell.exec(`bash ${filePath} ${clusterid} ${libraryfilename}`);

        if(uninstallExec.code != 0){
            tl.setResult(tl.TaskResult.Failed, `Error while uninstalliing ${libraryfilename} from ${clusterid}: ${uninstallExec.stderr}`);
        }

        if(failOnStderr && uninstallExec.stderr != ""){
            tl.setResult(tl.TaskResult.Failed, `Command wrote to stderr: ${uninstallExec.stderr}`);
        }
    } catch(err: any) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

async function run() {
    try{
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        if(!shell.which('databricks')){
            tl.setResult(tl.TaskResult.Failed, "databricks-cli was not found. Use the task 'Configure Databricks CLI' to install and configure it.");
        } else {
            await uninstallLibsFromCluster();
        }
    } catch(err: any){
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();