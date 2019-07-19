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
const shell = require("shelljs");
const path = require("path");
const tl = require("azure-pipelines-task-lib");
function startCluster(clusterid) {
    return __awaiter(this, void 0, void 0, function* () {
        let fileName = 'startCluster.sh';
        let filePath = path.join(__dirname, fileName);
        let startClusterExec = shell.exec(`bash ${filePath} ${clusterid}`);
        if (startClusterExec.code != 0) {
            tl.setResult(tl.TaskResult.Failed, `Error while executing command: ${startClusterExec.stderr}`);
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            const clusterid = tl.getInput('clusterid', true);
            if (!shell.which('databricks')) {
                tl.setResult(tl.TaskResult.Failed, "databricks-cli was not found. Use the task 'Configure Databricks CLI' to install and configure it.");
            }
            else {
                yield startCluster(clusterid);
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
