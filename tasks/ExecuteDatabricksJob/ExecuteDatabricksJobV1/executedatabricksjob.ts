import tl = require('azure-pipelines-task-lib/task');

async function run() {
    try {
        const targetType: string = tl.getInput('targetType');
        
        if(targetType.toUpperCase() == "JARJOB"){
            console.log("Selected JAR Job");
        } else if(targetType.toUpperCase() == "NOTEBOOKJOB"){
            console.log("Selected Notebook Job")
        } else {
            console.log("Selected None");
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
