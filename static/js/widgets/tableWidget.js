helios.widgets.push(function addTableWidget(freeboard) {
    var tableWidget = function (settings) {
        var self = this;

        var currentSettings = settings;
        var oldValue = '';
        var container = $('<table style="width: 100%"></table>');
        var items;
        var itemsP;
        var dt = null;
        var valTypeSelector = $('<input type="checkbox" checked="true" name="valChanger" style="width: 24px; float: right;"></input>');
        var valTypeLabel = $('<label for="valChanger" style="float: right;">Percentages</label>');
        var height = settings.height;

        this.render = function (element) {
            $(element).empty();
            $(element).append(valTypeLabel);
            $(element).append(valTypeSelector);
            $(element).append(container);

            valTypeSelector
                .on('change', (e) => {
                    if (valTypeSelector.is(':checked')) {
                        dt.clear();
                        itemsP.forEach((i) => {
                            container.dataTable().fnAddData(i);
                        });
                        dt.draw();
                    } else {
                        dt.clear();
                        items.forEach((i) => {
                            container.dataTable().fnAddData(i);
                        });
                        dt.draw();
                    }
                });
        }

        this.onSettingsChanged = function (newSettings) {
            currentSettings = newSettings;
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == 'value') {
                if (oldValue != JSON.stringify(newValue[1])) {
                    oldValue = JSON.stringify(newValue[1]);
                    items = newValue[1];
                    if(items.length > 0 && newValue.length == 3) {
                        itemsP = items.map(function (i) {
                            return {
                                'Focus Area': i['Focus Area'],
                                'Tests assigned': i['Tests assigned'],
                                'Tests executed': i['Tests assigned'] == 0 ? 0 : Math.floor((i['Tests executed'] / i['Tests assigned']) * 100) + '%',
                                'Tests passed': i['Tests assigned'] == 0 ? 0 : Math.floor((i['Tests passed'] / i['Tests assigned']) * 100) + '%'
                            }
                        });
                    } else if(items.length && (items[0]['Nation'] || items[0]['Capability'])) {
                        if(valTypeLabel) {
                            valTypeLabel.remove();
                            valTypeLabel = null;
                        }
                        if(valTypeSelector) {
                            valTypeSelector.remove();
                            valTypeSelector = null;
                        }
                    }
                } else {
                    return;
                }
                console.debug('adding table');
                var headers = Object.keys(items[0]);

                var columns = headers.map((h) => {
                    return { data: h, title: h };
                });
                if (!dt) {
                    dt = container.DataTable({
                        data: (valTypeSelector && valTypeSelector.is(':checked')) ? itemsP : items,
                        columns: columns,
                        paging: false,
                        searching: false,
                        info: false,
                        ordering: false,
                        rowCallback: function (row, data, index) {
                            var l = $(row).find('td').length;
                            for (var i = 0; i < l; i++) {
                                var el = $(row).find('td:eq(' + i + ')')
                                var content = el.html();
                                if (content.indexOf('%') > 0) {
                                    var nr = parseInt(content.replace('%', ''));
                                    //console.debug('nr: ' + nr);
                                    el.css('background-color', getColorForPercentage(nr, percentColors2));
                                }
                            }

                        }
                    });
                } else {
                    dt.clear();
                    ((valTypeSelector && valTypeSelector.is(':checked')) ? itemsP : items).forEach((i) => {
                        container.dataTable().fnAddData(i);
                    });
                    dt.draw();
                }
            }
        }
        var percentColors1 = [
            { pct: 0, color: { r: 0xff, g: 0x00, b: 0 } },
            { pct: 50, color: { r: 0xff, g: 0xff, b: 0 } },
            { pct: 100, color: { r: 0x00, g: 0xff, b: 0 } }
        ];
        var percentColors2 = [

            //{ pct: 50, color: { r: 0xff, g: 0xff, b: 0 } },
            { pct: 0, color: { r: 0xf8, g: 0x6c, b: 0x6c } },
            { pct: 50, color: { r: 0xff, g: 0xe3, b: 0x82 } },
            { pct: 100, color: { r: 0x82, g: 0xc6, b: 0x7c } }
        ];

        var getColorForPercentage = function (pct, percentColors) {
            for (var i = 1; i < percentColors.length - 1; i++) {
                if (pct < percentColors[i].pct) {
                    break;
                }
            }
            var lower = percentColors[i - 1];
            var upper = percentColors[i];
            var range = upper.pct - lower.pct;
            var rangePct = (pct - lower.pct) / range;
            var pctLower = 1 - rangePct;
            var pctUpper = rangePct;
            var color = {
                r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
                g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
                b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
            };
            return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
            // or output as hex if preferred
        };

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
        "external_scripts": [''],
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