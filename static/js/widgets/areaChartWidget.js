helios.widgets.push(function (freeboard) {
    var areaChartWidget = function (settings) {
        var self = this;
///////////////////////////////////////////////////////!!!!! STUPID SPAGHETTI CODE!!! SORRY!!!!!!!!!!///////////////////////////////////////////////////////////////
        var currentSettings = settings;
        var oldValue = '';
        var items;

        var chartCont = $('<canvas></canvas>');

        var height = settings.height;

        var designator = settings.designator_col;
        var labelsCol = settings.label_col;
        var valueCol = settings.value_col;

        var ds;
        if(currentSettings.value) {
            ds = currentSettings.value.split('"')[1].split('"')[0];
        }

        var thisChart;

        this.render = function (element) {
            $(element).empty();
            
            $(element).append(chartCont);
            thisChart = new Chart(chartCont[0], {
                type: 'line',
                data: {
                    labels: [],
                    datasets: []
                },
                options: {
                    //indexAxis: horizontal ? 'x' : 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            //stacked: true
                        },
                        y: {
                            display: true,
                            position: 'left',
                            stacked: true,
                            beginAtZero: true
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
                items = newValue[1];
                if (oldValue != JSON.stringify(items)) {
                    oldValue = JSON.stringify(items);
                } else {
                    return;
                }
                if (items.length == 0) return;

                allLabels = {};
                newValue[0].forEach((i) => {
                    if (!allLabels[i[labelsCol]]) allLabels[i[labelsCol]] = 0;
                    allLabels[i[labelsCol]] += parseInt(i[valueCol]);
                });
                
                allLabels = Object.keys(allLabels).sort((l1, l2) => {
                    return l1 > l2 ? 1 : -1;
                });
                console.debug('Got labels ' + allLabels + ' from ' + items.length + ' items. Filters: ' + JSON.stringify(helios.filters));
                updateChartWithData(thisChart, items, valueCol, designator);
            }
        }

        function updateChartWithData(chart, items, valueCol, designator) {
            var groupedItems = items.reduce((coll, item) => {
                var datasetLabel = item[designator].toLowerCase();
                //if(!domainColors[datasetLabel]) return coll;

                if (!coll[datasetLabel]) coll[datasetLabel] = {};

                var val = item[valueCol];
                var amountVal = parseInt(val) == val ? parseInt(val) : 1;

                var chartLabel = item[labelsCol]
                if(!coll[datasetLabel][chartLabel]) coll[datasetLabel][chartLabel] = 0; 
                coll[datasetLabel][chartLabel] += amountVal;

                return coll;
            }, {});
            
            chart.data.labels = allLabels;
            
            var datasetNames = Object.keys(groupedItems);
            if(domainColors[datasetNames[0]]) {
                datasetNames = Object.keys(domainColors);
            }
            var order = 1;
            var lName = 'y';
            var lCounter = 1;
            chart.data.datasets = datasetNames.map((gik) => {
                var returnDataset = {
                    label: gik,
                    data: allLabels.map((l) => {
                        if(!groupedItems[gik]) return 0;
                        return groupedItems[gik][l] || 0
                    }),
                    order: order++,
                    fill: true,
                    yAxisID: lName
                };
                //if(lName == 'y') lName = 'y1';
                if(domainColors[gik]) {
                    returnDataset.label = domainColors[gik].name;
                    returnDataset.backgroundColor = domainColors[gik].color;
                }
                return returnDataset;
            });
            
            chart.update();

            chart.canvas.parentNode.style.height = Math.max(datasetNames.length * 100, 500) + 'px';//????
        }

        this.onDispose = function () {

        }

        this.getHeight = function () {
            return height;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "area_chart_widget",
        display_name: "Area Chart Widget",
        "external_scripts": [''],
        settings: [
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
                display_name: "Datasource",
                type: "calculated"
            },
            {
                name: 'value_col',
                display_name: 'Value column name',
                type: 'text'
            },
            {
                name: 'designator_col',
                display_name: 'Categories column name',
                type: 'text',
                description: 'Column to set categories on chart (e.g. operational area)'
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new areaChartWidget(settings));
        }
    });
});