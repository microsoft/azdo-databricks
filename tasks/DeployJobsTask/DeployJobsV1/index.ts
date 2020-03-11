import tl = require('azure-pipelines-task-lib/task');
import path = require('path');
import fs = require('fs');
import { async } from 'q';
import { fstat } from 'fs';

async function run() {
    try {
        const jobsFolderPath: string = tl.getPathInput('jobsFolderPath', true);
        var deleteMissingJobs: boolean = tl.getBoolInput('deleteMissingJobs', false);
        if (!deleteMissingJobs) { deleteMissingJobs = false }

        if (!isDirSync(jobsFolderPath)) {
            tl.setResult(tl.TaskResult.Failed, 'The specified path for jobs folder is a file.')
        }

        var existingJobsArray = GetExistingJobs();
        var deployableJobsArray = GetDeployableJobs(jobsFolderPath);
        CreateMissingJobsInDatabricks(existingJobsArray, deployableJobsArray);
        if (deleteMissingJobs) {
            DeleteMissingJobs(existingJobsArray, deployableJobsArray);
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

class DeployableJob {
    constructor(private path: string, public name: string) { }
    public deploy() {
        tl.execSync('databricks', 'jobs create --json-file ' + this.path + ' --profile AZDO');
    }
    public reset(existingJobId: number) {
        tl.execSync('databricks', 'jobs reset --json-file ' + this.path + ' --job-id ' + existingJobId + ' --profile AZDO');
    }
}

class ExistingJob {
    constructor(public id: number, public name: string) { }
    public remove() {
        tl.execSync('databricks', 'jobs delete --job-id ' + this.id + ' --profile AZDO');
    }
}

function DeleteMissingJobs(existingJobsArray: Array<ExistingJob>, deployableJobsArray: Array<DeployableJob>) {
    var deployableJobNamesArray = deployableJobsArray.map(function (d) { return d.name; });
    for (var i in existingJobsArray) {
        if (deployableJobNamesArray.indexOf(existingJobsArray[i].name) === -1) {
            existingJobsArray[i].remove();
        }
    }
}

function CreateMissingJobsInDatabricks(existingJobsArray: Array<ExistingJob>, deployableJobsArray: Array<DeployableJob>) {
    var existingJobNamesArray = existingJobsArray.map(function (e) { return e.name });
    deployableJobsArray.forEach((deployableJob, index) => {
        var existingJob = existingJobsArray.find((existingJob) => existingJob.name === deployableJob.name);
        if (!existingJob) {
            deployableJob.deploy();
        } else {
            deployableJob.reset(existingJob.id);
        }
    });
}

function GetExistingJobs(): Array<ExistingJob> {
    var result: Array<ExistingJob> = [];
    var listResult = tl.execSync('databricks', 'jobs list --output JSON --profile AZDO');
    if (listResult.code != 0) {
        tl.setResult(tl.TaskResult.Failed, "Databricks Job list failed with " + listResult.stderr);
    } else {
        var jobsObject = JSON.parse(listResult.stdout);
        jobsObject.jobs.forEach((job) => {
            result.push(new ExistingJob(job.job_id, job.settings.name));
        });
    }
    return result;
}

function GetDeployableJobs(jobsFolderPath: string): Array<DeployableJob> {
    var jobFiles = GetJobFiles(jobsFolderPath);
    var result = [];
    for (var i in jobFiles) {
        let jobContent = fs.readFileSync(jobFiles[i], {
            encoding: 'utf8'
        }).toString();
        let jobObject = JSON.parse(jobContent);
        result.push(new DeployableJob(jobFiles[i], jobObject.name));
    }
    return result;
}

function GetJobFiles(jobsFolderPath: string): Array<string> {
    var jobsFileNameArray = fs.readdirSync(jobsFolderPath);
    var result = [];
    for (var jobFileNameIndex in jobsFileNameArray) {
        result.push(path.join(jobsFolderPath, jobsFileNameArray[jobFileNameIndex]));
    }
    return result;
}

function isDirSync(aPath: string) {
    try {
        return fs.statSync(aPath).isDirectory();
    } catch (e) {
        if (e.code === 'ENOENT') {
            return false;
        } else {
            throw e;
        }
    }
}

function isPython3Selected(): boolean {
    let pythonInfo = tl.execSync("python", "-V");

    if (pythonInfo.code != 0) {
        tl.setResult(tl.TaskResult.Failed, `Failed to check python version. ${pythonInfo.stderr}`.trim())
    }

    let version: string = "";

    if (pythonInfo.stderr != "") {
        version = pythonInfo.stderr.split(' ')[1];
    } else if (pythonInfo.stdout != "") {
        version = pythonInfo.stdout.split(' ')[1];
    } else {
        tl.setResult(tl.TaskResult.Failed, `Failed to retrieve Python Version: ${pythonInfo.stderr}`);
        return false;
    }

    if (!version.startsWith('3')) {
        tl.setResult(tl.TaskResult.Failed, `Active Python Version: ${version}`);
        return false;
    }

    console.log(`Version: ${version}`);

    return true;
}

let python3Selected = isPython3Selected();

if (python3Selected) {
    console.log("Python3 selected. Running...");
    run();
} else {
    tl.setResult(tl.TaskResult.Failed, "You must add 'Use Python Version 3.x' as the very first task for this pipeline.");
}