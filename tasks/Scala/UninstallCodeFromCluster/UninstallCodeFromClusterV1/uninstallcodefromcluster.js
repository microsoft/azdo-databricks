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
function uninstallLibsFromCluster() {
    var _a, _b, _c;
    try {
        const failOnStderr = (_a = tl.getBoolInput('failOnStderr', false)) !== null && _a !== void 0 ? _a : '';
        const libraryfilename = (_b = tl.getInput('libraryfilename', true)) !== null && _b !== void 0 ? _b : '';
        const clusterid = (_c = tl.getInput('clusterid', true)) !== null && _c !== void 0 ? _c : '';
        let fileName = 'uninstallcodefromcluster.sh';
        let filePath = path.join(__dirname, fileName);
        let uninstallExec = shell.exec(`bash ${filePath} ${clusterid} ${libraryfilename}`);
        if (uninstallExec.code != 0) {
            tl.setResult(tl.TaskResult.Failed, `Error while uninstalliing ${libraryfilename} from ${clusterid}: ${uninstallExec.stderr}`);
        }
        if (failOnStderr && uninstallExec.stderr != "") {
            tl.setResult(tl.TaskResult.Failed, `Command wrote to stderr: ${uninstallExec.stderr}`);
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            if (!shell.which('databricks')) {
                tl.setResult(tl.TaskResult.Failed, "databricks-cli was not found. Use the task 'Configure Databricks CLI' to install and configure it.");
            }
            else {
                yield uninstallLibsFromCluster();
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
