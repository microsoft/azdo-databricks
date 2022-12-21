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
const shell = require("shelljs");
function run() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            const failOnStderr = tl.getBoolInput('failOnStderr', false);
            const workingDirectory = (_a = tl.getInput('workingDirectory', false)) !== null && _a !== void 0 ? _a : '';
            const additionalParameters = (_b = tl.getInput('additionalParameters', false)) !== null && _b !== void 0 ? _b : '';
            if (workingDirectory !== '') {
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
