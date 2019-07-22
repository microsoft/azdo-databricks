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
const path = require("path");
const tl = require("azure-pipelines-task-lib");
const shell = require("shelljs");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            const failOnStderr = tl.getBoolInput('failOnStderr', false);
            const workingDirectory = tl.getInput('workingDirectory', false);
            const additionalParameters = tl.getInput('additionalParameters', false);
            if (workingDirectory != '') {
                shell.cd(workingDirectory);
            }
            let fileName = 'runsbttests.sh';
            let filePath = path.join(__dirname, fileName);
            let runSbtExec = shell.exec(`bash ${filePath} ${additionalParameters}`.trim());
            if (runSbtExec.code != 0) {
                tl.setResult(tl.TaskResult.Failed, `Error while executing command: ${runSbtExec.stderr}`);
            }
            if (failOnStderr && runSbtExec.stderr != "") {
                tl.setResult(tl.TaskResult.Failed, `Command wrote to stderr: ${runSbtExec.stderr}`);
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
