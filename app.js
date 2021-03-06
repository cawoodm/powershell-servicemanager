const dp = console.log;
const shell = require("./node-powershell.js");
const homedir = require('os').homedir();
const fs = require('fs');
const config = fs.existsSync(homedir+'/pssm/config.js')?require(homedir+'/pssm/config.js'):require('config.js');
let app = {};
process.chdir(__dirname);

Vue.component('main-section', {
    props: ['name'],
    data: function() {
        let dynamicFlex = 'xs'+Math.floor(12 / config.environments.length);
        return {environments: config.environments, dynamicFlex: dynamicFlex};
    },
    template: `
    <v-layout row wrap>
        <v-flex :[dynamicFlex]="true" v-for="env in environments" :key="env.key">
            <single-environment :name="env.key"></single-environment>
        </v-flex>
    </v-layout>
    `
});

Vue.component('single-environment', {
    props: ['name'],
    data: function() {
        let data = {};
        data.config = config.environments.filter(f=>f.key==this.name)[0];
        data.hosts = data.config.hosts;
        return data;
    },
    template: `
    <div>{{config.label}}
        <single-host v-for="host in hosts"
            :key="host.key"
            :hostname="host.hostname"
            :label="host.label"
            :filter="host.services"
            :credential="host.credential"
            :color="host.color
        "></single-host>
    </div>
    `
});

Vue.component('single-host', {
    props: ['hostname', 'filter', 'label', 'color', 'credential'],
    data: function () {
        this.message=''; //PS.exec("Get-Location").Path
        this.PS = new shell({ executionPolicy: 'Bypass', noProfile: false, verbose: true });
        if (!this.data) this.data = {results: null, message: this.message}
        this.data.errormessage = null;
        this.data.pid = this.PS.pid;
        this.data.collapse=false;
        try {
            this.getResults();
        } catch(e) {
            console.log(e.message)
        }
        return this.data;
    },
    //created() {},
    methods: {
        serviceMessage: function(SvcName, Action) {
            try {
                Actions={start:"Start",stop:"Stop",restart:"Restart"}
                Action=Actions[Action];
                let remoteCommand = `${Action}-Service ${SvcName}`;
                console.log(`Invoke-Command -ComputerName ${this.hostname} -ScriptBlock { ${remoteCommand} } -credential $cred`)
                this.PS.addCommand(`Invoke-Command -ComputerName ${this.hostname} -ScriptBlock { ${remoteCommand} } -credential $cred`)
                this.PS.invoke()
                    .then((output) => {
                        this.getResults();
                    }).catch((err) => {
                        alert(`Unable to ${Action} '${SvcName}'. Try running in Admin mode.\nSee the debug console (F12) for more details.`);
                        console.warn("ERROR", err);
                    });
            } catch(e) {
                alert(e)
            }
        },
        toggle: function() {
            console.log("collapse", this.collapse, this.data.collapse)
            this.collapse=!this.collapse;
        },
        getResults: function() {
            try {
                this.PS.clear();
                let remoteCommand = `Get-Service ${this.filter.toString()}`
                this.data.errormessage = null;
                let local = false;
                let statii = null;
                let startTypes = null;
                if (!this.hostname) {
                    statii=[null,"Stopped", "StartPending", "StopPending", "Running", "ContinuePending", "PausePending", "Paused"];
                    startTypes=["Boot","System", "Automatic", "Manual", "Disabled"];
                    this.PS.addCommand(remoteCommand + " | Select Name, Status, DisplayName, StartType, CanStop | ConvertTo-Json -Compress");
                } else {
                    let credName = this.credential;
                    this.PS.addCommand(`$user = Get-Content "~/pssm/${credName}.cred.txt"`);
                    this.PS.addCommand(`$pdd = Get-Content "~/pssm/${credName}.cred" | ConvertTo-SecureString`);
                    this.PS.addCommand(`$cred = New-Object -TypeName System.Management.Automation.PSCredential -Argumentlist "$user",$pdd`)
                    this.PS.addCommand(`Invoke-Command -ComputerName ${this.hostname} -ScriptBlock { ${remoteCommand} } -credential $cred | Select Name, Status, DisplayName, StartType, CanStop | ConvertTo-Json -Compress`)
                }
                //dp(this.label, this.filter);
                let timeout = Math.round(Math.random()*1000);
                this.PS.invoke()
                        .then((output) => {
                        //dp(this.pid, "OUTPUT", output);
                        this.data.results = JSON.parse(output)
                        if (!Array.isArray(this.data.results)) this.data.results = [this.data.results];
                        if (statii) this.data.results.forEach((s)=>{
                            s.Status = statii[s.Status]
                            s.StartType = startTypes[s.StartType]
                        });
                        //console.log("Results", this.label, this.data.results[0])
                    }).catch((err) => {
                        this.errormessage=err.message.substr(0,70)+(err.message.length>70?"...":"");
                        console.error("ERROR", err)
                    });
            } catch (e) {
                /*this.$root._data.snack.message = e;
                this.$root._data.snack.show = true*/
                alert(e);
                console.error(e);
            }
        }
    },
    template: `

  <v-card>
    <v-alert :value="!!this.errormessage" type="error">{{errormessage}}</v-alert>

    <v-toolbar :color="color || 'primary lighten-1'">
        <v-btn icon @click="toggle()"><v-icon>list</v-icon></v-btn>
        <v-toolbar-title :title="hostname">{{label}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn flat small icon @click="getResults()"><v-icon>replay</v-icon></v-btn>
        <v-btn icon @click="search()"><v-icon>search</v-icon></v-btn>
    </v-toolbar>
    <v-list style="max-height:300px; overflow-y:scroll; overflow-x:hidden;" v-if="!collapse">
        <v-list-tile v-for="res in results" :key="res.Name">
            <v-icon :color="res.Status=='Running'?'green':'red'">check_circle</v-icon>
            <v-list-tile-content>
                <v-list-tile-title :title="res.Name" v-html="res.DisplayName"></v-list-tile-title>
                <v-list-tile-sub-title v-html="res.Status + ' (' + res.StartType + ')'"></v-list-tile-sub-title>
            </v-list-tile-content>
            <v-btn flat small icon @click="serviceMessage(res.Name, 'restart')" color="blue"  :disabled="res.Status!='Running'"><v-icon>replay</v-icon></v-btn>
            <v-btn flat small icon @click="serviceMessage(res.Name, 'start')"   color="green" :disabled="res.Status=='Running'"><v-icon>play_arrow</v-icon></v-btn>
            <v-btn flat small icon @click="serviceMessage(res.Name, 'stop')"    color="red"   :disabled="!res.CanStop"><v-icon>stop</v-icon></v-btn>
        </v-list-tile>
    </v-list>
    <v-divider></v-divider>
    </v-card>
`
});
app.root = new Vue({
  el: '#root',
  data: {
  },
  mounted: function() {
  }
});

process.on('exit', function () {
    alert("Closing")
    //a.kill();
});