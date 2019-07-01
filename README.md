# DevOps for Databricks extension

## Pre-requisites

### Use Python Version

To run this set of tasks in your build/release pipeline, you first need to
explicitly set a Python version. To do so, use
[this task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/tool/use-python-version?view=azure-devops)
as a first task for your pipeline.

### Supported Hosted Agents

So far, this set of tasks were tested using the following Hosted Agents:

- Hosted Ubuntu 1604
- Hosted VS2017
  - Has a know issue with the Execute Notebook task, which is described below

## Pipeline Tasks

### Configure Databricks CLI

This pipeline task installs and configures the Databricks CLI onto the agent.
The following steps are performed:

- Installs databricks-cli using pip (that's why using _Use Python Version_ is required);
- Writes a configuration file at `~/.databrickscfg` so the CLI will know which
Databricks Workspace to connect to.

### Deploy Notebooks to Workspace

This Pipeline task recursively deploys Notebooks from given folder to a Databricks Workspace.

#### Parameters

- **Notebooks folder**: a folder that contains the notebooks to be deployed. For example:
  - `$(System.DefaultWorkingDirectory)/<artifact name>/notebooks`
- **Workspace folder**: the folder to publish the notebooks on the
target Workspace. For example:
  - `/Shared`
  - `/Shared/Automation`
  - `/Users/user@domain.com`

### Execute $(notebookPath)

Executes a notebook given its workspace path. Parameters are:

- **Notebook path (at workspace)**: The path to an existing Notebook in a Workspace.
- **Existing Cluster ID**: if provided, will use the associated Cluster to run
the given Notebook, instead of creating a new Cluster.
- **Notebook parameters**: if provided, will use the values to override any
default parameter values for the notebook. Must be specified in JSON format.

#### Known issues

- [Bug 1952](https://dev.azure.com/serradas-msft/DevOps%20for%20Databricks/_workitems/edit/1952): This task is currently failing on Windows with the following error message:
  - `Error: JSONDecodeError: Invalid \escape: line 7 column 27 (char 181)`

### Wait for Notebook execution

Makes the Pipeline wait until the Notebook run - invoked by the previous task - finishes.

If the Notebook execution succeeds (status `SUCCESS`), this task will also succeed.

If the Notebook execution fails (status `FAILED`), the task (and the Pipeline) will fail.

You can have access to the run URL through the task logs. For example:

```html
2019-06-18T21:22:56.9840342Z The notebook execution suceeded (status SUCCESS)
2019-06-18T21:22:56.9840477Z For details, go to the execution page: https://<region>.azuredatabricks.net/?o=<organization-id>#job/<run-id>/run/1
```

## Contributing

To know more about how to contribute to this project, please see
[CONTRIBUTING](./CONTRIBUTING.md) page.