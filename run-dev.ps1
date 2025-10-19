$env:NODE_OPTIONS=""
$nodePath = "C:\Users\Ananta Verma\AppData\Local\nvm\v22.19.0"
$env:PATH = "$nodePath;$env:PATH"

Push-Location "C:\Users\Ananta Verma\work\My projects\SEC-hacakthon"
& "$nodePath\node.exe" "$nodePath\node_modules\npm\bin\npm-cli.js" run dev
Pop-Location

