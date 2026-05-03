param(
    [Parameter(Mandatory = $true)]
    [string] $Cookie,

    [string] $StartDate = "",
    [string] $EndDate = "",
    [switch] $RunWorkflow
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI is not installed or not on PATH. Install it from https://cli.github.com/ and run: gh auth login"
}

$allowedCookies = @("XSRF-TOKEN", "gta_world_banking_session", "cf_clearance")
$cookieParts = @{}

foreach ($part in ($Cookie -replace '^Cookie:\s*', '').Split(';')) {
    if ($part -notmatch '=') {
        continue
    }

    $name, $value = $part.Trim().Split('=', 2)
    if ($allowedCookies -contains $name) {
        $cookieParts[$name] = $value
    }
}

$missing = @("XSRF-TOKEN", "gta_world_banking_session") | Where-Object { -not $cookieParts.ContainsKey($_) }
if ($missing.Count -gt 0) {
    throw "Missing required cookie(s): $($missing -join ', ')"
}

$cleanCookie = ($allowedCookies | Where-Object { $cookieParts.ContainsKey($_) } | ForEach-Object {
    "$_=$($cookieParts[$_])"
}) -join "; "

$cleanCookie | gh secret set GTA_BANK_COOKIE
Write-Host "Updated GitHub secret GTA_BANK_COOKIE."

if ($RunWorkflow) {
    $args = @("workflow", "run", "update-senorabanking.yml")
    if ($StartDate) {
        $args += @("-f", "start_date=$StartDate")
    }
    if ($EndDate) {
        $args += @("-f", "end_date=$EndDate")
    }

    gh @args
    Write-Host "Triggered Update Senora Banking leaderboard workflow."
}
