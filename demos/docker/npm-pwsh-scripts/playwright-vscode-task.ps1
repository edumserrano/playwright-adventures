# This script bridges the 'run tests' VS Code task with the destination Powershell script.
# It's required to build the input parameters of the destination Powershell script depending
# on the inputs from the VS Code task.
#

param (
  [switch] $ui = $false,
  [string] $uiPort = "43008",
  [string] $testOptions = "",
  [ValidateSet("auto", "from-docker", "from-host")]
  [string] $webServerMode = "auto",
  [string] $webServerHost = "127.0.0.1",
  [string] $webServerPort = "4200",
  [ValidateSet("auto", "supported", "unsupported")]
  [string] $fileChangesDetectionSupportMode = "auto"
)

function StartPlaywrightTests {
  $ErrorActionPreference = 'Stop';
  $command = "pwsh -NoProfile ./npm-pwsh-scripts/playwright.ps1";
  if ($ui) {
    $command += " -ui";
  }

  $command += " -uiPort $uiPort";
  if (![string]::IsNullOrEmpty($testOptions)) {
    $command += " -testOptions '$testOptions'"
  }

  $command += " -webServerMode $webServerMode";
  $command += " -webServerHost $webServerHost";
  $command += " -webServerPort $webServerPort";
  $command += " -fileChangesDetectionSupportMode $fileChangesDetectionSupportMode";

  Invoke-Expression -Command $command
  Exit $LASTEXITCODE # see https://stackoverflow.com/questions/32348794/how-to-get-status-of-invoke-expression-successful-or-failed
}

StartPlaywrightTests
