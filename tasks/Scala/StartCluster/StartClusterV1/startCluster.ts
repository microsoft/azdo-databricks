import fs = require('fs');
import path = require('path');
import os = require('os');
import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');
var uuidV4 = require('uuid/v4');

async function translateDirectoryPath(bashPath: string, directoryPath: string): Promise<string> {
    let bashPwd = tl.tool(bashPath)
        .arg('--noprofile')
        .arg('--norc')
        .arg('-c')
        .arg('pwd');

    let bashPwdOptions = <tr.IExecOptions>{
        cwd: directoryPath,
        env: {},
        silent: false,
        failOnStdErr: true,
        errStream: process.stdout,
        outStream: process.stdout,
        ignoreReturnCode: false,
        windowsVerbatimArguments: false
    };
    let pwdOutput = '';
    bashPwd.on('stdout', (data) => {
        pwdOutput += data.toString();
    });
    await bashPwd.exec(bashPwdOptions);
    pwdOutput = pwdOutput.trim();
    if (!pwdOutput) {
        throw new Error(`Unable to translate the path '${directoryPath}' to the Linux file system.`);
    }

    return `${pwdOutput}`;
}

async function checkIfDatabricksCliIsInstalled() {
    return !!tl.which("databricks", false);
}

async function run() {
    try {
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        // Get inputs.
        let input_failOnStderr = tl.getBoolInput('failOnStderr', false);
        let input_clusterid: string = tl.getInput('clusterid', true);

        console.log("Generating the temporary scripts.");
        let scriptFileName = 'startCluster.sh';
        let scriptPath = path.join(__dirname, scriptFileName);

        let bashPath: string = tl.which('bash', true);
        let contents: string;

        contents = `. '${scriptPath.replace("'", "'\\''")}' ${input_clusterid}`
        console.log(`Formatted command: ${contents}`);

        // Write the scripts to disk.        
        tl.assertAgent('2.115.0');
        let tempDirectory = tl.getVariable('agent.tempDirectory');
        tl.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);

        let fileName = uuidV4() + '.sh';
        let filePath = path.join(tempDirectory, fileName);
        await fs.writeFileSync(
            filePath,
            contents,
            { encoding: 'utf8'}
        );
        
        // Translate the script file path from Windows to the Linux file system.
        if (process.platform == 'win32') {
            console.log("Translating path as it's running on Windows...")
            scriptPath = await translateDirectoryPath(bashPath, __dirname) + '/' + scriptFileName;
        }

        console.log(`Successfully formatted command with ${contents}`);

        // Create the tool runner.
        console.log('========================== Starting Command Output ===========================');
        let bash = tl.tool(bashPath)
            .arg(filePath)

        let options = <tr.IExecOptions>{
            cwd: tempDirectory,
            env: {},
            silent: false,
            failOnStdErr: false,
            errStream: process.stdout, // Direct all output to STDOUT, otherwise the output may appear out
            outStream: process.stdout, // of order since Node buffers it's own STDOUT but not STDERR.
            ignoreReturnCode: true,
            windowsVerbatimArguments: false
        };

        // Listen for stderr.
        let stderrFailure = false;
        if (input_failOnStderr) {
            bash.on('stderr', (data) => {
                stderrFailure = true;
            });
        }

        // Run bash.
        let exitCode: number = await bash.exec(options);

        let result = tl.TaskResult.Succeeded;

        // Fail on exit code.
        if (exitCode !== 0) {
            tl.error(`Bash exited with code ${exitCode}`);
            result = tl.TaskResult.Failed;
        }

        // Fail on stderr.
        if (stderrFailure) {
            tl.error("Bash wrote one or more lines to the standard error stream.");
            result = tl.TaskResult.Failed;
        }

        tl.setResult(result, "", true);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message || 'run() failed', true);
    }
}

if (!checkIfDatabricksCliIsInstalled()) {
    tl.setResult(tl.TaskResult.Failed, "The Databricks CLI was not found. Use the Configure Databricks CLI task to install and configure it prior to this task");
}

run();