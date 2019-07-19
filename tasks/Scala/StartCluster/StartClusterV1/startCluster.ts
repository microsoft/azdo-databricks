import path = require('path')
import tl = require('azure-pipelines-task-lib');
import tr = require('azure-pipelines-task-lib/toolrunner')

async function run() {
    try {
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        const input_failOnStderr: boolean = tl.getBoolInput('failOnStderr', false);
        const clusterid: string = tl.getInput('clusterid', true);
        
        let bashPath: string = tl.which('bash', true);
        let fileName = 'startCluster.sh'
        let filePath = path.join(__dirname, fileName);

        let bash = tl.tool(bashPath);

        bash.arg([
            filePath,
            clusterid
        ]);

        let options = <tr.IExecOptions>{
            cwd: __dirname,
            env: {},
            silent: false,
            failOnStdErr: input_failOnStderr,
            errStream: process.stdout,
            outStream: process.stdout,
            ignoreReturnCode: true,
            windowsVerbatimArguments: false
        };

        // Listen for stderr.
        let stderrFailure = false;
        let stdErrData: string = "";

        if(input_failOnStderr) {
            bash.on('stderr', (data) => {
                stderrFailure = true;
                stdErrData = data;
            });
        }

        let exitCode: number = await bash.exec(options);

        let result = tl.TaskResult.Succeeded;

        if (exitCode !== 0) {
            tl.error("Bash exited with code " + exitCode);
            result = tl.TaskResult.Failed
        }

        // Fail on stderr.
        if (stderrFailure) {
            tl.error(`Bash wrote one or more lines to the standard error stream. ${stdErrData}`.trim());
            result = tl.TaskResult.Failed;
        }

        tl.setResult(result, "", true);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();