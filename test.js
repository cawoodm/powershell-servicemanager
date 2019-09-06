const shell = require("node-powershell");

const PS1 = new shell({ executionPolicy: 'Bypass', noProfile: false, verbose: true });
PS1.addCommand("Get-Service A*");
PS1.invoke()
    .then((output) => {
        console.log("Output A", output)
        PS1.dispose();
    }).catch((err) => {
        console.error("ERROR", err)
    });

const PS2 = new shell({ executionPolicy: 'Bypass', noProfile: false, verbose: true });
PS2.addCommand("Get-Service B*");
PS2.invoke()
    .then((output) => {
        console.log("Output B", output)
        PS2.dispose();
    }).catch((err) => {
        console.error("ERROR", err)
    });