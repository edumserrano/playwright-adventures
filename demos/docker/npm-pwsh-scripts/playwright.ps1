# This script runs playwright tests in an ubuntu container.
# This is used to produce snapshots that are compatible with the build server.
# Using windows generated snapshots, for devs using Windows, and comparing against linux
# generated snapshots would fail because linux renders fonts slightly different from windows.
#

param (
    [string] $updateSnapshots="no",
    [string] $useDockerHostWebServer="no",
    [string] $grep=""
)

function ConvertTo-Bool($value)
{
    return ($("False","0","","N","No",'$False',"Off") -notcontains [string]$value)
}

function Get-PlaywrightVersion()
{
    # the playwrightVersion version must be kept in sync with the version of @playwright/test in
    # package.json. I'm reading the value from the package.json but if you prefer you can just hard code
    # it here.
    $packageJson = Get-Content -Raw ./package.json | ConvertFrom-Json
    $playwrightVersion = $packageJson.devDependencies.'@playwright/test'
    return $playwrightVersion -replace '[~^]', ''
}

function Start-PlaywrightTests
{
    $ErrorActionPreference = 'Stop'
    Write-Host "Starting playwright tests run in docker container...`n"
    Write-Host "options:" -ForegroundColor Cyan
    Write-Host "updateSnapshots=$updateSnapshots" -ForegroundColor Cyan
    Write-Host "useDockerHostWebServer=$useDockerHostWebServer"  -ForegroundColor Cyan
    Write-Host "grep=$grep`n"  -ForegroundColor Cyan

    $updateSnapshotsAsBool = ConvertTo-Bool -value $updateSnapshots
    if($updateSnapshotsAsBool)
    {
        $updateSnapshotsOption = "--update-snapshots"
    }

    $useDockerHostWebServerAsBool = ConvertTo-Bool -value $useDockerHostWebServer
    if($useDockerHostWebServerAsBool)
    {
        $useDockerHostWebServerOptions = "--add-host=host.docker.internal:host-gateway --env USE_DOCKER_HOST_WEBSERVER=true"
    }

    if(![string]::IsNullOrEmpty($grep) -and $grep -ne "*")
    {
        $grepOption = "--grep '$grep'"
    }

    $isCI = [System.Convert]::ToBoolean($env:CI)
    $ciEnv = "--env CI=$isCI"
    if(!$isCi)
    {
        $interactive = "-it"
    }

    $startCommand = "npx playwright test $updateSnapshotsOption $grepOption"
    if(!$useDockerHostWebServerAsBool -and $IsWindows)
    {
      $nodeModulesMount = "-v '/app/node_modules'"
      $startCommand = "/bin/bash -c 'npm ci && $startCommand'"
    }

    $playwrightVersion = Get-PlaywrightVersion
    $dockerRunCommand = "docker run $interactive --rm --ipc=host $useDockerHostWebServerOptions $ciEnv --workdir=/app -v '${PWD}:/app' $nodeModulesMount mcr.microsoft.com/playwright:v$playwrightVersion-jammy $startCommand"
    Write-Host "Starting docker container...`n"
    Write-Host "$dockerRunCommand`n" -ForegroundColor Cyan
    Invoke-Expression -Command $dockerRunCommand
    Exit $LASTEXITCODE # see https://stackoverflow.com/questions/32348794/how-to-get-status-of-invoke-expression-successful-or-failed
}

Start-PlaywrightTests
