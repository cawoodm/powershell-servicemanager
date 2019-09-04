var pow = require("./pow").pow;
(async function(){
    let remoteCommand = `Get-Service | Select Name, Status, DisplayName, StartType -First 10`
    let command = "$password = Get-Content credential1.cred | ConvertTo-SecureString;"
    command += "$cred = New-Object -TypeName System.Management.Automation.PSCredential -Argumentlist marc,$pass;"
    command += `Invoke-Command -ComputerName localhost -ScriptBlock { ${remoteCommand} } -credential $cred`
    let res = await pow.execN(command);
    console.log("result", res)
    process.exit();
})();