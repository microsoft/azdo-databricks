import path = require('path')
import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner')

async function run() {
    try {
        tl.setResourcePath(path.join(__dirname, 'task.json'));
        
        let bashPath: string = tl.which('bash', true);
        let fileName = 'installScalaTools.sh'

        let bash = tl.tool(bashPath);

        bash.arg([
            fileName
        ]);

        let options = <tr.IExecOptions>{
            cwd: __dirname,
            env: {},
            silent: false,
            failOnStdErr: false,
            errStream: process.stdout,
            outStream: process.stdout,
            ignoreReturnCode: true,
            windowsVerbatimArguments: false
        };

        // Listen for stderr.
        let stderrFailure = false;
        bash.on('stderr', (data) => {
            stderrFailure = true;
        });

        let exitCode: number = await bash.exec(options);

        let result = tl.TaskResult.Succeeded;

        if (exitCode !== 0) {
            tl.error(tl.loc('JS_ExitCode', exitCode));
            result = tl.TaskResult.Failed
        }

        // Fail on stderr.
        if (stderrFailure) {
            tl.error(tl.loc('JS_Stderr'));
            result = tl.TaskResult.Failed;
        }

        tl.setResult(result, "", true);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();