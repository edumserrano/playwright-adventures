# This script runs playwright tests in an ubuntu container.
#

param (
  [switch] $updateSnapshots = $false,
  [switch] $useHostWebServer = $false,
  [string] $grep = ""
)

function GetPlaywrightVersion() {
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

function StartPlaywrightTests {
  $ErrorActionPreference = 'Stop'
  Write-Host "Starting playwright tests run in docker container...`n" -ForegroundColor Cyan
  Write-Host "options:" -ForegroundColor DarkYellow
  Write-Host "updateSnapshots=$updateSnapshots" -ForegroundColor DarkYellow
  Write-Host "useHostWebServer=$useHostWebServer" -ForegroundColor DarkYellow
  Write-Host "grep=$grep`n"  -ForegroundColor DarkYellow

  if ($updateSnapshots) {
    $updateSnapshotsOption = "--update-snapshots"
  }

  if ($useHostWebServer) {
    $useHostWebServerOption = "--add-host=host.docker.internal:host-gateway --env USE_DOCKER_HOST_WEBSERVER=true"
  }

  if (![string]::IsNullOrEmpty($grep)) {
    $grepOption = "--grep ""$grep"""
  }

  $isCI = [System.Convert]::ToBoolean($env:CI)
  $ciEnv = "--env CI=$isCI"
  if (!$isCi) {
    $interactive = "-it"
  }

  $startCommand = "npx playwright test $updateSnapshotsOption $grepOption"
  if (!$useHostWebServer -and $IsWindows) {
    $nodeModulesMount = "-v '/app/node_modules'"
    $startCommand = "/bin/bash -c 'npm ci && $startCommand'" # see https://stackoverflow.com/questions/28490874/docker-run-image-multiple-commands
  }

  $playwrightVersion = GetPlaywrightVersion
  $dockerRunCommand = "docker run $interactive --rm --ipc=host $useHostWebServerOption $ciEnv --workdir=/app -v '${PWD}:/app' $nodeModulesMount mcr.microsoft.com/playwright:v$playwrightVersion-jammy $startCommand"
  Write-Host "Starting docker container...`n" -ForegroundColor Cyan
  Write-Host "$dockerRunCommand`n" -ForegroundColor Cyan
  Invoke-Expression -Command $dockerRunCommand
  Exit $LASTEXITCODE # see https://stackoverflow.com/questions/32348794/how-to-get-status-of-invoke-expression-successful-or-failed
}

StartPlaywrightTests
