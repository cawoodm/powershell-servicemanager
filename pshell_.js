// @ts-check
const fs = require('fs');
const SHELL = require('child_process');
const SEP = (process.platform === "win32"?"\\":"/");
const TMP = (process.env.TMPDIR
        || process.env.TMP
        || process.env.TEMP
        || (process.platform === "win32"?"c:\\windows\\temp":"/tmp")
     ) + SEP;
function Execute(Command, options) {

    window.console.log("Executing", Command)

    if (Command == "") return

    options = options || {};
    options.skipSecurity = typeof options.skipSecurity==="undefined"?false:options.skipSecurity,
    options.jsonOutput = typeof options.jsonOutput==="undefined"?true:options.jsonOutput,
    options.forceArray = typeof options.forceArray==="undefined"?false:options.forceArray,

    // Cleanup
    DeleteFile(TMP+"command.ps1");
    DeleteFile(TMP+"output.txt");
    DeleteFile(TMP+"error.txt");

    // Option to get JSON output
    if (options.jsonOutput)
        Command += "| ConvertTo-Json -Compress"

    // 1. Save powershell command to temporary file
    SaveToFile(TMP+"command.ps1", Command);

    // 2. Create "DOS" command to call this powershell
    let Cmd = "powershell.exe -File \""+TMP+"command.ps1\""

    // Option to bypass PowerShell Script Execution Policy
    if (options.skipSecurity)
        Cmd = "powershell.exe -Command \"$enccmd=[Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes((Get-Content -Path 'command.ps1')));POWERSHELL -EncodedCommand $enccmd\""

    // Output redirection to capture output
    Cmd = Cmd + " > \""+TMP+"output.txt\"";
    Cmd = Cmd + " 2> \""+TMP+"error.txt\"";

    // Have to do this or errors are not piped to 2> error.txt
    Cmd = "%COMSPEC% /C " + Cmd;
    try {
        SHELL.execSync(Cmd);
        DeleteFile(TMP+"command.ps1");
        var ErrorData = LoadFromFile(TMP+"error.txt")
        if (ErrorData) {
            throw("Script Error:\n"+ErrorData)
        }
    } catch (err) {
        throw err;
    } finally {
        //DeleteFile(TMP+"error.txt");
    }
    var result = LoadFromFile(TMP+"output.txt")
    //DeleteFile(TMP+"output.txt");
    if (options.jsonOutput) result = JSON.parse(result);
    if (options.forceArray && !Array.isArray(result)) result = [result];
    return result;
}
function Before(d, s) {
    return d.substr(0, d.indexOf(s));
}
function LoadFromFile(filename) {
    return fs.readFileSync(filename).toString();
}
function SaveToFile(filename, data) {
    fs.writeFileSync(filename, data);
}
function DeleteFile(filename) {
    if (fs.existsSync(filename)) fs.unlinkSync(filename)
}
module.exports = {
    exec: Execute,
    setConsole: function(c) {console=c}
}