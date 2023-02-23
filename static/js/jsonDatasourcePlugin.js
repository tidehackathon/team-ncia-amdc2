helios.widgets.push(function loadJsonDataSourcePlugin(freeboard) {
    var jsonDatasource = function (settings, updateCallback) {
		var self = this;
		var currentSettings = settings;
		var data;
		var thisName = settings.selfName;

		helios.registerDataSource(this, settings.selfName);

		this.filterUpdate = function() {
			updateCallback([data, filterData(data)]);
		}

		function filterData(data) {
			//if(!helios.filters[thisName]) return data; forget this contition for now, datasource might have a different name
			if(!data.length) return data;
			var fData = [...data];
			if(helios.filters[thisName]) {
				fData = data.filter((d) => {
						return helios.filters[thisName].indexOf(d.id+'') >= 0;
					});
			}
			if(!fData.length) return [];
			var filters = Object.keys(helios.filters).filter((f) => {
				return fData[0][f + '_id'] != null;
			});
			if(!filters.length) return fData;
			return fData.filter((d) => {
				var filterRes = filters.reduce((cond, f) => {
					if(helios.filters[f] && helios.filters[f].length > 0) {
						return helios.filters[f].indexOf(d[f + '_id'] + '') >= 0 && cond;
					} else {
						return true && cond;
					}
				}, true);
				return filterRes;
			});
		}

		this.updateNow = function () {
			//console.debug('getting data from' + currentSettings.url);
			$.get(currentSettings.url, function(res) {
				data = res;
				updateCallback([res, filterData(res)]);
			});
		}

		this.onDispose = function () {
		}

		this.onSettingsChanged = function (newSettings) {
			currentSettings = newSettings;
			self.updateNow();
		}
	};

	freeboard.loadDatasourcePlugin({
		type_name: "Backend JSON",
		display_name: "Backend JSON",
		settings: [
			{
				name: "title",
				display_name: "Title",
				type: "text"
			},				
			{
				name: "url",
				display_name: "URL",
				type: "text"
			}
		],
		newInstance: function (settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new jsonDatasource(settings, updateCallback));
		}
	});
});