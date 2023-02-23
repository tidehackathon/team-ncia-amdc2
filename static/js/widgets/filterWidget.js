var selectorIds = 0;
helios.widgets.push(function addFilterWidget(freeboard) {
    var filterWidget = function (settings) {
        var self = this;

        var currentSettings = settings;
        var oldValue = '';

        var thisSelector = $('<select id="selector' + (selectorIds++) + '"></select>');
        var filteringFor;
        var items;
        var multiselect = (typeof settings.multiselect =='boolean') ? settings.multiselect : settings.multiselect == 'true';
        var filterObj = settings.by_object || '';
        var nameSuffix = settings.name_suffix || 'name';

        var fname;

        this.render = function (element) {
            $(element).empty();
            $(element).append(thisSelector);

            filteringFor = currentSettings.value.split('"')[1].split('"')[0];
            fname = filterObj || filteringFor;
            thisSelector.select2({
                closeOnSelect: !multiselect,
                multiple: multiselect,
                placeholder: 'Select to filter...',
                width: '95%'
            });
            thisSelector.on('select2:select', function(e) {
                if(multiselect) {
                    helios.addFilter(fname, e.params.data.id);
                } else {
                    helios.setSingleFilter(fname, e.params.data.id);
                }
            })
            .on('select2:unselect', function(e) {
                if(multiselect)
                    helios.removeFilter(fname, e.params.data.id);
            });
        }

        this.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == 'value') {
                newValue = newValue[0];
                if(oldValue != JSON.stringify(newValue)) {
                    oldValue = JSON.stringify(newValue);
                    items = newValue;
                } else {
                    return;
                }
                var namePropName = objectName(filterObj) + nameSuffix;
                var idPropName = objectName(filterObj) + 'id';
                thisSelector.empty();

                var idsHere = {};
                newValue.forEach((v) => {
                    var optName = v[namePropName];
                    var optId = v[idPropName];
                    if (!idsHere[optId]) {
                        thisSelector.append(new Option(optName, optId, false, false));
                        idsHere[optId] = true;
                    }
                });
                thisSelector.trigger('change');
                
                if (helios.filters[fname]) {
                    thisSelector.val(helios.filters[fname]).trigger('change');
                } else if(!multiselect) {
                    thisSelector.val(items[0][idPropName]).trigger('change');
                    helios.setSingleFilter(fname, items[0][idPropName]);
                }
            }
        }

        function objectName(n) {
            return (n.length > 0 ? n + '_' : '');
        }

        this.onDispose = function () {
            console.log('clearing filter ' + fname);
            helios.clearFilter(fname);
        }

        this.getHeight = function () {
            return 2;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "filter_widget",
        display_name: "Filter Widget",
        "external_scripts" : [''],
        settings: [
            {
                name: "value",
                display_name: "Datasource to filter",
                type: "calculated"
            },
            {
                name: 'multiselect',
                display_name: 'Multiselect',
                type: 'boolean'
            },
            {
                name: 'by_object',
                display_name: 'Object type to filter',
                type: 'text'
            },
            {
                name: 'name_suffix',
                display_name: 'Name column suffix',
                type: 'text',
                default_value: 'name'
            },
            {
                name: 'order',
                display_name: 'Order',
                type: 'number'
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new filterWidget(settings));
        }
    });
});