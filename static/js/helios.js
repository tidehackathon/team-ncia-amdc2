/**
 * The super global object for the app.
 * Holds widgets and filters.
 */
var helios = {
    widgets: [],
    filters: {},
    admin: true,
    dataSources: {},
    addFilter: function(name, value) {
        value = value+'';
        if(!this.filters[name]) {
            this.filters[name] = [];
        }
        this.filters[name].push(value);
        this.updateFilterURLParams();
        this.notifyDataSources();
        //if(this.dataSources[name]) this.dataSources[name].filterUpdate();
    },
    setSingleFilter: function(name, value) {
        value = value+'';
        this.filters[name] = [value];
        this.updateFilterURLParams();
        this.notifyDataSources();
    },
    clearFilter: function(name) {
        if(!this.filters[name]) return;
        this.filters[name] = null;
        delete this.filters[name];
    },
    removeFilter: function(name, value) {
        if(!this.filters[name]) return;
        value = value+'';
        this.filters[name] = this.filters[name].filter((f) => {return value != f;});
        if(this.filters[name].length == 0) delete this.filters[name];
        this.updateFilterURLParams();
        this.notifyDataSources();
        //if(this.dataSources[name]) this.dataSources[name].filterUpdate();
    },
    notifyDataSources: function() {
        Object.keys(this.dataSources).forEach((dsn) => {
            this.dataSources[dsn].filterUpdate();
        });
    },
    getFilterFromURLParams: function() {
        this.filters = paramsToObject(window.location.href);
    },
    updateFilterURLParams: function() {
        var self = this;
        var newUrl = window.location.origin;
        newUrl += '/' + window.location.hash.split('?')[0];
        var flatFilters = {};
        Object.keys(this.filters).forEach((k) => {
            if(self.filters[k].length == 0) return;
            flatFilters[k] = JSON.stringify(self.filters[k]);
        });
        if(Object.keys(this.filters).length > 0) {
            newUrl += '?' + new URLSearchParams(flatFilters).toString();
        }
        window.history.pushState({}, null, newUrl);
    },
    registerDataSource: function(ds, id) {
        this.dataSources[id] = ds;
    }
};


function paramsToObject(url) {
    var res = {};
    var params = decodeURIComponent(url.split('?')[1]);
    if ((params || '').indexOf('=') < 0) return {};
    params.split('&').forEach((p) => {
        var tok = p.split('=');
        res[tok[0]] = JSON.parse(tok[1]);
    });
    return res;
}