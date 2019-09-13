## PowerShell Service Manager
A GUI for managing selected windows services on multiple machines.

Configure your environments, servers and selected servers to view and manage (start/stop/restart) only those services you need.

![](./docs/screenshot1.png)

## Installation
```bash
npm install
mkdir ~/pssm/
```

## Create Credentials
Each server may require different credentials or you may have domain-wide credentials. Create as many as you need:
Run `powershell`or  `pwsh` and then:
```powershell
$credential = Get-Credential
$credential.Password | ConvertFrom-SecureString | Set-Content ~/pssm/credential_lan.cred
```

## Configuration
It's best to have your config.json in your user profile ~/pssm/ so:
```
cp config.json ~/pssm/
```
Adapt your config.json to point to the credentials you created e.g.
```json
"lan": {
    "username": "DOMAIN\\username",
    "path": "~/pssm/credential_lan.cred"
}
```