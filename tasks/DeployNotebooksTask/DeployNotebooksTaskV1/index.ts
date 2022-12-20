import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs');
import { fstat } from 'fs';

async function run() {
    try {
        const notebooksFolderPath: string = tl.getInput('notebooksFolderPath', true)!;
        const workspaceFolder: string = tl.getInput('workspaceFolder', true)!;

        if (!isDirSync(notebooksFolderPath)){
            tl.setResult(tl.TaskResult.Failed, 'The specified path for Notebooks folder is a file.')
        }

        if (!workspaceFolder.startsWith("/")) {
            tl.setResult(tl.TaskResult.Failed, 'The Workspace folder must start with a forward slash (/).')
        }
        
        let importResult = tl.execSync("databricks", "workspace import_dir -o --profile AZDO \"" + notebooksFolderPath + "\" \"" + workspaceFolder);

        if (importResult.code != 0) {
            console.error(importResult.stderr);
            tl.setResult(tl.TaskResult.Failed, 'The Notebooks import process failed.');
        } else {
            console.log(importResult.stdout);
        }
    }
    catch (err: any) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

function isDirSync(aPath: string) {
    try {
        return fs.statSync(aPath).isDirectory();
    } catch (e: any) {
        if (e.code === 'ENOENT') {
            return false;
        } else {
            throw e;
        }
    }
}

function isPython3Selected() : boolean {
    let pythonInfo = tl.execSync("python", "-V");

    if(pythonInfo.code != 0) {
        tl.setResult(tl.TaskResult.Failed, `Failed to check python version. ${pythonInfo.stderr}`.trim())
    }

    let version: string = "";

    if(pythonInfo.stderr != ""){
        version = pythonInfo.stderr.split(' ')[1];
    } else if(pythonInfo.stdout != ""){
        version = pythonInfo.stdout.split(' ')[1];
    } else {
        tl.setResult(tl.TaskResult.Failed, `Failed to retrieve Python Version: ${pythonInfo.stderr}`);
        return false;
    }
    
    if(!version.startsWith('3')){
        tl.setResult(tl.TaskResult.Failed, `Active Python Version: ${version}`);
        return false;
    }

    console.log(`Version: ${version}`);

    return true;
}

let python3Selected = isPython3Selected();

if(python3Selected) {
    console.log("Python3 selected. Running...");
    run();
} else {
    tl.setResult(tl.TaskResult.Failed, "You must add 'Use Python Version 3.x' as the very first task for this pipeline.");
}