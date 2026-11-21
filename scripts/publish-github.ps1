param(
    [string]$RepoName = "highschool-math1-master",
    [string]$Owner = "meowmeow34spec",
    [string]$Branch = "main",
    [string]$Description = "LOGIC PRISM - 고1 공통수학1 반학기(1학기 중간고사) 논리 조립·시각 실험실·3-Wave 배틀 교육 플랫폼",
    [string]$CommitMessage = "feat: release LOGIC PRISM Grade 10 Common Math 1 half-semester mastery platform"
)

Set-StrictMode -Version Latest
# Keep Continue for native CLI stderr streams in Windows PowerShell 5.1; check $LASTEXITCODE explicitly.
$ErrorActionPreference = "Continue"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $ProjectRoot

Write-Host "==> [1/5] Verifying GitHub CLI authentication..." -ForegroundColor Cyan
gh auth status
if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI (gh) is not authenticated. Run 'gh auth login' first."
}

$DetectedOwner = (gh api user --jq ".login" 2>$null | Out-String).Trim()
if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($DetectedOwner)) {
    $Owner = $DetectedOwner
}

$FullRepo = "$Owner/$RepoName"
$RepoUrl = "https://github.com/$FullRepo"
$PagesUrl = "https://$Owner.github.io/$RepoName/"

Write-Host "==> [2/5] Initializing/updating Git repository on '$Branch'..." -ForegroundColor Cyan
if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot ".git"))) {
    git init -b $Branch
    if ($LASTEXITCODE -ne 0) {
        git init
        git checkout -B $Branch
    }
}

git config core.autocrlf false

$GitUserName = (git config user.name 2>$null | Out-String).Trim()
if ([string]::IsNullOrWhiteSpace($GitUserName)) {
    git config user.name $Owner
}
$GitUserEmail = (git config user.email 2>$null | Out-String).Trim()
if ([string]::IsNullOrWhiteSpace($GitUserEmail)) {
    git config user.email "$Owner@users.noreply.github.com"
}

git branch -M $Branch

git add -A
if ($LASTEXITCODE -ne 0) {
    throw "git add failed."
}

git rev-parse --verify HEAD 1>$null 2>$null
$HasHead = ($LASTEXITCODE -eq 0)
$Porcelain = (git status --porcelain | Out-String).Trim()

if (-not $HasHead -or -not [string]::IsNullOrWhiteSpace($Porcelain)) {
    Write-Host "==> Creating Git commit on '$Branch'..." -ForegroundColor Cyan
    git commit -m $CommitMessage
    if ($LASTEXITCODE -ne 0) {
        throw "git commit failed."
    }
} else {
    Write-Host "==> Working tree clean; HEAD commit is up to date." -ForegroundColor Green
}

Write-Host "==> [3/5] Publishing to public GitHub repository '$FullRepo'..." -ForegroundColor Cyan
gh repo view $FullRepo --json name,url 1>$null 2>$null
$RepoExists = ($LASTEXITCODE -eq 0)

if (-not $RepoExists) {
    gh repo create $RepoName --public --source=. --remote=origin --push --description $Description
    if ($LASTEXITCODE -ne 0) {
        throw "gh repo create failed for '$FullRepo'."
    }
} else {
    Write-Host "==> Repository '$FullRepo' already exists. Updating origin remote and pushing '$Branch'..." -ForegroundColor Yellow
    $ExistingRemotes = @(git remote)
    if ($ExistingRemotes -contains "origin") {
        git remote set-url origin "$RepoUrl.git"
    } else {
        git remote add origin "$RepoUrl.git"
    }

    git push -u origin $Branch
    if ($LASTEXITCODE -ne 0) {
        throw "git push failed for '$FullRepo'."
    }
}

Write-Host "==> [4/5] Activating GitHub Pages on '$Branch' ('/')..." -ForegroundColor Cyan
gh api "repos/$FullRepo/pages" 1>$null 2>$null
$PagesEnabled = ($LASTEXITCODE -eq 0)

if (-not $PagesEnabled) {
    gh api --method POST -H "Accept: application/vnd.github+json" "repos/$FullRepo/pages" -f "source[branch]=$Branch" -f "source[path]=/" 1>$null 2>$null
    if ($LASTEXITCODE -ne 0) {
        gh api --method PUT -H "Accept: application/vnd.github+json" "repos/$FullRepo/pages" -f "source[branch]=$Branch" -f "source[path]=/" 1>$null 2>$null
    }
} else {
    gh api --method PUT -H "Accept: application/vnd.github+json" "repos/$FullRepo/pages" -f "source[branch]=$Branch" -f "source[path]=/" 1>$null 2>$null
}

gh repo edit $FullRepo --description $Description --homepage $PagesUrl 1>$null 2>$null

Write-Host "==> [5/5] Verifying live GitHub repository & Pages status..." -ForegroundColor Cyan
$CommitSha = (git rev-parse HEAD | Out-String).Trim()
$RepoJson = (gh repo view $FullRepo --json url,isPrivate,homepageUrl | Out-String).Trim()
if ($LASTEXITCODE -ne 0) {
    throw "Failed to verify repository '$FullRepo' on GitHub."
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " LOGIC PRISM Published Successfully!" -ForegroundColor Green
Write-Host " Repository : $RepoUrl" -ForegroundColor White
Write-Host " Live Pages : $PagesUrl" -ForegroundColor White
Write-Host " Branch     : $Branch" -ForegroundColor White
Write-Host " Commit SHA : $CommitSha" -ForegroundColor White
Write-Host " Repo Check : $RepoJson" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green
