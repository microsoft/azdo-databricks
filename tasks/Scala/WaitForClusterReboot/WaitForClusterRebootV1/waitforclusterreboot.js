"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const tl = require("azure-pipelines-task-lib");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            const workingDirectory = tl.getInput('workingDirectory', false);
            if (workingDirectory != '') {
                tl.cd(workingDirectory);
            }
            const clusterid = tl.getInput('clusterid', true);
            let bashPath = tl.which('bash', true);
            let fileName = 'waitforclusterreboot.sh';
            let filePath = path.join(__dirname, fileName);
            let bash = tl.tool(bashPath);
            bash.arg([
                filePath,
                clusterid
            ]);
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
            bash.on('stderr', (data) => {
                stderrFailure = true;
            });
            let exitCode = yield bash.exec(options);
            let result = tl.TaskResult.Succeeded;
            if (exitCode !== 0) {
                tl.error("Bash exited with code " + exitCode);
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
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
