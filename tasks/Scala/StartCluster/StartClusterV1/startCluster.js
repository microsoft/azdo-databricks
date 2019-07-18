"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const tl = require("azure-pipelines-task-lib/task");
var uuidV4 = require('uuid/v4');
const noProfile = tl.getBoolInput('noProfile');
const noRc = tl.getBoolInput('noRc');
function translateDirectoryPath(bashPath, directoryPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let bashPwd = tl.tool(bashPath)
            .arg('--noprofile')
            .arg('--norc')
            .arg('-c')
            .arg('pwd');
        let bashPwdOptions = {
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
        yield bashPwd.exec(bashPwdOptions);
        pwdOutput = pwdOutput.trim();
        if (!pwdOutput) {
            throw new Error(`Unable to translate the path '${directoryPath}' to the Linux file system.`);
        }
        return `${pwdOutput}`;
    });
}
function checkIfDatabricksCliIsInstalled() {
    return __awaiter(this, void 0, void 0, function* () {
        return !!tl.which("databricks", false);
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            // Get inputs.
            let input_failOnStderr = tl.getBoolInput('failOnStderr', false);
            let input_clusterid = tl.getInput('clusterid', true);
            let scriptFileName = 'startCluster.sh';
            let scriptPath = path.join(__dirname, scriptFileName);
            let bashPath = tl.which('bash', true);
            tl.assertAgent('2.115.0');
            if (process.platform == 'win32') {
                console.log("Translating path as it's running on Windows...");
                scriptPath = (yield translateDirectoryPath(bashPath, __dirname)) + '/' + scriptFileName;
            }
            console.log("Generating the temporary scripts.");
            let contents;
            let targetFilePath;
            contents = `. '${scriptPath.replace("'", "'\\''")}' ${input_clusterid}`;
            console.log(`Successfully formatted command with ${contents}`);
            // Write the script to disk
            tl.assertAgent('2.115.0');
            let tempDirectory = tl.getVariable('agent.tempDirectory');
            tl.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);
            let fileName = uuidV4() + '.sh';
            let filePath = path.join(tempDirectory, fileName);
            yield fs.writeFileSync(filePath, contents, { encoding: 'utf8' });
            // Create the tool runner.
            console.log('========================== Starting Command Output ===========================');
            let bash = tl.tool(bashPath)
                .arg('--noprofile')
                .arg('--norc')
                .arg(filePath);
            let options = {
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
            if (input_failOnStderr) {
                bash.on('stderr', (data) => {
                    stderrFailure = true;
                });
            }
            // Run bash.
            let exitCode = yield bash.exec(options);
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
    });
}
if (!checkIfDatabricksCliIsInstalled()) {
    tl.setResult(tl.TaskResult.Failed, "The Databricks CLI was not found. Use the Configure Databricks CLI task to install and configure it prior to this task");
}
run();
