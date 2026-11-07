$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
try {
    $runtime = Join-Path $PSScriptRoot '.bardo\runtime'
    $nodeDir = Join-Path $runtime 'node'
    $usable = $false
    if ((Get-Command node.exe -ErrorAction SilentlyContinue) -and (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
        $version = node.exe -p 'process.versions.node'
        $usable = $LASTEXITCODE -eq 0 -and ([version]$version -ge [version]'22.0.0')
    }
    if (-not $usable) {
        if (-not (Test-Path (Join-Path $nodeDir 'npm.cmd'))) {
            Write-Host 'Installing private Node.js 22 LTS...'
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            New-Item -ItemType Directory -Force -Path $runtime | Out-Null
            $releases = Invoke-RestMethod 'https://nodejs.org/dist/index.json'
            $release = $releases | Where-Object { $_.version -match '^v22\.' -and $_.lts } | Select-Object -First 1
            if (-not $release) { throw 'Node.js 22 LTS release unavailable.' }
            $arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64' -or $env:PROCESSOR_ARCHITEW6432 -eq 'ARM64') { 'arm64' } else { 'x64' }
            $name = "node-$($release.version)-win-$arch"
            $base = "https://nodejs.org/dist/$($release.version)"
            $archive = Join-Path $runtime "$name.zip"
            Invoke-WebRequest "$base/$name.zip" -OutFile $archive -UseBasicParsing
            $sums = (Invoke-WebRequest "$base/SHASUMS256.txt" -UseBasicParsing).Content
            $line = $sums -split "`n" | Where-Object { $_.Trim().EndsWith(" $name.zip") } | Select-Object -First 1
            if (-not $line) { throw 'Archive checksum missing.' }
            if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash -ne ($line.Trim() -split '\s+')[0]) { throw 'Archive checksum mismatch.' }
            Expand-Archive -LiteralPath $archive -DestinationPath $runtime -Force
            Move-Item -LiteralPath (Join-Path $runtime $name) -Destination $nodeDir
        }
        $env:PATH = "$nodeDir;$env:PATH"
    }
    & node.exe scripts/bootstrap.mjs @args
    exit $LASTEXITCODE
} catch {
    Write-Host "BARDO: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
