helios.widgets.push(function (freeboard) {
    var networkWidget = function (settings) {
        var self = this;

        var currentSettings = settings;

        var height = settings.height;

        var w = 500;
        var h = 400;

        var nodes = [];
        var links = [];
        var svg;
        var sim;
        var link;
        var node;

        this.render = function (element) {
            $(element).empty();
            w = element.clientWidth * 5;
            console.debug('width: ' + w);
            svg = d3.select(element).append('svg')
                .attr('width', w)
                .attr('height', h);
            //.attr("viewBox", [-width / 2, -height / 2, width, height])
            //.attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        }

        function ticked() {
            link
                .attr("x1", d => {
                    return Math.max(d.source.x, 0);
                })
                .attr("y1", d => Math.max(d.source.y, 0))
                .attr("x2", d => Math.max(d.target.x, 0))
                .attr("y2", d => Math.max(d.target.y, 0));

            node
                .attr("cx", d => Math.max(d.x, 0))
                .attr("cy", d => Math.max(d.y, 0));
        }

        this.onSettingsChanged = function (newSettings) {
            currentSettings = newSettings;
        }

        var rawNodes;
        var rawLinks;

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == 'nodes') {
                rawNodes = newValue[1];
            } else if (settingName == 'links') {
                rawLinks = newValue[1];
            }

            if (rawNodes && rawLinks) {
                rawNodes.filter((n) => {
                    return rawLinks.filter((l) => {
                        return n[0] == l[0][0] || n[0] == l[1][0];
                    }).length > 0;
                }).forEach((n) => {
                    nodes.push(
                        {
                            id: 'nid' + n[0],
                            name: n[1]
                        }
                    );
                });

                rawLinks.forEach((l) => {
                    links.push({
                        id: l[0][0] + '5' + l[1][0],
                        source: 'nid' + l[0][0],
                        target: 'nid' + l[1][0]
                    })
                });

                link = svg.selectAll('.netlink')
                    .data(links)
                    .enter().append('line')
                    .attr('stroke', 'black')
                    .attr('stroke-width', '2')
                    .attr('class', 'netlink');

                node = svg.selectAll('.netnode')
                    .data(nodes)
                    .enter().append('circle')
                    .attr('r', 15)
                    .attr('stroke', 'white')
                    .attr('fill', 'lightblue')
                    .attr('class', 'netnode');

                var forceNode = d3.forceManyBody().strength(0.9);
                var forceLink = d3.forceLink(links).id((d) => d.id);
                forceLink.distance(200);

                sim = d3.forceSimulation(nodes)
                    .force('link', forceLink)
                    .force('collide', d3.forceCollide().radius(50))
                    .force('charge', forceNode)
                    .force('center', d3.forceCenter(w/2, h/2))
                    .on('tick', ticked);

                sim.alphaDecay(0.02);
                
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
        type_name: "network_widget",
        display_name: "Network Widget",
        "external_scripts": [''],
        settings: [
            {
                name: 'height',
                display_name: 'Height',
                type: 'number',
                default_value: 8
            },
            {
                name: "nodes",
                display_name: "Datasource for Nodes",
                type: "calculated"
            },
            {
                name: "links",
                display_name: "Datasource for Links",
                type: "calculated"
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new networkWidget(settings));
        }
    });
});