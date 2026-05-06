## Start Fuseki
Inside fuseki folder,
./fuseki-server.bat

## In order to load the .ttl data

cd C:\University\CS561\antigone-webapp

Get-ChildItem -Path .\Antigone-Layout -Recurse -Filter *.ttl | ForEach-Object {
  Invoke-RestMethod `
    -Uri "http://localhost:3030/antigone/data" `
    -Method Post `
    -ContentType "text/turtle" `
    -InFile $_.FullName
}

## webapp

python3 -m http.server 8000


# 
- Align timestamps with scenes ,
- Text to Speech to translation variants
- Annotations.
- Validators/Weak points.