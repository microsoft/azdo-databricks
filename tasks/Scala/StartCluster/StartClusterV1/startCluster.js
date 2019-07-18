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
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        tl.setResourcePath(path.join(__dirname, 'task.json'));
        try {
            const clusterid = tl.getInput('clusterid', true);
            let clusterStatus = yield getClusterStatus(clusterid);
            if (clusterStatus == 'RUNNING') {
                console.log(`Cluster is RUNNING. Skipping...`);
            }
            else {
                console.log(`Cluster is ${clusterStatus}. Starting...`);
                startCluster(clusterid);
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err);
        }
    });
}
function startCluster(clusterid) {
    return __awaiter(this, void 0, void 0, function* () {
        //databricks clusters start --cluster-id $clusterid --profile AZDO
        let clusterStartRequest = tl.execSync("databricks", `clusters start --cluster-id ${clusterid} --profile AZDO`);
        if (clusterStartRequest.code != 0) {
            tl.setResult(tl.TaskResult.Failed, "Error while requesting to start the cluster");
        }
        let clusterStatus = yield getClusterStatus(clusterid);
        if (clusterStatus != 'RUNNING') {
            while (clusterStatus != 'RUNNING') {
                console.log(`Cluster Status: ${clusterStatus}`);
                clusterStatus = yield getClusterStatus(clusterid);
                yield sleep(10);
            }
        }
        console.log(`Cluster is RUNNING.`);
    });
}
function getClusterStatus(clusterid) {
    return __awaiter(this, void 0, void 0, function* () {
        let clusterStartRequest = tl.execSync("databricks", `clusters get --cluster-id ${clusterid} --profile AZDO`);
        if (clusterStartRequest.code != 0) {
            tl.setResult(tl.TaskResult.Failed, "Error while requesting to start the cluster");
        }
        let clusterStatusRequest = tl.execSync("databricks", `clusters get --cluster-id ${clusterid} --profile AZDO`);
        let clusterInfo = JSON.parse(clusterStatusRequest.stdout);
        let clusterStatus = clusterInfo['state'];
        return clusterStatus;
    });
}
run();
