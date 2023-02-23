helios.widgets.push(function (freeboard) {
    var countersWidget = function (settings) {
        var self = this;

        var currentSettings = settings;

        var h = settings.h;
        var table = $('<table style="width: 99%; table-layout: fixed"></table>');
        var numbersRow = $('<tr class="counterWidget_numbers"></tr>').appendTo(table);
        var labelsRow = $('<tr class="counterWidget_labels"></tr>').appendTo(table);
        var categCol = settings.categories_col || 'operational_domain_name';
        var counterCol = settings.counter_col || 'capability_count';

        var useIndicators = settings.use_indicators;

        this.render = function (element) {
            $(element).empty();
            $(element).addClass('counterWidget');
            $(element).append(table);
        }

        this.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == 'ds') {
                var catCounts = newValue[1].reduce((coll, item) => {
                    if (!coll[item[categCol]]) coll[item[categCol]] = 0;
                    var amountVal = parseInt(item[counterCol]) == item[counterCol] ? parseInt(item[counterCol]) : 1;
                    coll[item[categCol]] += amountVal;
                    return coll;
                }, {});

                numbersRow.html('');
                labelsRow.html('');
                domains.forEach((cat) => {
                    var valLabel = useIndicators ? ' ' : catCounts[cat] || '0';
                    var nrCell = $('<td></td>')
                        .html(valLabel)
                        .appendTo(numbersRow);
                    $('<td></td>')
                        .html(cat.toUpperCase())
                        .appendTo(labelsRow);
                    if(useIndicators && catCounts[cat]) {
                        nrCell.css('background-color', 'lightgreen');
                    }
                });
            }
        }

        this.onDispose = function () {

        }

        this.getHeight = function () {
            return h;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "counter_widget",
        display_name: "Counter Widget",
        "external_scripts" : [''],
        settings: [
            {
                name: 'h',
                display_name: 'Height',
                type: 'text',
                default_value: 3
            },
            {
                name: "ds",
                display_name: "Datasource",
                type: "calculated"
            },
            {
                name: 'categories_col',
                display_name: 'Categories column name',
                type: 'text'
            },
            {
                name: 'counter_col',
                display_name: 'Counter column name',
                type: 'text'
            },
            {
                name: 'use_indicators',
                display_name: 'Use boolean indicators',
                type: 'boolean'
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new countersWidget(settings));
        }
    });
});