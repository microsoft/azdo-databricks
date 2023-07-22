import path = require('path')
import tl = require('azure-pipelines-task-lib');
import shell = require('shelljs');

async function run() {
    try {
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        const failOnStderr: boolean = tl.getBoolInput('failOnStderr', false);
        const workingDirectory: string = tl.getInput('workingDirectory', false) ?? '';
        const additionalParameters: string = tl.getInput('additionalParameters', false) ?? '';

        if(workingDirectory !== ''){
            shell.cd(workingDirectory);
        }
                        
        let fileName = 'runsbttests.sh'
        let filePath = path.join(__dirname, fileName);

        let runSbtExec = shell.exec(`bash ${filePath} ${additionalParameters}`.trim())

        if(runSbtExec.code != 0) {
            tl.setResult(tl.TaskResult.Failed, `Error while executing command: ${runSbtExec.stderr}`);
        }
    
        if(failOnStderr && runSbtExec.stderr != ""){
            tl.setResult(tl.TaskResult.Failed, `Command wrote to stderr: ${runSbtExec.stderr}`);
        }
    }
    catch (err: any) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();