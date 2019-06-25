import tl = require('azure-pipelines-task-lib/task');
import { exec, ChildProcess } from 'child_process';
import { Readable } from 'stream';
import { async } from 'q';
import fs = require('fs');
import os = require('os');
import path = require('path');
import { stringify } from 'querystring';

async function run() {
    try {
        const url: string = tl.getInput('url', true);
        const token: string = tl.getInput('token', true);

        installDatabricksCli();
        
        configurePat(url, token);

        let homeDir = os.homedir();
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

async function installDatabricksCli(){
    let result = tl.execSync("pip", "install databricks-cli");

    if(result.code != 0){
        console.error("Error while installing databricks-cli: " + result.stderr)
    }
}

async function configurePat(url:string, token: string){
    try {
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        let content: string = "[AZDO]\nhost = __DatabricksURL__\ntoken = __DatabricksPAT__"

        content = content.replace('__DatabricksURL__', url);
        content = content.replace('__DatabricksPAT__', token);

        let homeDir = os.homedir();
        let databricksCfgPath = path.join(homeDir, ".databrickscfg");

        console.log("Writing databricks-cli configuration to file: " + databricksCfgPath);
        
        fs.writeFileSync(databricksCfgPath, content, { flag: "w"});
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();