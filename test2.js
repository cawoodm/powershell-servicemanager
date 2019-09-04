const shell = require("node-powershell");
let PS= new shell({
    executionPolicy: 'Bypass',
    noProfile: false,
    verbose: true
});

//(async function(){
    // PS.addCommand("Get-Content credential1.cred | ConvertTo-SecureString;");
    // PS.invoke()
    //     .then((output) => {
    //     console.log("Output", output)
    //     process.exit();
    // }).catch((err) => {
    //     console.error("ERROR", err)
    // });
    let remoteCommand = `Get-Service | Select Name, Status, DisplayName, StartType -First 3`
    PS.addCommand("$pdd = Get-Content credential1.cred | ConvertTo-SecureString");
    PS.addCommand("$cred = New-Object -TypeName System.Management.Automation.PSCredential -Argumentlist marc,$pdd")
    console.log(`Invoke-Command -ComputerName localhost -ScriptBlock { ${remoteCommand} } -credential $cred | ConvertTo-Json`)
    PS.addCommand(`Invoke-Command -ComputerName localhost -ScriptBlock { ${remoteCommand} } -credential $cred | ConvertTo-Json`)
    PS.invoke()
        .then((output) => {
            console.log("Output", output)
            let results = JSON.parse(output)
            console.log(results);
            results.forEach((s)=>s.Status = statii[s.Status]);
            console.log(results[0])
        }).catch((err) => {
            console.error("ERROR", err)
        });
//})();