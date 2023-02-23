helios.widgets.push(function (freeboard) {
    var tilesWidget = function (settings) {
        var self = this;

        var currentSettings = settings;
        var currentData;

        var height = settings.height;
        var columns = settings.columns;
        var container = $('<table></table>').addClass('gridTable');
        var dsName;

        this.render = function (element) {
            $(element).empty();
            $(element).append(container);
            if(currentSettings.source.indexOf('datasource') >= 0) {
                dsName = currentSettings.source.split('"')[1].split('"')[0];
            }
        }

        function showTiles(inputData) {
            container.html('');
            var thisRow;
            inputData.forEach((d, i) => {
                if(i % columns == 0) {
                    thisRow = $('<tr></tr>').appendTo(container);
                }
                var itm = $('<td></td>')
                    .html(d.name)
                    .attr('data-linkid', d.id)
                    .on('click', (e) => {
                        if(validTile(d)) return;
                        var tabName = dsName ? dsName.substr(0, dsName.length - 1) : $(e.target).attr('data-linkid');      
                        for(var i = 0; i < menuItems.length; i++) {
                            if (menuItems[i].id == tabName) {
                                $('#tabs').tabs('option', 'active', i);
                                if(dsName) {
                                    helios.filters = {};
                                    helios.setSingleFilter(tabName, $(e.target).attr('data-linkid'));
                                }
                                break;
                            }
                        }
                    })
                    .appendTo(thisRow);
                if(validTile(d)) {
                    itm.addClass('disabledGrid');
                }
            });
        }

        function validTile(t) {
            return t.enabled !== 'true' || (t.name.indexOf('CWIX') == 0 && t.name != 'CWIX 2021' && t.name != 'CWIX 2022');
        }

        this.onSettingsChanged = function (newSettings) {
            currentSettings = newSettings;
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == 'source') {
                currentData = newValue;
                showTiles(newValue[1]);
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
        type_name: "tiles_widget",
        display_name: "Tiles Widget",
        "external_scripts": [''],
        settings: [
            {
                name: 'height',
                display_name: 'Height of entire widget',
                type: 'number',
                default_value: 8
            },
            {
                name: 'columns',
                display_name: 'Columns',
                type: 'number',
                default_value: 2
            },
            {
                name: "source",
                display_name: "Datasource for items",
                type: "calculated"
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new tilesWidget(settings));
        }
    });
});