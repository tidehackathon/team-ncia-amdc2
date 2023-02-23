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

        var numberCol = settings.number_col;
        var totalCol = settings.total_col;

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
                var catCounts = (newValue[1] || []).reduce((coll, item) => {
                    var categ = item[categCol];
                    if (!coll[categ]) coll[categ] = 0;
                    
                    if(numberCol) {
                        coll[categ] = getScore2(item[numberCol], item[totalCol]);
                    } else {
                        var amountVal = parseInt(item[counterCol]) == item[counterCol] ? parseInt(item[counterCol]) : 1;
                        coll[categ] += amountVal;
                    }

                    return coll;
                }, {});

                var sum = 0;

                var categList = Object.keys(catCounts);
                if (domains.indexOf(categList[0]) >=0 || newValue[0][0].operational_domain_name) {
                    categList = domains;
                }

                if(!numberCol) {
                    categList.forEach((cat) => {
                        var nr = parseInt(catCounts[cat] || '0');
                        sum += nr;
                    });
                } else {
                    categList.forEach((cat) => {
                        if(!catCounts[cat])
                            catCounts[cat] = '0';

                    });
                }

                numbersRow.html('');
                labelsRow.html('');
                categList.forEach((cat) => {
                    var valLabel = useIndicators ? ' ' : getPercentage(parseInt(catCounts[cat] || '0'), sum) + '%';
                    if(numberCol && !useIndicators) {
                        valLabel = catCounts[cat];
                    }
                    var nrCell = $('<td></td>')
                        .html(valLabel)
                        .appendTo(numbersRow);
                    $('<td></td>')
                        .html(cat.toUpperCase())
                        .appendTo(labelsRow);
                    if(useIndicators) {
                        nrCell.append($('<div class="counterIndicator"></div>'));
                    }
                    if(useIndicators && catCounts[cat]) {
                        nrCell.find('div').css('background-color', '#A2C67C');
                    }
                });
            }
        }

        function getPercentage(nr, total) {
            if(!total) total = 0;
            return Math.round((nr / total) * 100)
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
            },
            {
                name: 'number_col',
                display_name: 'Number column',
                type: 'text'
            }, 
            {
                name: 'total_col',
                display_name: 'Total column',
                type: 'text'
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new countersWidget(settings));
        }
    });
});