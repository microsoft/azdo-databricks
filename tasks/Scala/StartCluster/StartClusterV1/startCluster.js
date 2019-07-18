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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        tl.setResourcePath(path.join(__dirname, 'task.json'));
        try {
            const clusterid = tl.getInput('clusterid', true);
            let clusterStatusRequest = tl.execSync("databricks", `clusters get --cluster-id ${clusterid} --profile AZDO`);
            let clusterInfo = JSON.parse(clusterStatusRequest.stdout);
            let clusterStatus = clusterInfo['state'];
            if (clusterStatus == 'RUNNING') {
                console.log(`Cluster is RUNNING. Skipping...`);
            }
            else {
                console.log(`Cluster is ${clusterStatus}. Starting...`);
            }
            console.log(clusterInfo['state']);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err);
        }
    });
}
run();
