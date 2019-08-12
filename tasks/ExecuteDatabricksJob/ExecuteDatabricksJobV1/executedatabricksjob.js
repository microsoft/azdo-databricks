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
const tl = require("azure-pipelines-task-lib/task");
const shell = require("shelljs");
const clusterid = tl.getInput('clusterid', true);
const failOnStderr = tl.getBoolInput('failOnStderr', false);
function runJarJob() {
    return __awaiter(this, void 0, void 0, function* () {
        const packageName = tl.getInput('packageName', true);
        const mainClassName = tl.getInput('mainClassName', true);
        const jarParameters = tl.getInput('jarParameters', false);
        let jarParametersJson = JSON.stringify(jarParameters);
        let fileName = 'executedatabricksjob.sh';
        let filePath = path.join(__dirname, fileName);
        let runJobExec = shell.exec(`bash ${filePath} ${clusterid} ${packageName} ${mainClassName} ${jarParametersJson}`.trim());
        if (runJobExec.code != 0) {
            tl.setResult(tl.TaskResult.Failed, `Error while executing command: ${runJobExec.stderr}`);
        }
        if (failOnStderr && runJobExec.stderr != "") {
            tl.setResult(tl.TaskResult.Failed, `Command wrote to stderr: ${runJobExec.stderr}`);
        }
    });
}
function runNotebookJob() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            const targetType = tl.getInput('targetType');
            if (targetType.toUpperCase() == "JARJOB") {
                yield runJarJob();
            }
            else if (targetType.toUpperCase() == "NOTEBOOKJOB") {
                yield runNotebookJob();
            }
            else {
                tl.setResult(tl.TaskResult.Failed, "Could not retrieve Job Type.");
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
