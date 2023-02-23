helios.widgets.push(function addTableWidget(freeboard) {
    var tableWidget = function (settings) {
        var self = this;

        var currentSettings = settings;
        var oldValue = '';
        var container = $('<table style="background-color: whitesmoke; width: 100%"></table>');
        var items;
        var dt = null;

        var height = settings.height;

        this.render = function (element) {
            $(element).empty();
            $(element).append(container);
        }

        this.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == 'value') {
                newValue = newValue[1];
                if(oldValue != JSON.stringify(newValue)) {
                    oldValue = JSON.stringify(newValue);
                    items = newValue;
                } else {
                    return;
                }
                console.debug('adding table');
                var headers = Object.keys(items[0]);

                var columns = headers.map((h) => {
                    return { data: h, title:h };
                });
                if(!dt) {
                dt = container.DataTable({
                        data: items,
                        columns: columns,
                        paging: false,
                        searching: false,
                        ordering: false,
                        // rowCallback: function(row, data, index) {
                        //     var l = $(row).find('td').length;
                        //     for(var i = 0; i < l; i++) {
                        //         if ((index + i) % 3 == 0)
                        //             $(row).find('td:eq(' + i + ')').css('background-color', 'lightred');
                        //         else if ((index + i) % 3 == 1)
                        //             $(row).find('td:eq(' + i + ')').css('background-color', 'lightblue');
                        //         else
                        //             $(row).find('td:eq(' + i + ')').css('background-color', 'lightgreen');
                        //     }
                            
                        // }
                    });
                } else {
                    dt.clear();
                    items.forEach((i) => {
                        container.dataTable().fnAddData(i);
                    });
                    dt.draw();
                }
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
        type_name: "table_widget",
        display_name: "Table Widget",
        "external_scripts" : [''],
        settings: [
            {
                name: "value",
                display_name: "Value",
                type: "calculated"
            },
            {
                name: 'height',
                display_name: 'Height',
                type: "number",
                default_value: 8
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new tableWidget(settings));
        }
    });
});