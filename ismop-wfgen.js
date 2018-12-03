var
argv = require('optimist').argv;

// convert number to string with leading zeros, e.g. 0001, 0002, etc.
function pad (str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

// create process node ComputeScenarioRanks
function procCSR(id) {
    return {
            "name": "computeScenarioRanks" + id,
            "function": "computeScenarioRanks",
            "type": "dataflow",
            "ins": [
                "SimulatedScenario-simset" + id,
                "RealData" + id
            ],
            "outs": [
                "Ranks"
            ]
    }
}  


// create process node ComputeThreaetLevel
function procCTL() {    
    return {
        "name": "ComputeThreatLevel",
        "function": "computeThreatLevel",
        "type": "dataflow",
        "parlevel": 5,
        "ins": [
                "Ranks"
        ],
        "outs": [
            "ThreatLevelAndRanks"
        ]
    }
}


// create Simulated scenarios signal node object
function signalSS(id, date) {
    return {
        "name": "SimulatedScenarios-simset" + id,
        "data": [
            {
                "uri": "file:///mnt/bigstorage/ismop/scenarios/simset" + id + ".dat"
            }
                                                                                         ]
                                                                                     }
}


// create Real Data signal node object
function signalRD(id, date) {
    return {
        "name": "RealData" + id,
        "data": [ {
            "uri": "http://dap.moc.ismop.edu.pl/data?" + id + ";from=" + date
        } ]
                                                                                     }
}



// main parameters:
// - nSections: how many sections will be processed
// - date: starting date to receive sensor data, e.g. 2014-09-14T10:20:13.531Z
var nSections, date;
function createWf() {

    var wf = {
           processes: [],
           signals: [],
           ins: [],
           outs: []
    };

    if (!argv._[0] && !argv._[1]) {
        console.log("Usage: node ismop_wfgen.js nSections date");
        process.exit();
    }


    wf.signals.push({"name": "Ranks"});
    for (i=1; i<=nSections; i++) { 
        wf.processes.push(procCSR(pad(i,4)));
        wf.signals.push(signalRD(pad(i,4), date));
    }
    for (i=1; i<=nSections; i++) { 
        wf.signals.push(signalSS(pad(i,4), date));
    }
    wf.processes.push(procCTL);
    wf.signals.push({"name": "ThreatLevelAndRanks"});
            
    // output workflow json to stdout
    console.log(JSON.stringify(wf, null, 2));

}

if (!argv._[0]) {
    console.log("Usage: node sleep_generator.js steps");
    process.exit();
}

var nSections = argv._[0];
var date = argv._[1];

createWf();
