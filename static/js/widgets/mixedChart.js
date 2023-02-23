helios.widgets.push(function (freeboard) {
    var mixedChartWidget = function (settings) {
        var self = this;
///////////////////////////////////////////////////////!!!!! STUPID SPAGHETTI CODE!!! SORRY!!!!!!!!!!///////////////////////////////////////////////////////////////
        var currentSettings = settings;
        var oldValue = '';
        var items;
        
        var chartCont = $('<canvas></canvas>');


        var height = settings.height;
        

        var ds;
        if(currentSettings.value) {
            ds = currentSettings.value.split('"')[1].split('"')[0];
        }

        var itemThickness = 16;

        var thisChart;

        this.render = function (element) {
            $(element).empty();

            $(element).append(chartCont);
            thisChart = new Chart(chartCont[0], {
                //type: 'bar',
                data: {
                    labels: [],
                    datasets: []
                },
                options: {
                    indexAxis: 'x',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        // x: {
                        //     stacked: true
                        // },
                        // y: {
                        //     stacked: true
                        // }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }

        this.onSettingsChanged = function (newSettings) {
            currentSettings = newSettings;
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == 'value') {
                newValue = newValue[1];
                if (oldValue != JSON.stringify(newValue)) {
                    oldValue = JSON.stringify(newValue);
                    items = newValue;
                } else {
                    return;
                }
                if (items.length == 0) return;

                var supplies = {
                    type: 'bar',
                    label: 'Supply',
                    data: [],
                    backgroundColor: [],
                    //borderWidth: '2px',

                };
                var demands = {
                    type: 'line',
                    label: 'Demand',
                    data: [],
                    backgroundColor: [],
                    borderColor: 'black',
                    tension: 0.2
                };
                var datasets = [demands, supplies];
                
                var thisDomains = items.reduce(function(coll,item) {
                    if (!coll[item.operational_area_name.toLowerCase()]) coll[item.operational_area_name.toLowerCase()] = {};
                    coll[item.operational_area_name.toLowerCase()].supply = item.supply_value;
                    coll[item.operational_area_name.toLowerCase()].demand = item.demand_value; 
                    return coll;
                }, {});
            
                

                domains.forEach((d) => {
                    d = d.toLowerCase()
                    var domainObj = domainColors[d];
                    
                    var color = 'red';
                    if(domainObj) {
                        color = domainObj.color;
                    } else {
                        console.log('!!!!!!!!!! no color for ' + d);
                    }
                    supplies.data.push(thisDomains[d] ? thisDomains[d].supply : 0);
                    supplies.backgroundColor.push(color);
                    demands.data.push(thisDomains[d] ? thisDomains[d].demand : 0);
                    demands.backgroundColor.push(color);
                })

                updateChartWithData(thisChart, domains, datasets);
            }
        }

        function updateChartWithData(chart, labels, datasets) {       
            chart.data.labels = labels;

            chart.data.datasets = datasets
            
            chart.update();

            chart.canvas.parentNode.style.height = '140px';
        }

        this.onDispose = function () {

        }

        this.getHeight = function () {
            return height;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "mixed_chart_widget",
        display_name: "Mixed Chart Widget",
        "external_scripts": [''],
        settings: [
            {
                name: 'horizontal',
                display_name: 'Horizontal',
                type: "boolean",
                default_value: 'true'
            },
            {
                name: 'height',
                display_name: 'Height',
                type: 'number',
                default_value: 8
            },
            {
                name: "value",
                display_name: "Datasource",
                type: "calculated"
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new mixedChartWidget(settings));
        }
    });
});