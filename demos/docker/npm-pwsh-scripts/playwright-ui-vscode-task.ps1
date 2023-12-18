# This script bridges the 'open tests ui' VS Code task with the destination Powershell script.
# It's required to build the input parameters of the destination Powershell script depending
# on the inputs from the VS Code task.
#

param (
  [string] $useHostWebServer = "no"
)

function ConvertToBool($value) {
  return ($("False", "0", "", "N", "No", '$False', "Off") -notcontains [string]$value)
}

function StartPlaywrightUI {
  $ErrorActionPreference = 'Stop';
  $command = "./npm-pwsh-scripts/playwright-ui.ps1";

  if (ConvertToBool -value $useHostWebServer) {
    $command += " -useHostWebServer";
  }

  Invoke-Expression -Command $command
  Exit $LASTEXITCODE # see https://stackoverflow.com/questions/32348794/how-to-get-status-of-invoke-expression-successful-or-failed
}

StartPlaywrightUI
