# Git + GitHub + Auto Push Setup

<p>
  <span style="color:#0ea5e9;"><strong>Blue</strong></span> = Basic setup,
  <span style="color:#22c55e;"><strong>Green</strong></span> = Run commands,
  <span style="color:#f59e0b;"><strong>Orange</strong></span> = Important notes,
  <span style="color:#ef4444;"><strong>Red</strong></span> = Troubleshooting
</p>

---

## <span style="color:#0ea5e9;">1) Create GitHub Repository</span>
1. Go to GitHub and create a new repository named **React-App**.
2. Keep it empty (no README/license) if your local project already has files.

## <span style="color:#0ea5e9;">2) Open Project in Terminal</span>
Run:

```powershell
git init
git branch -M main
```

## <span style="color:#0ea5e9;">3) Connect Local Project to GitHub</span>
Replace `USERNAME` and run:

```powershell
git remote add origin https://github.com/USERNAME/React-App.git
```

If `origin` already exists:

```powershell
git remote set-url origin https://github.com/USERNAME/React-App.git
```

Verify:

```powershell
git remote -v
```

## <span style="color:#22c55e;">4) First Commit and Push</span>

```powershell
git add .
git commit -m "Initial commit"
git push -u origin main
```

## <span style="color:#0ea5e9;">5) Add Automatic Add/Commit/Push Script</span>
Create file: `scripts/auto-git-sync.ps1`

Paste:

```powershell
param(
    [int]$DebounceSeconds = 8,
    [string]$CommitMessagePrefix = "Auto sync"
)

$repoPath = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoPath

git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Not a git repository: $repoPath"
    exit 1
}

$script:pending = $false
$script:lastChange = Get-Date

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $repoPath.Path
$watcher.IncludeSubdirectories = $true
$watcher.Filter = "*"
$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName -bor [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::DirectoryName

$onChange = {
    $changedPath = $Event.SourceEventArgs.FullPath

    if ($null -eq $changedPath) {
        return
    }

    if ($changedPath -match "\\.git\\" -or $changedPath -match "\\node_modules\\") {
        return
    }

    $script:pending = $true
    $script:lastChange = Get-Date
}

$subscriptions = @(
    Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $onChange
    Register-ObjectEvent -InputObject $watcher -EventName Created -Action $onChange
    Register-ObjectEvent -InputObject $watcher -EventName Deleted -Action $onChange
    Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $onChange
)

$watcher.EnableRaisingEvents = $true

Write-Host "Auto git sync is running in $($repoPath.Path)"
Write-Host "Debounce: $DebounceSeconds seconds"
Write-Host "Press Ctrl+C to stop"

try {
    while ($true) {
        Start-Sleep -Seconds 2

        if (-not $script:pending) {
            continue
        }

        $idleSeconds = ((Get-Date) - $script:lastChange).TotalSeconds
        if ($idleSeconds -lt $DebounceSeconds) {
            continue
        }

        $script:pending = $false

        git add -A
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "git add failed. Waiting for next change..."
            continue
        }

        $stagedChanges = git diff --cached --name-only
        if ([string]::IsNullOrWhiteSpace($stagedChanges)) {
            continue
        }

        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $message = "$CommitMessagePrefix $timestamp"

        git commit -m $message
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "git commit failed. Waiting for next change..."
            continue
        }

        git push
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "git push failed. Commit created locally; push manually when ready."
            continue
        }

        Write-Host "Synced: $message"
    }
}
finally {
    $watcher.EnableRaisingEvents = $false
    foreach ($sub in $subscriptions) {
        Unregister-Event -SourceIdentifier $sub.Name -ErrorAction SilentlyContinue
        $sub | Remove-Job -Force -ErrorAction SilentlyContinue
    }
    $watcher.Dispose()
}
```

## <span style="color:#0ea5e9;">6) Add npm Script in package.json</span>
Inside scripts, add:

```json
"auto:sync": "powershell -ExecutionPolicy Bypass -File ./scripts/auto-git-sync.ps1"
```

Example:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "auto:sync": "powershell -ExecutionPolicy Bypass -File ./scripts/auto-git-sync.ps1"
}
```

## <span style="color:#22c55e;">7) Commit This Setup Once</span>

```powershell
git add .
git commit -m "Add auto git sync watcher"
git push
```

## <span style="color:#22c55e;">8) Start Auto Sync Every Time</span>

```powershell
npm run auto:sync
```

Keep this terminal open.

## <span style="color:#22c55e;">9) Daily Workflow</span>
1. Open project.
2. Run `npm run auto:sync`.
3. Edit and save files.
4. Script auto adds, commits, and pushes.

## <span style="color:#ef4444;">10) If VS Code Shows Canceled</span>
Use terminal directly:

```powershell
git add .
git commit -m "your message"
git push
```

## <span style="color:#f59e0b;">11) Optional Recommendation</span>
Auto-commit on every save can create too many commits. For serious projects, manual commits with meaningful messages are better.
