import tl = require('azure-pipelines-task-lib');
import path = require('path');
import fs = require('fs');

async function run() {
    tl.setResourcePath(path.join(__dirname, 'task.json'));

    try {
        const notebookPath: string = tl.getInput('notebookPath', true) ?? '';
        const executionParams: string = tl.getInput('executionParams', false) ?? '';
        const existingClusterId: string = tl.getInput('existingClusterId', false) ?? '';

        let notebook = new Notebook(notebookPath, executionParams);

        if(!notebook.isValid()) {
            return;
        }

        if(!notebook.exists()){
            tl.setResult(tl.TaskResult.Failed, "The given notebook does not exist.");
        } else {
            notebook.execute(existingClusterId);
        }
    }
    catch (err: any) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

interface Job {
    job_id: string;
}

interface Run {
    run_id: string;
}

class Notebook{
    public folder: string = "";
    public name: string = "";
    public params: string = "";
    private fullPath: string = "";

    constructor(fullPath: string, params: string){
        var lastForwardSlashIndex = fullPath.lastIndexOf('/');

        var notebookFolder = fullPath.substr(0, lastForwardSlashIndex);
        var notebookName = fullPath.substr(lastForwardSlashIndex+1);

        this.folder = notebookFolder;
        this.name = notebookName;
        this.params = params;
        this.fullPath = fullPath;
    }

    isValid(){
        if (this.folder === '' || !this.folder.startsWith("/")) {
            tl.setResult(tl.TaskResult.Failed, 'The Notebook path must start with a forward slash (/).');
            return false;
        }

        try {
            if (this.params != '') {
                let paramsJson = JSON.parse(this.params);
            }
        } catch (error: any) {
            tl.setResult(tl.TaskResult.Failed, error);

            return false;
        }

        return true;
    }

    exists() {
        try {
            let notebookSearch = tl.execSync("databricks", "workspace ls " + this.folder + " --profile AZDO");

            if(notebookSearch.code != 0){
                console.error(notebookSearch.stderr);
                tl.setResult(tl.TaskResult.Failed, "Error while fetching Databricks workspace folder.");
            }

            let breakLine: string;
            
            if(tl.getPlatform() === tl.Platform.Windows){
                breakLine = '\r\n';
            } else {
                breakLine = '\n';
            }

            let notebookArray = notebookSearch.stdout.split(breakLine);

            console.log("Checking if " + this.name + " existis under " + this.folder + "...");

            notebookArray.forEach(element => {
                console.log("Notebook: " + element);

                if (element.trim() === this.name) {
                    return true;
                }
            });

            return true;
        } catch (err: any) {
            tl.setResult(tl.TaskResult.Failed, err);
        }
    }

    execute(existingClusterId: string){
        let jobConfigurationFile = this.getJobConfigurationFile(existingClusterId);

        let job =  this.createJob(jobConfigurationFile);

        if(job == null){
            tl.setResult(tl.TaskResult.Failed, "The job creation failed.");
            return;
        }

        tl.setVariable("AZDO_DATABRICKS_JOBID", job.job_id);

        let run = this.createRun(job);

        if(run == null){
            tl.setResult(tl.TaskResult.Failed, "The run creation failed.");
            return;
        }

        tl.setVariable("AZDO_DATABRICKS_RUNID", run.run_id);
    }

    private getJobConfigurationFile(existingClusterId: string) {
        let jobTemplatePath: string;
        if (existingClusterId === '') {
            jobTemplatePath = path.join(__dirname, "job-configuration/new-cluster.json");
        }
        else {
            jobTemplatePath = path.join(__dirname, "job-configuration/existing-cluster.json");
        }

        let jobConfigurationFile = path.join(__dirname, "job-configuration.json");
        let templateContent = fs.readFileSync(jobTemplatePath, {
            encoding: 'utf8'
        }).toString();

        templateContent = templateContent.replace("__ClusterId__", existingClusterId);
        templateContent = templateContent.replace("__JobName__", "AzDO Execution");
        templateContent = templateContent.replace("__NotebookPath__", this.fullPath);

        fs.writeFileSync(jobConfigurationFile, templateContent, { 
            flag: "w", 
            encoding: 'utf8' 
        });

        return jobConfigurationFile;
    }

    private createJob(jobConfigurationFile: string){
        let command: string = "jobs create --json " + jobConfigurationFile + " --profile AZDO"

        let jobCreationCommand = tl.execSync("databricks", command);

        if (jobCreationCommand.code != 0) {
            tl.setResult(tl.TaskResult.Failed, "Databricks Job creation failed with " + jobCreationCommand.stderr);
        } else {
            let createdJob: Job = JSON.parse(jobCreationCommand.stdout);

            return createdJob;
        }
    }

    private createRun(job: Job){
        let command: string = "jobs run-now --job-id " + job.job_id + " --profile AZDO";

        if(this.params != null){
            var search = new RegExp('\"', 'g');
            
            this.params = this.params.replace(search, '\\\"');

            command = command + " --notebook-params \"" + this.params + "\"";
        }

        let runCreationCommand = tl.execSync("databricks", command);

        if(runCreationCommand.code != 0) {
            tl.setResult(tl.TaskResult.Failed, "Databricks Job Run creation failed with " + runCreationCommand.stderr);
        } else {
            let createdRun: Run = JSON.parse(runCreationCommand.stdout);

            return createdRun;
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
