# Senora Banking GitHub Actions Setup

This folder is designed to be served at:

```text
https://jordan447.github.io/senorabanking/
```

GitHub Pages serves the static dashboard. GitHub Actions runs the Python puller and commits refreshed data files into this folder.

## Files

- `index.html` is the public dashboard.
- `pull/index.html` is the local pull tool page.
- `pull_transactions.py` pulls Fleeca transaction data.
- `server.py` is only for local testing.
- `.github/workflows/update-senorabanking.yml` lives at the repository root.

## Required GitHub Secret

In the repository, go to **Settings > Secrets and variables > Actions > Secrets** and add:

```text
GTA_BANK_COOKIE
```

Value:

```text
XSRF-TOKEN=...; gta_world_banking_session=...; cf_clearance=...
```

Only include those three cookies. Never put them in `index.html`.

## Updating An Expired Cookie

GitHub Actions should not update its own secret during a run. The default `GITHUB_TOKEN` cannot write repository secrets, and using a more powerful token inside the workflow would create unnecessary risk.

Use the local helper instead:

```powershell
.\senorabanking\update-cookie-and-run.ps1 `
  -Cookie 'XSRF-TOKEN=...; gta_world_banking_session=...; cf_clearance=...' `
  -RunWorkflow
```

With dates:

```powershell
.\senorabanking\update-cookie-and-run.ps1 `
  -Cookie 'XSRF-TOKEN=...; gta_world_banking_session=...; cf_clearance=...' `
  -StartDate '2026-04-26' `
  -EndDate '2026-05-03' `
  -RunWorkflow
```

This requires GitHub CLI:

```powershell
gh auth login
```

The helper strips the pasted cookie down to only:

```text
XSRF-TOKEN
gta_world_banking_session
cf_clearance
```

## Optional Repository Variables

Go to **Settings > Secrets and variables > Actions > Variables** and add:

```text
GTA_BANK_ACCOUNT_TYPE=Business
GTA_BANK_FETCH_ID=70855
GTA_BANK_START_DATE=2026-04-26
GTA_BANK_END_DATE=2026-05-03
```

Manual workflow runs can override the dates.

## Run The Workflow

1. Push these changes.
2. Open **Actions**.
3. Select **Update Senora Banking leaderboard**.
4. Click **Run workflow**.
5. Optionally provide start/end dates.

The scheduled workflow runs every 30 minutes.

## Notes

- GitHub Pages cannot run Python directly.
- Actions runs Python, updates `transactions.csv`, and commits it.
- If the action starts redirecting to login, update `GTA_BANK_COOKIE`.
- If the repo is public, committed transaction data is public too.
