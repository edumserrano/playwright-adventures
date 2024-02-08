# This script runs playwright tests in an ubuntu container.
#

param (
  [switch] $ui = $false,
  [switch] $updateSnapshots = $false,
  [switch] $useHostWebServer = $false,
  [string] $grep = "",
  [ValidateSet("auto", "install", "mount")]
  [string] $installNpmPackagesMode = "auto",
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

function NeedsToInstallNpmPackages() {
  if ($useHostWebServer) {
    # Don't need to install NPM packages if we're not even going
    # to build and serve the app. With $useHostWebServer, the tests
    # will connect to an already running instance of the app.
    $needsToInstallNpmPackages = $false
  }
  elseif ($installNpmPackagesMode -eq "install") {
    # Force install of NPM packages in the docker container and
    # override the mounted NPM packages dir
    $needsToInstallNpmPackages = $true
  }
  elseif ($installNpmPackagesMode -eq "mount") {
    # Force use of the mounted NPM packages
    $needsToInstallNpmPackages = $false
  }
  else { # $installNpmPackagesMode -eq "auto"
    # Since the docker container is a UNIX OS then we should
    # install the NPM packages if the host OS is a Windows OS.
    # This should only be required if the app has dependencies
    # which install OS specific binaries. If you know your app
    # doesn't have NPM packages with OS specific binaries then
    # you can use the $mountNpmPackages switch to always disable
    # the NPM install step.
    $needsToInstallNpmPackages = $IsWindows
  }

  return $needsToInstallNpmPackages;
}

function IsFileChangesDetectionSupported() {
  if ($fileChangesDetectionSupportMode -eq "auto") {
    $isDockerDesktopOnWindowsUsingWsl2 = IsDockerDesktopOnWindowsUsingWsl2
    if($isDockerDesktopOnWindowsUsingWsl2) {
      Write-Host "Detected Docker Desktop running on WSL2. FILE_CHANGES_DETECTION_SUPPORTED=false environment variable will be added to the docker run command." -ForegroundColor Cyan
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

function StartPlaywrightTests {
  Write-Host "Starting playwright tests run in docker container...`n" -ForegroundColor Cyan
  Write-Host "options:" -ForegroundColor DarkYellow
  Write-Host "-updateSnapshots=$updateSnapshots" -ForegroundColor DarkYellow
  Write-Host "-useHostWebServer=$useHostWebServer" -ForegroundColor DarkYellow
  Write-Host "-grep=$grep"  -ForegroundColor DarkYellow
  Write-Host "-installNpmPackagesMode=$installNpmPackagesMode`n" -ForegroundColor DarkYellow

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
  $installNpmPackages = NeedsToInstallNpmPackages
  if ($installNpmPackages) {
    $nodeModulesMount = "-v '/app/node_modules'" # exclude node_modules from the mounted /app dir. See https://www.howtogeek.com/devops/how-to-mount-a-docker-volume-while-excluding-a-subdirectory/
    $startCommand = "/bin/bash -c 'npm ci && $startCommand'" # see https://stackoverflow.com/questions/28490874/docker-run-image-multiple-commands
  }

  $playwrightVersion = GetPlaywrightVersion
  $dockerRunCommand = "docker run $interactive --rm --ipc=host $useHostWebServerOption $ciEnv --workdir=/app -v '${PWD}:/app' $nodeModulesMount mcr.microsoft.com/playwright:v$playwrightVersion-jammy $startCommand"
  if ($installNpmPackages) {
    Write-Host "NPM packages will be installed in the docker container." -ForegroundColor Cyan
  }
  else {
    Write-Host "NPM packages will be mounted from the host into the docker container." -ForegroundColor Cyan
  }

  Write-Host "Starting docker container...`n" -ForegroundColor Cyan
  Write-Host "$dockerRunCommand`n" -ForegroundColor Cyan
  Invoke-Expression -Command $dockerRunCommand
  Exit $LASTEXITCODE # see https://stackoverflow.com/questions/32348794/how-to-get-status-of-invoke-expression-successful-or-failed
}

function StartPlaywrightUI() {
  Write-Host "Starting playwright tests with ui in docker container...`n"
  Write-Host "options:" -ForegroundColor DarkYellow
  Write-Host "-useHostWebServer=$useHostWebServer" -ForegroundColor DarkYellow
  Write-Host "-installNpmPackagesMode=$installNpmPackagesMode" -ForegroundColor DarkYellow
  Write-Host "-fileChangesDetectionSupportMode=$fileChangesDetectionSupportMode`n" -ForegroundColor DarkYellow

  if ($useHostWebServer) {
    $useHostWebServerOption = "--add-host=host.docker.internal:host-gateway --env USE_DOCKER_HOST_WEBSERVER=true"
  }

  # For more info on the reason for the FILE_CHANGES_DETECTION_SUPPORTED environment variable
  # see the section 'File changes aren't triggering an application rebuild when testing with UI mode' of the README at /demos/docker/README.md
  if(IsFileChangesDetectionSupported) {
    $fileChangesDetectionSupportedEnv = "--env FILE_CHANGES_DETECTION_SUPPORTED=true"
  } else {
    $fileChangesDetectionSupportedEnv = "--env FILE_CHANGES_DETECTION_SUPPORTED=false"
  }

  # Must use a random port or else there will be issues with the UI app where sometimes the tests don't load/refresh properly.
  # I believe it has something to do with some websockets that the UI app uses. When the same port is used and the UI app is
  # restarted, the tests don't load properly until the websockets timeout and then a new connection is established.
  # Update: it's better to leave the $playwrightUiPort set to a random port until https://github.com/microsoft/playwright/issues/28680
  # is fixed. It does seem like a websocket related issue as I suspected.
  $playwrightUiPort = Get-Random -Minimum 40000 -Maximum 50000
  $playwrightVersion = GetPlaywrightVersion
  $startCommand = "npx playwright test --ui-port=$playwrightUiPort --ui-host=0.0.0.0"
  $installNpmPackages = NeedsToInstallNpmPackages
  if ($installNpmPackages) {
    $nodeModulesMount = "-v '/app/node_modules'" # exclude node_modules from the mounted /app dir. See https://www.howtogeek.com/devops/how-to-mount-a-docker-volume-while-excluding-a-subdirectory/
    $startCommand = "/bin/bash -c 'npm ci && $startCommand'" # see https://stackoverflow.com/questions/28490874/docker-run-image-multiple-commands
  }

  $dockerRunCommand = "docker run -it --rm --ipc=host $useHostWebServerOption $fileChangesDetectionSupportedEnv --workdir=/app -p ${playwrightUiPort}:${playwrightUiPort} -v '${PWD}:/app' $nodeModulesMount mcr.microsoft.com/playwright:v$playwrightVersion-jammy $startCommand"
  if ($installNpmPackages) {
    Write-Host "NPM packages will be installed in the docker container." -ForegroundColor Cyan
  }
  else {
    Write-Host "NPM packages will be mounted from the host into the docker container." -ForegroundColor Cyan
  }

  Write-Host "Starting docker container with ui mode..." -ForegroundColor Cyan
  Write-Host "On success the ui mode will display a message saying: 'Listening on http://0.0.0.0:${playwrightUiPort}'." -ForegroundColor Cyan
  Write-Host "At that point you'll be able to access the test UI at http://localhost:${playwrightUiPort}`n" -ForegroundColor Green
  Write-Host "$dockerRunCommand`n" -ForegroundColor Cyan
  Invoke-Expression -Command $dockerRunCommand
  Exit $LASTEXITCODE # see https://stackoverflow.com/questions/32348794/how-to-get-status-of-invoke-expression-successful-or-failed
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
