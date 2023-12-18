# This script detects stale Playwright screenshots and removes them.
# This script will be required for as long as Playwright doesn't provide a built-in alternative.
# See: https://github.com/microsoft/playwright/issues/16582
#

param(
  [string] $snapshotDir,
  [string] $tempSnapshotDir,
  [int] $maxAttempts = 5,
  [switch]$dryRun = $false
)

function CreateTempSnapshots([int] $maxAttempts) {
  # Run Playwright to generate the expected snapshots
  $attemptsCount = 0;
  do {
    $attemptsCount++;
    Write-Host "📄 Generating expected snapshots (attempt ${attemptsCount} / $maxAttempts)`n" -ForegroundColor Cyan;
    npx playwright test --update-snapshots;
  } until ($LASTEXITCODE -eq 0 -or $attemptsCount -ge $maxAttempts);

  # Check if all attempts have failed
  if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate the expected snapshots after $attemptsCount attempts." -ForegroundColor Red;
    exit 1;
  }
}

function GetStaleScreenshots(
  [string] $snapshotDir,
  [string] $tempSnapshotDir
) {
  # Determine which files are unused
  Write-Host "🔍 Searching for stale snapshots..." -ForegroundColor Cyan;

  $currentSnapshotFiles = Get-ChildItem -Recurse -File -Path $snapshotDir;
  $currentSnapshotRelativeFilePaths = @();
  $snapshotDirAsAbsolutePath = Resolve-Path -Path $snapshotDir
  foreach ($currentSnapshotFile in $currentSnapshotFiles) {
    $currentSnapshotRelativeFilePaths += [System.IO.Path]::GetRelativePath($snapshotDirAsAbsolutePath, $currentSnapshotFile.FullName);
  }

  $tempSnapshotFiles = Get-ChildItem -Recurse -File -Path $tempSnapshotDir;
  $tempSnapshotRelativeFilePaths = @();
  $tempSnapshotDirAsAbsolutePath = Resolve-Path -Path $tempSnapshotDir
  foreach ($tempSnapshotFile in $tempSnapshotFiles) {
    $tempSnapshotRelativeFilePaths += [System.IO.Path]::GetRelativePath($tempSnapshotDirAsAbsolutePath, $tempSnapshotFile.FullName);
  }

  $diffResults = @(Compare-Object -ReferenceObject $tempSnapshotRelativeFilePaths -DifferenceObject $currentSnapshotRelativeFilePaths);

  $staleScreenshots = @();
  foreach ($diffItem in $diffResults) {
    # See https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/compare-object#description
    # Entries that exist on the ReferenceObject only have a SideIndicator of <=
    # Entrie that exist on the DifferenceObject only have a SideIndicator of =>
    if ($diffItem.SideIndicator -eq "=>") {
      # These entries only exist on the DifferenceObject, which is the current
      # snapshots dir. Since they don't exist on the temp snapshot dir it means these
      # are the stale entries.
      $staleScreenshotFullPath = Join-Path $snapshotDir $diffItem.InputObject;
      $staleScreenshots += $staleScreenshotFullPath;
    }
  }

  $staleScreenshotsData = [PSCustomObject]@{
    TotalScreenshotsCount = $currentSnapshotFiles.Count
    StaleScreenshotsCount = $staleScreenshots.Count
    StaleScreenshots      = $staleScreenshots
  }
  return $staleScreenshotsData;
}

function WriteStaleScreenshots(
  [string[]] $staleScreenshots
) {
  foreach ($staleScreenshotFilePath in $staleScreenshots) {
    $fileRelativePath = $staleScreenshotFilePath | Resolve-Path -Relative;
    Write-Host "* $fileRelativePath" -ForegroundColor Cyan;
  }

  Write-Host "`n😶 Stale screenshots weren't deleted because this was a dry run." -ForegroundColor DarkYellow;
}

function RemoveStaleScreenshots(
  [string[]] $staleScreenshots
) {
  foreach ($staleScreenshotFilePath in $staleScreenshots) {
    $fileRelativePath = $staleScreenshotFilePath | Resolve-Path -Relative;
    Write-Host "* Deleting stale screenshot: $fileRelativePath" -ForegroundColor Cyan;
    Remove-Item -Path $staleScreenshotFilePath;
  }

  Write-Host ""; # just for the new line after the delete screenshot messages

  # Check if there are any empty folders left after deleting the screenhots and remove them
  Get-ChildItem $snapshotDir -Recurse -Force -Directory
  | Sort-Object -Property FullName -Descending
  | Where-Object { $($_ | Get-ChildItem -Force | Select-Object -First 1).Count -eq 0 }
  | Remove-Item;
}

function Remove-TempSnapshotsDirectory(
  [string] $tempSnapshotDir
) {
  Remove-Item -Recurse -Path $tempSnapshotDir -ErrorAction SilentlyContinue;
}

function StartStaleScreenshotsCleanup {
  $ErrorActionPreference = 'Stop';
  $env:SNAPSHOT_DIR = $tempSnapshotDir;

  Remove-TempSnapshotsDirectory -tempSnapshotDir $tempSnapshotDir;
  CreateTempSnapshots -maxAttempts $maxAttempts;
  $staleScreenshots = GetStaleScreenshots -snapshotDir $snapshotDir -tempSnapshotDir $tempSnapshotDir;
  if ($staleScreenshots.StaleScreenshotsCount -eq 0) {
    Write-Host "✅ Didn't find any stale screenshot in a total of $($staleScreenshots.TotalScreenshotsCount) screenshots." -ForegroundColor Green;
  }
  else {
    Write-Host "👀 Found $($staleScreenshots.StaleScreenshotsCount) stale screenshots in a total of $($staleScreenshots.TotalScreenshotsCount) screenshots.`n" -ForegroundColor DarkYellow;

    if ($dryRun) {
      WriteStaleScreenshots -staleScreenshots $staleScreenshots.StaleScreenshots;
    }
    else {
      RemoveStaleScreenshots -staleScreenshots $staleScreenshots.StaleScreenshots;
    }
  }

  Remove-TempSnapshotsDirectory -tempSnapshotDir $tempSnapshotDir;
  Write-Host "✅ Finished cleaning Playwright stale screenshots." -ForegroundColor Green;
}

StartStaleScreenshotsCleanup;
