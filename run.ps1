$package = Get-Content -Path '.\package.json' | ConvertFrom-Json
$package.main = '.\USB\main.js'
$package | ConvertTo-Json -Depth 2 | Set-Content -Path '.\package.json'

Start-Process powershell 'node ./Server/app.js'
Start-Process powershell 'npm start' -Wait

$package.main = '.\USB\usb_drive.js'
$package | ConvertTo-Json -Depth 2 | Set-Content -Path '.\package.json'

Start-Process powershell 'npm start'