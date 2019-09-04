"use strict";
const pow = (function () {
    const fs = require("fs");
    const path = require("path");
    const PShell = require("./pshell").PShell;
    let workspace = ".";
    let execOptions = { debug: false, PSCore: "pwsh", userProfile: true };
    // Exec and return object
    async function execJ(cmd) {
        return new Promise(function (resolve, reject) {
            _POWPromise(`${cmd} | ConvertTo-Json`, true, true).then((result) => {
                if (result.success) {
                    workspace = result.object;
                    resolve(result);
                }
                else
                    reject("Could not set workspace " + workspacePath);
            }).catch(reject);
        });
    }
    // Normal exec and return string
    async function execN(cmd) {
        return new Promise(function (resolve, reject) {
            _POWPromise(cmd).then((result) => {
                if (result.success)
                    resolve(result.output);
                else
                    reject(result);
            }).catch(reject);
        });
    }
    /**
     * Execute any powershell command
     *  Will not throw an error if errors are written to stderr
     * @param {String} command: The powershell command to execute
     * @returns {Promise} Promise with a POWResult
     */
    async function exec(command) {
        return _POWPromise(command, false);
    }
    /**
     * Execute any powershell command
     *  Will throw an error if errors are written to stderr
     * @param {String} command: The powershell command to execute
     * @returns {Promise} Promise with a POWResult
     */
    async function execStrict(command) {
        return _POWPromise(command, true);
    }
    /**
     * Execute any powershell command and return an object from the JSON output
     *  Will throw an error if errors are written to stderr
     * @param {String} command: The powershell command to execute
     * @returns {Promise} Promise with a POWResult
     */
    async function execStrictJSON(command) {
        return _POWPromise(command, true, true);
    }
    /**
     * Intercept a promise and parse the result as a POWResult
     * @param {String} command: The powershell command to execute
     * @param {boolean} strict: Throw exception if we have errors
     * @returns {Promise} Promise with a POWResult
     */
    function _POWPromise(command, strict = false, json = false) {
        return new Promise(function (resolve, reject) {
            const pshell = PShell();
            let pid = pshell.init({
                pwsh: execOptions.PSCore === "pwsh" ? true : false,
                verbose: execOptions.debug,
                noProfile: !execOptions.userProfile
            });
            if (execOptions.debug)
                console.log("EXEC", pid, command);
            pshell.exec(command, [])
                .then((out) => {
                try {
                    if (execOptions.debug)
                        console.log("STDOUT", pid, out.stdout.substring(0, 200));
                    let result = _processResult(out, json);
                    if (strict && !result.success)
                        reject(new POWError(`Failure of '${command}'!`, result.messages));
                    else
                        resolve(result);
                }
                catch (e) {
                    reject(e);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }
    /**
     * Process powershell result returning a POWResul
     * @param {Object} out: stdout and stderr components
     * @param {boolean} json: Parse stdout as JSON
     * @returns {POWResult} The success, output and messages
     */
    function _processResult(out, json = false) {
        // TODO: Handle -Verbose output as type=DEBUG
        let success = true;
        let messages = [];
        // TODO: Get warnings as a series of WARNING messages
        // Get stderr as a series of ERROR messages
        if (out.stderr) {
            success = false;
            messages.push(new POWMessage("ERROR", out.stderr));
        }
        let obj = null;
        // Process JSON output
        if (json) {
            try {
                obj = JSON.parse(out.stdout);
            }
            catch (e) {
                messages.unshift(new POWMessage("ERROR", e.message));
                throw new POWError(`Invalid JSON Object: ${e.message}`, messages);
            }
        }
        else {
            // Get stdout as a series of INFO messages
            let outlines = out.stdout.split(/\r?\n/);
            for (let o = 0; o < outlines.length && o < 25; o++) {
                messages.push(new POWMessage("INFO", outlines[o]));
            }
        }
        return new POWResult(success, out.stdout, messages, obj);
    }
    return {
        execJ: execJ,
        execN: execN,
        execOptions: execOptions,
        exec: exec,
        execStrict: execStrict
    };
})();
/**
 * Result and message class
 * @param {boolean} success: True if no errors
 * @param {string} output: The raw stdout string
 * @param {POWMessage[]} messages: List of all messages
 * @param {Object} object: The resulting JSON parsed as an obhecrt
 */
const POWResult = function (success, output, messages, object) {
    this.success = success;
    this.output = output;
    this.object = object;
    this.messages = messages || [];
};
/**
 *
 * @param {string} type The type of message ERROR|WARN|INFO|DEBUG
 * @param {string} message The message text
 */
const POWMessage = function (type, message) {
    this.type = type || "INFO";
    this.message = message;
};
/**
 * A POWError consists of
 *  - A summary message
 *  - An array of POWMessages
 */
class POWError extends Error {
    constructor(message, messages) {
        super(message);
        this.messages = messages || [];
        this.name = "POWError";
    }
}
if (typeof module !== "undefined") {
    module.exports.pow = pow;
    module.exports.POWResult = POWResult;
    module.exports.POWError = POWError;
}
//# sourceMappingURL=pow.js.map