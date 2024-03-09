# This script runs playwright tests in an ubuntu container.
#

param (
  [switch] $ui = $false,
  [int] $uiPort = 43008,
  [string] $testOptions = "",
  [ValidateSet("auto", "from-docker", "from-host")]
  [string] $webServerMode = "auto",
  [string] $webServerHost = "127.0.0.1",
  [string] $webServerPort = "4200",
  [ValidateSet("auto", "supported", "unsupported")]
  [string] $fileChangesDetectionSupportMode = "auto"
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

function IsFileChangesDetectionSupported() {
  if ($fileChangesDetectionSupportMode -eq "auto") {
    $isDockerDesktopOnWindowsUsingWsl2 = IsDockerDesktopOnWindowsUsingWsl2
    if($isDockerDesktopOnWindowsUsingWsl2) {
      Write-Host "Detected Docker Desktop running on WSL2. FILE_CHANGES_DETECTION_SUPPORTED=false environment variable will be added to the docker command." -ForegroundColor Cyan
      Write-Host ""
    }

    return !$isDockerDesktopOnWindowsUsingWsl2;
  } elseif ($fileChangesDetectionSupportMode -eq "supported") {
    return $true
  } elseif ($fileChangesDetectionSupportMode -eq "unsupported") {
    return $false
  }

  throw "Unknown '-fileChangesDetectionSupportMode' option. Received: $fileChangesDetectionSupportMode. Available options are: 'auto | supported | unsupported'"
}

function IsDockerDesktopOnWindowsUsingWsl2() {
  if(!$IsWindows) {
    return $false
  }

  # See https://docs.docker.com/desktop/settings/windows/
  $dockerDesktopSettings = Get-Content "$env:USERPROFILE\AppData\Roaming\Docker\settings.json" | ConvertFrom-Json
  return $dockerDesktopSettings.wslEngineEnabled
}

function UseHostWebServer() {
  $isCI = [System.Convert]::ToBoolean($env:CI)
  if($isCI) {
    return $false;
  }

  if ($webServerMode -eq "auto") {
    $isWebServerUrlAlive = [System.Net.Sockets.TcpClient]::new().ConnectAsync($webServerHost, $webServerPort).Wait(500)
    if($isWebServerUrlAlive) {
      Write-Host "Playwright's target WebServer is running at ${webServerHost}:$webServerPort. USE_DOCKER_HOST_WEBSERVER=true environment variable will be added to the docker command." -ForegroundColor Cyan
      Write-Host ""
    }

    return $isWebServerUrlAlive;
  } elseif ($webServerMode -eq "from-docker") {
    return $false
  } elseif ($webServerMode -eq "from-host") {
    return $true
  }

  throw "Unknown '-webServerMode' option. Received: $webServerMode. Available options are: 'auto | from-docker | from-host'"
}

function StartPlaywrightTests {
  Write-Host "Starting playwright tests run in docker container..." -ForegroundColor Cyan
  Write-Host ""
  Write-Host "options:" -ForegroundColor DarkYellow
  Write-Host "-testOptions=$testOptions" -ForegroundColor DarkYellow
  Write-Host "-webServerMode=$webServerMode" -ForegroundColor DarkYellow
  Write-Host "-webServerHost=$webServerHost" -ForegroundColor DarkYellow
  Write-Host "-webServerPort=$webServerPort" -ForegroundColor DarkYellow
  Write-Host ""

  $playwrightVersion = GetPlaywrightVersion
  $isCI = [System.Convert]::ToBoolean($env:CI)
  $npmInstallCommand = $isCI ? 'npm ci' : 'npm i'
  $useHostWebServer = UseHostWebServer

  $env:CI="$isCI"
  $env:PLAYWRIGHT_VERSION="$playwrightVersion"
  $env:PLAYWRIGHT_TEST_OPTIONS="$testOptions"
  $env:NPM_INSTALL_COMMAND="$npmInstallCommand"
  $env:USE_DOCKER_HOST_WEBSERVER="$useHostWebServer"

  Write-Host "Docker env variables:" -ForegroundColor DarkYellow
  Write-Host "CI=$env:CI" -ForegroundColor DarkYellow
  Write-Host "PLAYWRIGHT_VERSION=$env:PLAYWRIGHT_VERSION" -ForegroundColor DarkYellow
  Write-Host "PLAYWRIGHT_TEST_OPTIONS=$env:PLAYWRIGHT_TEST_OPTIONS" -ForegroundColor DarkYellow
  Write-Host "NPM_INSTALL_COMMAND=$env:NPM_INSTALL_COMMAND" -ForegroundColor DarkYellow
  Write-Host "USE_DOCKER_HOST_WEBSERVER=$env:USE_DOCKER_HOST_WEBSERVER" -ForegroundColor DarkYellow
  Write-Host ""

  Write-Host "Starting docker container..." -ForegroundColor Cyan
  Write-Host ""

  docker compose up --exit-code-from playwright-tests
  Exit $LASTEXITCODE # this in combination with --exit-code-from on the docker compose command above means that the exit code will match the exit code from running the playwright tests. In other words, it allows for failing a CI pipeline if the tests fail.
}

function StartPlaywrightUI() {
  Write-Host "Starting playwright tests with ui in docker container..."
  Write-Host ""
  Write-Host "options:" -ForegroundColor DarkYellow
  Write-Host "-uiPort=$uiPort" -ForegroundColor DarkYellow
  Write-Host "-testOptions=$testOptions" -ForegroundColor DarkYellow
  Write-Host "-webServerMode=$webServerMode" -ForegroundColor DarkYellow
  Write-Host "-webServerHost=$webServerHost" -ForegroundColor DarkYellow
  Write-Host "-webServerPort=$webServerPort" -ForegroundColor DarkYellow
  Write-Host "-fileChangesDetectionSupportMode=$fileChangesDetectionSupportMode" -ForegroundColor DarkYellow
  Write-Host ""

  $playwrightVersion = GetPlaywrightVersion
  $isCI = [System.Convert]::ToBoolean($env:CI)
  $npmInstallCommand = $isCI ? 'npm ci' : 'npm i'
  $useHostWebServer = UseHostWebServer
  $isFileChangesDetectionSupported = IsFileChangesDetectionSupported

  $env:CI="$isCI"
  $env:PLAYWRIGHT_VERSION="$playwrightVersion"
  $env:PLAYWRIGHT_TEST_OPTIONS="$testOptions"
  $env:NPM_INSTALL_COMMAND="$npmInstallCommand"
  $env:USE_DOCKER_HOST_WEBSERVER="$useHostWebServer"
  $env:UI_PORT="$uiPort"
  $env:FILE_CHANGES_DETECTION_SUPPORTED="$isFileChangesDetectionSupported"
  $env:CHOKIDAR_USEPOLLING="$(!$isFileChangesDetectionSupported)"

  Write-Host "Docker env variables:" -ForegroundColor DarkYellow
  Write-Host "CI=$env:CI" -ForegroundColor DarkYellow
  Write-Host "PLAYWRIGHT_VERSION=$env:PLAYWRIGHT_VERSION" -ForegroundColor DarkYellow
  Write-Host "PLAYWRIGHT_TEST_OPTIONS=$env:PLAYWRIGHT_TEST_OPTIONS" -ForegroundColor DarkYellow
  Write-Host "NPM_INSTALL_COMMAND=$env:NPM_INSTALL_COMMAND" -ForegroundColor DarkYellow
  Write-Host "USE_DOCKER_HOST_WEBSERVER=$env:USE_DOCKER_HOST_WEBSERVER" -ForegroundColor DarkYellow
  Write-Host "UI_PORT=$env:UI_PORT" -ForegroundColor DarkYellow
  Write-Host "FILE_CHANGES_DETECTION_SUPPORTED=$env:FILE_CHANGES_DETECTION_SUPPORTED" -ForegroundColor DarkYellow
  Write-Host "CHOKIDAR_USEPOLLING=$env:CHOKIDAR_USEPOLLING" -ForegroundColor DarkYellow
  Write-Host ""

  Write-Host "Starting docker container with ui mode..." -ForegroundColor Cyan
  Write-Host "On success the ui mode will display a message saying: 'Listening on http://0.0.0.0:${uiPort}'." -ForegroundColor Cyan
  Write-Host "At that point you'll be able to access the test UI at http://localhost:${uiPort}" -ForegroundColor Green
  Write-Host ""

  docker compose -f ./docker-compose.ui.yml up
}

function Main() {
  $ErrorActionPreference = 'Stop'

  if ($ui) {
    StartPlaywrightUI
  }
  else {
    StartPlaywrightTests
  }
}

Main
