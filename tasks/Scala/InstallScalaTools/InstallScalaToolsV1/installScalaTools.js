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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            // Get inputs.
            let input_failOnStderr = tl.getBoolInput('failOnStderr', false);
            let fileNameOnExtension = 'mybash.sh';
            let filePathOnExtension = path.join(__dirname, fileNameOnExtension);
            console.log("Generating script.");
            let bashPath = tl.which('bash', true);
            let contents;
            contents = `. '${filePathOnExtension.replace("'", "'\\''")}'`.trim();
            console.log(`Formatted command: ${contents}`);
            // Write the script to disk.
            tl.assertAgent('2.115.0');
            let tempDirectory = tl.getVariable('agent.tempDirectory');
            tl.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);
            let fileName = uuidV4() + '.sh';
            let filePath = path.join(tempDirectory, fileName);
            yield fs.writeFileSync(filePath, contents, { encoding: 'utf8' });
            // Translate the script file path from Windows to the Linux file system.
            if (process.platform == 'win32') {
                filePath = (yield translateDirectoryPath(bashPath, tempDirectory)) + '/' + fileName;
            }
            // Create the tool runner.
            console.log('========================== Starting Command Output ===========================');
            let bash = tl.tool(bashPath);
            if (noProfile) {
                bash.arg('--noprofile');
            }
            if (noRc) {
                bash.arg('--norc');
            }
            bash.arg(filePath);
            let options = {
                cwd: tempDirectory,
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
run();
