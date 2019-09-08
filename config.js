/**
 * CONFIG
 * Group your hosts by column using the environment
 * Each host can have a hostname or be null (for local services)
 * Each host can have credentials which reference the credentials section
 * Credentials:
 *  Credentials consist of a username and a password encoded as a PowerShell secure string
 *  This file must be created by you, the user of this app so that you can decode the file.
 *  File paths are relative to the application folder (i.e. "mycred.cred" must be in the same folder as this config.js)
 */
module.exports = {
    "environments": [
        {
            "key": "dev",
            "label": "DEV",
            "hosts": [
                {"key": "local1", "hostname": null, "label": "ECOM-APP02-DEV", "credential": "local", "services": ["WSearch", "SysMain", "Fax", "AJRouter"], "color": "blue lighten-1"},
                {"key": "local2", "hostname": "localhost", "label": "ECOM-APP00-DEV", "credential": "local", "services": ["a*", "MSiSCSI", "LxssManager"], "color": "blue lighten-1"}
            ]
        },
        {
            "key": "test",
            "label": "TEST",
            "hosts": [
                {"key": "test1", "hostname": "localhost", "label": "ECOM-APP02-TEST", "credential": "local", "services": ["dbupdate", "smphost", "Power"] ,"color": "green"},
                {"key": "test2", "hostname": "localhost", "label": "ECOM-APP01-TEST", "credential": "local", "services": ["stisvc", "SENS", "Dhcp"], "color": "green"}
            ]
        },
        {
            "key": "prod",
            "label": "PROD",
            "hosts": [
                {"key": "test1", "hostname": "localhost", "label": "ECOM-APP02-PROD", "credential": "local", "services": ["dbupdate", "smphost", "Power"] ,"color": "red"},
                {"key": "test2", "hostname": "localhost", "label": "ECOM-APP01-PROD", "credential": "local", "services": ["stisvc", "SENS", "Dhcp"], "color": "red"}
            ]
        }
    ],
    "credentials": {
        "local": {
            "username": "marc",
            "path": "credential1.cred"
        },
        "dmz": {
            "username": "marc",
            "path": "credential1.cred"
        }
    }
};