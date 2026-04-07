<#
.SYNOPSIS
Initializes this repository following README.md.

.DESCRIPTION
Checks Node.js >= 20.19.0, installs or updates @fission-ai/openspec globally,
installs openspec shell completions.
#>

[CmdletBinding()]

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$minimumNodeVersion = [version]"20.19.0"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

Set-Location $scriptDir

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js $minimumNodeVersion or newer is required. Install the LTS release from https://nodejs.org/."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm was not found on PATH. Reinstall Node.js from https://nodejs.org/ and try again."
}

Write-Step "Checking Node.js version"
$nodeVersionText = (node -p "process.versions.node").Trim()
$nodeVersion = [version]$nodeVersionText

if ($nodeVersion -lt $minimumNodeVersion) {
    throw "Node.js $nodeVersionText detected. Need >= $minimumNodeVersion."
}

Write-Host "Node.js $nodeVersionText OK."

Write-Step "Installing or updating @fission-ai/openspec"
& npm install -g @fission-ai/openspec@latest

if (-not (Get-Command openspec -ErrorAction SilentlyContinue)) {
    throw "The openspec command is not available on PATH after installation. Open a new PowerShell session or fix the npm global bin path, then rerun this script."
}

Write-Step "Installing openspec shell completions"
& openspec completion install

Write-Host ""
Write-Host "Initialization complete."
Write-Host "Next step: open this repository in Cursor if it is not already open."
