# This script starts the playwright ui mode via docker.
# The playwright ui allows running tests via the browser.
# For more info see https://playwright.dev/docs/test-ui-mode#docker--github-codespaces
#

param ([string] $useDockerHostWebServer="no")

function ConvertTo-Bool($value)
{
    return ($("False","0","","N","No",'$False',"Off") -notcontains [string]$value)
}

function Get-PlaywrightVersion()
{
    # As noted in https://hub.docker.com/_/microsoft-playwright?tab=description:
    #
    # It is recommended to use Docker image version that matches Playwright version.
    # If the Playwright version in your Docker image does not match the version in your
    # project/tests, Playwright will be unable to locate browser executables.
    #
    # This function is reading the version of the @playwright/test package from the
    # package.json but if you prefer you can just hard code it.
    $packageJson = Get-Content -Raw ./package.json | ConvertFrom-Json
    $playwrightVersion = $packageJson.devDependencies.'@playwright/test'
    return $playwrightVersion -replace '[~^]', ''
}

function Start-PlaywrightUI()
{
  $ErrorActionPreference = 'Stop'

  Write-Host "Starting playwright tests with ui in docker container...`n"
  Write-Host "options:" -ForegroundColor Cyan
  Write-Host "useDockerHostWebServer=$useDockerHostWebServer`n" -ForegroundColor Cyan

  $useDockerHostWebServerAsBool = ConvertTo-Bool -value $useDockerHostWebServer
  if($useDockerHostWebServerAsBool)
  {
      $useDockerHostWebServerOptions = "--add-host=host.docker.internal:host-gateway --env USE_DOCKER_HOST_WEBSERVER=true"
  }

  # Must use a random port or else there will be issues with the UI app where sometimes the tests don't load/refresh properly.
  # I believe it has something to do with some websockets that the UI app uses. When the same port is used and the UI app is
  # restarted, the tests don't load properly until the websockets timeout and then a new connection is established.
  $playwrightUiPort = Get-Random -Minimum 40000 -Maximum 50000
  $playwrightVersion = Get-PlaywrightVersion
  $startCommand = "npx playwright test --ui-port=$playwrightUiPort --ui-host=0.0.0.0"
  if(!$useDockerHostWebServerAsBool -and $IsWindows)
  {
    $nodeModulesMount = "-v '/app/node_modules'"
    $startCommand = "/bin/bash -c 'npm ci && $startCommand'" # see https://stackoverflow.com/questions/28490874/docker-run-image-multiple-commands
  }

  $dockerRunCommand = "docker run -it --rm --ipc=host $useDockerHostWebServerOptions --workdir=/app -p ${playwrightUiPort}:${playwrightUiPort} -v '${PWD}:/app' $nodeModulesMount mcr.microsoft.com/playwright:v$playwrightVersion-jammy $startCommand"
  Write-Host "Starting docker container with ui mode..."
  Write-Host "On success the ui mode will display a message saying: 'Listening on http://0.0.0.0:${playwrightUiPort}'."
  Write-Host "At that point you'll be able to access the test UI at http://localhost:${playwrightUiPort}`n" -ForegroundColor Green
  Write-Host "$dockerRunCommand`n" -ForegroundColor Cyan
  Invoke-Expression -Command $dockerRunCommand
  Exit $LASTEXITCODE # see https://stackoverflow.com/questions/32348794/how-to-get-status-of-invoke-expression-successful-or-failed
}

Start-PlaywrightUI
