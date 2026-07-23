param(
  [string]$Message,
  [switch]$Yes
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot

function Invoke-Checked {
  param([scriptblock]$Command, [string]$FailureMessage)
  & $Command
  if ($LASTEXITCODE -ne 0) { throw $FailureMessage }
}

function Find-GitHubCli {
  $command = Get-Command gh -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }

  $knownPath = 'C:\Program Files\GitHub CLI\gh.exe'
  if (Test-Path -LiteralPath $knownPath) { return $knownPath }
  return $null
}

try {
  $branch = (& git branch --show-current).Trim()
  if ($LASTEXITCODE -ne 0) { throw '当前目录不是 Git 仓库。' }
  if ($branch -ne 'master') { throw "当前分支是 $branch；本站只从 master 自动部署。" }

  $changes = @(& git status --short)
  if ($changes.Count -eq 0) {
    Write-Host '没有需要发布的变更。' -ForegroundColor Yellow
    exit 0
  }

  Write-Host "`n本次将发布以下变更：" -ForegroundColor Cyan
  $changes | ForEach-Object { Write-Host $_ }

  if (-not $Yes) {
    $confirmation = Read-Host "`n确认构建并发布以上全部变更？输入 y 继续"
    if ($confirmation -notin @('y', 'Y', 'yes', 'YES', '是')) {
      Write-Host '已取消发布。' -ForegroundColor Yellow
      exit 0
    }
  }

  Write-Host "`n正在构建站点..." -ForegroundColor Cyan
  Invoke-Checked { npm run build } '站点构建失败，未提交任何内容。'

  Invoke-Checked { git add -A } '暂存变更失败。'
  if (-not $Message) {
    $Message = Read-Host '提交说明（直接回车使用默认值）'
  }
  if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = 'Update site ' + (Get-Date -Format 'yyyy-MM-dd HH:mm')
  }

  Invoke-Checked { git commit -m $Message } '创建提交失败。'
  $commit = (& git rev-parse HEAD).Trim()
  Invoke-Checked { git push origin master } '推送失败，请检查网络或 GitHub 登录状态。'

  Write-Host "`n代码已推送，正在等待 GitHub Pages 部署..." -ForegroundColor Cyan
  $gh = Find-GitHubCli
  if ($gh) {
    $runId = $null
    for ($attempt = 0; $attempt -lt 10 -and -not $runId; $attempt++) {
      Start-Sleep -Seconds 2
      $runResult = & $gh run list --repo aliuyu422/aliuyu422.github.io --workflow deploy.yml --commit $commit --limit 1 --json databaseId --jq '.[0].databaseId'
      if ($LASTEXITCODE -eq 0 -and $runResult) {
        $runId = ($runResult | Select-Object -First 1).Trim()
      }
    }

    if ($runId) {
      Invoke-Checked { & $gh run watch $runId --repo aliuyu422/aliuyu422.github.io --exit-status } 'GitHub Pages 部署失败，请打开 Actions 查看日志。'
    } else {
      Write-Host '暂未查询到部署任务，请稍后查看 GitHub Actions。' -ForegroundColor Yellow
    }
  } else {
    Write-Host '未找到 GitHub CLI，推送已完成；Pages 会继续自动部署。' -ForegroundColor Yellow
  }

  Write-Host "`n发布完成：https://aliuyu422.github.io/" -ForegroundColor Green
  Start-Process 'https://aliuyu422.github.io/'
} catch {
  Write-Host "`n发布失败：$($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
