import tl = require('azure-pipelines-task-lib/task');

async function run() {
    try {
        let pipelineVariables = tl.getVariables();

        let runId = pipelineVariables.find(vars => vars.name == 'AZDO_DATABRICKS_RUNID');

        if(runId == undefined){
            tl.setResult(tl.TaskResult.Failed, 'No Notebook run was found on the pipeline context. Make sure that you have previously called a Notebook execution.');

            return;
        }

        let run: NotebookRun = new NotebookRun(runId.value);

        run.waitExecution();
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}



class NotebookRun{
    public runId: string;
    
    constructor (runId: string){
        this.runId = runId;
    }

    public waitExecution(){
        let status = tl.execSync("databricks", "runs get --run-id " + this.runId + " --profile AZDO");

        let statusObj: RunStatus = JSON.parse(status.stdout);

        while(statusObj.state.result_state == null){
            console.log("Run #" + this.runId + " still in progress...");
            
            status = tl.execSync("databricks", "runs get --run-id " + this.runId + " --profile AZDO");

            statusObj = JSON.parse(status.stdout);
        }

        if(statusObj.state.result_state == "SUCCESS"){
            console.log("The notebook execution suceeded (status " + statusObj.state.result_state + ")");            
        } else {
            tl.setResult(tl.TaskResult.Failed, "The notebook execution failed (status " + statusObj.state.result_state + ")");
        }

        console.log("For details, go to the execution page: " + statusObj.run_page_url);
    }
}

interface RunStatus {
    state: State,
    run_page_url: string
}

interface State {
    result_state: string
}

run();