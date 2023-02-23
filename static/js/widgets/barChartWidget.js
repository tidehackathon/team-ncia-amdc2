helios.widgets.push(function addBarChartWidget(freeboard) {
    var barChartWidget = function (settings) {
        var self = this;
///////////////////////////////////////////////////////!!!!! STUPID SPAGHETTI CODE!!! SORRY!!!!!!!!!!///////////////////////////////////////////////////////////////
        var currentSettings = settings;
        var oldValue = '';
        var items;
        var items2;
        var chart1;
        var chart2;
        var chart3;
        var chartCont = $('<canvas></canvas>');
        var chartCont2 = $('<canvas></canvas>');
        var chartCont3 = $('<canvas></canvas>');

        var valTypeSelector = $('<input type="checkbox" name="valChanger" style="width: 24px; float: right;"></input>');

        var height = settings.height;
        var horizontal = settings.horizontal == 'true';

        var designator = settings.designator_col;
        var designator2 = settings.designator_col2;
        var labelsCol = settings.label_col;

        var valueCol = settings.value_col;
        var percCol = settings.perc_col;

        var valueCol2 = settings.value_col2;
        var percCol2 = settings.perc_col2;

        var allLabels;

        var ds;
        var ds2;
        if(currentSettings.value) {
            ds = currentSettings.value.split('"')[1].split('"')[0];
        }
        if(currentSettings.value2) {
            ds2 = currentSettings.value2.split('"')[1].split('"')[0];
        }

        var itemThickness = 16;

        var thisChart;

        this.render = function (element) {
            $(element).empty();
            $(element).append($('<label for="valChanger" style="float: right;">Percentages</label>'));
            $(element).append(valTypeSelector);
            valTypeSelector
                .on('change', (e) => {
                    if (valTypeSelector.is(':checked')) {
                        // if($('#ds').is(':checked')) {
                            updateChartWithData(thisChart, items, percCol, designator);
                        // } else {
                        //     updateChartWithData(thisChart, items2, percCol2, designator2);
                        // }
                    } else {
                        // if($('#ds').is(':checked')) { 
                            updateChartWithData(thisChart, items, valueCol, designator);
                        // } else {
                        //     updateChartWithData(thisChart, items2, valueCol2, designator2);
                        // }
                    }
                });

            if(valueCol2) {
                $(element).append('<br/>');
                var dsSelector = $('<input type="radio" name="ds" id="ds" style="width: 24px" checked="true"></input>');
                $(element).append('<label for="ds">' + ds + '</label>');
                $(element).append(dsSelector);
               
                var dsSelector2 = $('<input type="radio" name="ds" id="ds2" style="width: 24px"></input>');
                $(element).append('<label for="ds2">' + ds2 + '</label>');
                $(element).append(dsSelector2);

                dsSelector.on('change', function(e) {
                    if(dsSelector.is(':checked')) {
                        if (valTypeSelector.is(':checked')) {
                            updateChartWithData(thisChart, items, percCol, designator);
                        } else {
                            updateChartWithData(thisChart, items, valueCol, designator);
                        }
                    }
                });
                dsSelector2.on('change', function(e) {
                    if(dsSelector2.is(':checked')) {
                        if (valTypeSelector.is(':checked')) {
                            updateChartWithData(thisChart, items2, percCol2, designator2);
                        } else {
                            updateChartWithData(thisChart, items2, valueCol2, designator2);
                        }
                    }
                });
           }

            $(element).append(chartCont);
            chart1 = new Chart(chartCont[0], {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: []
                },
                options: {
                    indexAxis: horizontal ? 'x' : 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: designator != '>Capabilities'
                        }
                    }
                }
            });
        }

        this.onSettingsChanged = function (newSettings) {
            if (newSettings.horizontal != currentSettings.horizontal) {
                // horizontal = (typeof newSettings.horizontal == 'boolean') ? newSettings.horizontal : newSettings.horizontal == 'true';
                // chart.options.indexAxis = horizontal ? 'x' : 'y';
                // chart.update();
            }
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

                if(designator == '>Capabilities') {
                    allLabels = domains.reduce(function(coll, item) {
                        coll[item] = 0;
                        return coll;
                    }, {});
                } else {
                    allLabels = {};
                }
                
                items.forEach((i) => {
                    var lbl = i[labelsCol];
                    if (!allLabels[lbl]) allLabels[lbl] = 0;
                    allLabels[lbl] += parseInt(i[valueCol]);
                });
                
                if(designator != '>Capabilities') {
                    allLabels = Object.keys(allLabels).sort((l1, l2) => {
                        return allLabels[l1] < allLabels[l2] ? 1 : -1;
                    });
                } else {
                    allLabels = Object.keys(allLabels)
                }
                thisChart = chart1;
                if (valTypeSelector.is(':checked')) {
                        updateChartWithData(thisChart, items, percCol, designator);
                } else {
                        updateChartWithData(thisChart, items, valueCol, designator);
                }
            }
            if (settingName == 'value2') {
                items2 = newValue[1];
            }
        }

        function updateChartWithData(chart, items, valueCol, designator) {
            var groupedItems = items.reduce((coll, item) => {
                var datasetLabel = designator.indexOf('>') == 0 ? designator.substr(1) : item[designator].toLowerCase();
                //if(!domainColors[datasetLabel]) return coll;

                if (!coll[datasetLabel]) coll[datasetLabel] = {};

                var val = item[valueCol];
                var amountVal = parseInt(val) == val ? parseInt(val) : 1;

                var chartLabel = item[labelsCol];
                if(!coll[datasetLabel][chartLabel]) coll[datasetLabel][chartLabel] = 0; 
                coll[datasetLabel][chartLabel] += amountVal;

                return coll;
            }, {});
            
            chart.data.labels = allLabels;
            
            var datasetNames = Object.keys(groupedItems);
            if(domainColors[datasetNames[0]] && Object.keys(groupedItems)[0] != 'Capabilities') {
                datasetNames = Object.keys(domainColors);
            }
            var order = 1;
            chart.data.datasets = datasetNames.map((gik) => {
                var returnDataset = {
                    label: gik,
                    data: allLabels.map((l) => {
                        if (!groupedItems[gik]) return 0;
                        return groupedItems[gik][l] || 0;
                    }),
                    order: order++
                };
                if(domainColors[gik]) {
                    returnDataset.label = domainColors[gik].name;
                    returnDataset.backgroundColor = domainColors[gik].color;
                } else {
                    returnDataset.backgroundColor = domains.map(function(d) {
                        return domainColors[d.toLowerCase()].color; 
                    });
                }
                returnDataset.barThickness = itemThickness;
                return returnDataset;
            });
            
            chart.update();

            chart.canvas.parentNode.style.height = designator == '>Capabilities' ? '250px' : allLabels.length * (itemThickness * 1.68) + 'px';//????
        }

        this.onDispose = function () {

        }

        this.getHeight = function () {
            return height;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "bar_chart_widget",
        display_name: "Bar Chart Widget",
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
                name: 'label_col',
                display_name: 'Labels column name',
                type: 'text'
            },
            {
                name: "value",
                display_name: "Datasource #1",
                type: "calculated"
            },
            {
                name: 'value_col',
                display_name: 'Value column name DS#1',
                type: 'text'
            },
            {
                name: 'perc_col',
                display_name: 'Percentage column name DS#1',
                type: 'text'
            },
            {
                name: 'designator_col',
                display_name: 'Categories column name DS#1',
                type: 'text'
            },
            {
                name: "value2",
                display_name: "Datasource #2",
                type: "calculated"
            },
            {
                name: 'value_col2',
                display_name: 'Value column name DS#2',
                type: 'text'
            },
            {
                name: 'perc_col2',
                display_name: 'Percentage column name DS2',
                type: 'text'
            },
            {
                name: 'designator_col2',
                display_name: 'Categories column name DS#2',
                type: 'text'
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new barChartWidget(settings));
        }
    });
});