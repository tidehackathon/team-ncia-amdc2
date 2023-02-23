helios.widgets.push(function addTableWidget(freeboard) {
    var change_me_pls = function (settings) {
        var self = this;

        var currentSettings = settings;


        this.render = function (element) {
            $(element).empty();

        }

        this.onSettingsChanged = function(newSettings) {
            currentSettings = newSettings;
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == 'value') {

            }
        }

        this.onDispose = function () {

        }

        this.getHeight = function () {
            return 8;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "",
        display_name: "",
        "external_scripts" : [''],
        settings: [
            {
                name: "title",
                display_name: "Title",
                type: "text"
            },
            {
                name: "value",
                display_name: "Value",
                type: "calculated"
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new change_me_pls(settings));
        }
    });
});