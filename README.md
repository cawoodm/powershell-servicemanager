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
To create the credential named `lan` Run this in powershell:
```powershell
$credential = Get-Credential
$credential.Username | ConvertFrom-SecureString | Set-Content ~/pssm/lan.cred.txt
$credential.Password | ConvertFrom-SecureString | Set-Content ~/pssm/lan.cred
```

## Configuration
It's best to have your config.js in your user profile ~/pssm/ so:
```
cp config.js ~/pssm/
```
Your services defined in config.js should each have a credential name e.g.:
```
{
  "key": "foobar",
  "hostname": null,
  "label": "MY FOO Server",
  "credential": "lan",
  "services": ["WSearch", "SysMain", "Fax", "AJRouter"],
  "color": "blue lighten-1"
}
```

