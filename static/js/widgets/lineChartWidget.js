helios.widgets.push(function (freeboard) {
    var lineChartWidget = function (settings) {
        var self = this;

        var currentSettings = settings;
        var oldValue = '';
        var items;
        var chart;
        var chartCont = $('<canvas></canvas>');

        var height = settings.height;

        this.render = function (element) {
            $(element).empty();
            $(element).append(chartCont);
            chart = new Chart(chartCont, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Value',
                        data: [],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: 'true',
                    plugins: {
                        legend: {
                            position: 'top'
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
                var labels = items.map((i) => { return i.name; });
                var data = items.map((i) => { return i.value; });

                chart.data.labels = labels;
                chart.data.datasets[0].data = data;
                chart.data.datasets[0].label = 'Value1';
                chart.data.datasets[0].borderColor = '#AA0000';
                chart.data.datasets.push({
                    data: data.map((d, i) => {return d+i;}),
                    label: 'Value2',
                    borderColor: '#0000AA'
                });

                chart.update();
            }
        }

        this.onDispose = function () {

        }

        this.getHeight = function () {
            return height;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "line_chart_widget",
        display_name: "Line Chart Widget",
        "external_scripts": [''],
        settings: [
            {
                name: 'height',
                display_name: 'Height',
                type: 'number',
                default_value: 8
            },
            {
                name: "value",
                display_name: "Value",
                type: "calculated"
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new lineChartWidget(settings));
        }
    });
});