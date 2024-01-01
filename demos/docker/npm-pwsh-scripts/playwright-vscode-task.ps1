# This script bridges the 'run tests' VS Code task with the destination Powershell script.
# It's required to build the input parameters of the destination Powershell script depending
# on the inputs from the VS Code task.
#

param (
  [switch] $ui = $false,
  [string] $updateSnapshots = "no",
  [string] $useHostWebServer = "no",
  [string] $grep = "",
  [ValidateSet("auto", "install", "mount")]
  [string] $installNpmPackagesMode = "auto"
)

function ConvertToBool($value) {
  return ($("False", "0", "", "N", "No", '$False', "Off") -notcontains [string]$value)
}

function StartPlaywrightTests {
  $ErrorActionPreference = 'Stop';
  $command = "./npm-pwsh-scripts/playwright.ps1";

  if ($ui) {
    $command += " -ui";
  }

  if (ConvertToBool -value $updateSnapshots) {
    $command += " -updateSnapshots";
  }

  if (ConvertToBool -value $useHostWebServer) {
    $command += " -useHostWebServer";
  }

  if (![string]::IsNullOrEmpty($grep) -and $grep -ne "*") {
    $command += " -grep ""$grep"""
  }

  $command += " -installNpmPackagesMode $installNpmPackagesMode";

  Invoke-Expression -Command $command
  Exit $LASTEXITCODE # see https://stackoverflow.com/questions/32348794/how-to-get-status-of-invoke-expression-successful-or-failed
}

StartPlaywrightTests
