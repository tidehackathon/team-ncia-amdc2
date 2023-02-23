var domains = [
    'Land',
    'Maritime',
    'Air',
    'Space',
    'Cyber'
];

var domainColors = {
    land: {
        name: 'Land',
        color: '#008000'
    },
    maritime: {
        name: 'Maritime',
        color: '#000080'
    },
    air: {
        name: 'Air',
        color: '#72A0C1'
    },
    space: {
        name: 'Space',
        color: '#000050'
    },
    cyber: {
        name: 'Cyber',
        color: '#818286'
    }, 
    // Capabilities: {
    //     name: 'Capabilities',
    //     color: 'black'
    // }
}

function processResultsByFunctionalArea(datasource) {
    if(!datasource) return;
    var faMap = datasource[0].reduce(function(coll, item) {
        if (!coll[item.focusarea_name]) {
            coll[item.focusarea_name] = {
                executed: 0,
                success: 0,
                assigned: 0,
                order: item.focusarea_order
            };
        }
        return coll;
    }, {});


    datasource[1].forEach(function(item) {
        faMap[item.focusarea_name].assigned += item.assign_count;
        faMap[item.focusarea_name].executed += item.success_count + item.fail_count;
        faMap[item.focusarea_name].success += item.success_count;
    });


   return Object.keys(faMap).sort(function(fa1, fa2) {
    return faMap[fa1].order > faMap[fa2].order ? 1 : -1;
   }).map(function(fa)  {
                          return {
                              'Focus Area': fa,
                              'Tests assigned': faMap[fa].assigned,
                              'Tests executed': faMap[fa].executed,
                              'Tests passed': faMap[fa].success
                          };
    });
}

function processResultsByNation(datasources) {
    var capMap = datasources[1].reduce(function(coll, item){

        if(coll[item.capability_name + ''])

        return coll;
    } , {});

    return Object.keys(capMap).map(function(c) {
        return {
            'capability_name': c,
            'count': capMap[c],
            'percent': '',
            'status': ''
        }
    });
}

function getScore2(nr1, nr2) {
    if(!nr1) nr1 = 0;
    if(!nr2) nr2 = 1;
    nr1 = parseInt(nr1);
    nr2 = parseInt(nr2);
    return Math.floor((nr1/nr2) * 100) / 10;
}

function getScore(perc) {
    return parseInt(perc) / 10;
}

function buildNationsTable(ds) {
    var nationMap = ds[1].reduce(function(coll, item) {
        if(!coll[item.nation_name]) coll[item.nation_name] = 0;
        
        coll[item.nation_name] = getScore2(item.success_count, item.test_count);
        
        return coll;
    }, {});
    return Object.keys(nationMap).sort(function(na, nb) {
        return nationMap[na] < nationMap[nb] ? 1 : -1;
    }).map(function(n) {
        return {
            'Nation': n,
            'IO Score': nationMap[n]
        };
    });
}

function buildCapsTable(ds) {
    var nationMap = ds[1].reduce(function(coll, item) {
        if(!coll[item.capability_name]) coll[item.capability_name] = 0;
        
        coll[item.capability_name] = getScore2(item.success_count, item.test_count);
        
        return coll;
    }, {});
    return Object.keys(nationMap).sort(function(na, nb) {
        return nationMap[na] < nationMap[nb] ? 1 : -1;
    }).map(function(n) {
        return {
            'Capability': n,
            'IO Score': nationMap[n]
        };
    });
}