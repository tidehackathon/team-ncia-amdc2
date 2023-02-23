helios.widgets.push(function addTableWidget(freeboard) {
    var textWidget = function (settings) {
        var self = this;

        var currentSettings = settings;

        var h = settings.h;

        var content = $('<div style="text-align: center;"></div>');

        this.render = function (element) {
            $(element).empty();
            $(element).removeClass('textWidget');
            $(element).addClass('textWidget');
            $(element).append(content);
        }

        this.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == 'value2') {
                content.html(newValue);
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
        type_name: "text_widget",
        display_name: "Text Widget",
        "external_scripts" : [''],
        settings: [
            {
                name: 'h',
                display_name: 'Height',
                type: 'text',
                default_value: 3
            },
            {
                name: "value2",
                display_name: "Value",
                type: "calculated"
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new textWidget(settings));
        }
    });
});