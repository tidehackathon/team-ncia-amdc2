helios.widgets.push(function (freeboard) {
    var bigCircleWidget = function (settings) {
        var self = this;

        var currentSettings = settings;
        //////////////////////////////////////////////////////

        var diameter = 960,
            radius = diameter / 2,
            innerRadius = radius - 120;

        var cluster = d3.cluster()
            .size([360, innerRadius]);

        var line = d3.radialLine()
            .curve(d3.curveBundle.beta(0.85))
            .radius(function (d) { return d.y; })
            .angle(function (d) { return d.x / 180 * Math.PI; });

        // Define the div for the interoperability tooltip
        var intertooltip = d3.select("#network").append("div")
            .attr("class", "intertooltip")
            .style("opacity", 0);

        // Define the div for the design tool tooltip
        var div = d3.select("#network").append("div")
            .attr("class", "designtoolinfo")
            .style("opacity", 0);

        // Color Pie *******************
        //var colors = d3.scaleOrdinal(d3.schemeCategory20);
        var colors = d3.scaleOrdinal()
            .range(["#704425", "#686765", "#004078", "#002243", "#692F69", "#1D2715", "#146C6B", "#003334", "#354C21", "#B8A85D", "#39545A"]);

        var piedata = [
            { value: 13, name: "Modeling", acronym: "Modeling" },
            { value: 13, name: "Graphic", acronym: "Graphic" },
            { value: 19, name: "Data Management", acronym: "Data Mgmt" },
            { value: 34, name: "Programming & Development", acronym: "Development" },
            { value: 12, name: "Visualization", acronym: "Visualization" },
            { value: 37, name: "Architecture Engineering Construction", acronym: "AEC" },
            { value: 19, name: "Mixed Reality", acronym: "Mixed Reality" },
            { value: 7, name: "Office", acronym: "Office" },
            { value: 12, name: "Game Engine", acronym: "Game Engine" },
            { value: 15, name: "Communication", acronym: "Communication" },
            { value: 7, name: "Material", acronym: "Material" }
        ];

        var linearScale = d3.scaleLinear()
            .domain([0, piedata.length])
            .range([0, 500]);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.value;
            });

        var arc = d3.svg.arc()
            .outerRadius(innerRadius);
        //.innerRadius(radius - 50)

        var myChart;//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Draw the arcs themselves
        var myChartCatNameArc;

        var dataL = 10;
        var offset = 45;

        /*
        var myLegend = d3.select('#legendbox')
            .selectAll('text')
            .data(piedata)
            .enter()
            .append('text')
            .attr("class", "legendtext")
            .attr('x', function (d, i) {
                return linearScale(i);
            })
            .attr('transform', function (d, i) {
                if (i === 0) {
                    dataL += d.acronym.length + offset
                    return 'translate(30,0)'
                } else {
                    //console.log(dataL)
                    //console.log(d)
                    var newdataL = dataL
                    dataL += d.acronym.length + offset
                    //console.log(dataL)
                    return 'translate(' + (newdataL) + ',0)'
                }
            })
            .text(function (d) {
                return d.acronym;
            })
            .style("text-anchor", "middle")
            .style('fill', function (d, i) {
                return colors(i);
            })


            .select('legendtext')
            .data(piedata)
            .enter().append("rect")
            .attr("class", "legendboxes")
            .attr("id", function (d, i) { return "legendbox" + i; }) //Unique id for each box
            .attr("width", function (d) { return d.acronym.length * 8 })
            .attr("height", 15)
            .attr('x', function (d, i) {
                return linearScale(i);
            })
            .attr("y", 5)
            .attr('transform', function (d, i) {
                var offset = 40;
                if (i === 0) {
                    dataL = 0
                    dataL += d.acronym.length + offset
                    return 'translate(0,0)'
                } else {
                    console.log(dataL)
                    console.log(d.acronym.length)
                    newdataL = dataL;
                    dataL += d.acronym.length + offset
                    console.log(dataL)
                    console.log(newdataL)
                    return 'translate(' + (newdataL) + ',0)'
                }
            })
            .style('fill', function (d, i) {
                return colors(i);
            });
*/
        // ******************************
        // SVG


        var tooltip = d3.select("body")
            .append("div")
            .attr("data-toggle", "tooltip")
            .attr("class", "tooltipdatain")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .text("a simple tooltip");





        var infoboxShape = d3.select('#infobox')
            .selectAll('text')
            .enter()
            .append('text')
            .text(function (d) {
                return d.data.name;
            });

        function mouseovered(d) {
            node.each(function (n) {
                n.target = n.source = false;
            });

            link
                .classed("link--target", function (l) {
                    if (l.target === d) return l.source.source = true;
                })
                .classed("link--source", function (l) {
                    if (l.source === d) return l.target.target = true;
                })
                .classed("link--mutual", function (l) {
                    // if (l.source === d || l.target === d) return l.source.source = l.target.target = true;
                    if (l.source === l.target && l.source === d || l.target === d) return true;
                })
                .filter(function (l) {
                    return l.target === d || l.source === d;
                })
                .raise();

            node
                .classed("node--target", function (n) {
                    return n.target;
                })
                .classed("node--source", function (n) {
                    return n.source;

                })
                .classed("node--base", function (n) {
                    //        if (n.source === n.target && d !== n.target && d !== n.source) return true;
                    if (d.data.name === n.data.name) return true;
                    // console.log(d.data.name)
                    // console.log(n.data.name)
                    // console.log(n.target)
                    // console.log(n.target)
                });


            /*.classed("node--mutual", function (n) {
                if (n.source !== n.target) return true;
            })*/
            /*.classed("node--base", function (n) {
                // if (n.source === n.target && n.target !== d && n.source !== d) return n.target;
                if (n.source !== n.target && n.target !== d && n.source !== d) return true;
            })*/


        }

        function mouseouted(d) {
            link
                .classed("link--target", false)
                .classed("link--source", false)
                .classed("link--mutual", false)

                ;

            node
                .classed("node--target", false)
                .classed("node--source", false)
                .classed("node--mutual", false)
                .classed("node--base", false)

                ;
        }

        // Lazily construct the package hierarchy from class names.
        function packageHierarchy(classes) {
            var map = {};

            function find(name, data) {
                var node = map[name], i;
                if (!node) {
                    node = map[name] = data || { name: name, children: [] };
                    if (name.length) {
                        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                        node.parent.children.push(node);
                        node.key = name.substring(i + 1);
                    }
                }
                return node;
            }

            classes.forEach(function (d) {
                find(d.name, d);
            });

            return d3.hierarchy(map[""]);
        }

        // Return a list of imports for the given array of nodes.
        function packageImports(nodes) {
            var map = {},
                imports = [];

            // Compute a map from name to node.
            nodes.forEach(function (d) {
                map[d.data.name] = d;
            });

            // For each import, construct a link from the source to target node.
            nodes.forEach(function (d) {
                if (d.data.imports) d.data.imports.forEach(function (i) {
                    imports.push(map[d.data.name].path(map[i]));
                });
            });

            return imports;
        }

        //    $(function () {
        //        $('[data-toggle="tooltip"]').tooltip()
        //    });


        /////////////////////////////////////////////////////
        var container = $('<div id="network"><div>');

        this.render = function (element) {
            $(element).empty();
            $(element).append(container);

            myChart = d3.select('#network')
                .append('svg')
                .attr("id", "piechart")
                .attr('width', 960)
                .attr('height', 960)

                .append('g')
                .attr('transform', 'translate(' + (960 / 2) + ', ' + (960 / 2) + ')')
                .selectAll('path').data(pie(piedata))
                .enter()
                .append('path')
                .attr('fill', function (d, i) {
                    return colors(i);
                })
                .attr('d', arc);


            /////////////////////////// now nodes & links
            var svg = d3.select("#network svg")
                .append("g")
                .attr("transform", "translate(" + radius + "," + radius + ")");

            var link = svg.append("g").selectAll(".link"),
                node = svg.append("g").selectAll(".node");

            // JSON data
            d3.json("flare.json", function (error, classes) {
                if (error) throw error;

                var root = packageHierarchy(classes)
                    .sum(function (d) { return d.size; });

                cluster(root);

                link = link
                    .data(packageImports(root.leaves()))
                    .enter().append("path")
                    .each(function (d) { d.source = d[0], d.target = d[d.length - 1]; })
                    .attr("class", "link")
                    .attr("d", line)
                    .on("click", function (d) {
                        intertooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        //.data(root)
                        //.append("text")

                        intertooltip.html(function () {
                            return "<div class='designtitle titlebox'>Data Interoperability </div></br><span data-toggle='tooltip' title='TBD' class='datain'><span class='designtitlesource'>" + d.target.data.key + "</span> <span><i class=\"fas fa-angle-double-right\"></i></span> <span class='designtitletarget'>" + d.source.data.key + "</span>: TBD </span></br><span data-toggle='tooltip' title='TBD' class='dataout'><span class='designtitletarget'>" + d.source.data.key + "</span> <span><i class=\"fas fa-angle-double-right\"></i></span> <span class='designtitlesource'>" + d.target.data.key + "</span>: TBD</span>";
                        })
                        console.log(d.source.data.key);
                    });

                node = node
                    .data(root.leaves())
                    .enter().append("text")
                    .attr("class", "node")
                    .attr("dy", "0.31em")
                    .attr("transform", function (d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
                    .attr("text-anchor", function (d) { return d.x < 180 ? "start" : "end"; })
                    .text(function (d) { return d.data.key; })
                    //.on("click", mouseovered)


                    // Tooltip for nodes
                    //*******************************************************
                    .on("click", function (d) {
                        mouseovered(d);
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);

                        div.html(function () {
                            return "<div class='designtitle titlebox'><span class='designtitlename'>" + (d.data.key) + "</span></div></br><span >Developer: </span>" + (d.data.developer) + "</br><a href=\" " + (d.data.link) + "\" target=\"_blank\">Resource Web Link</a></br><span class='filetype' data-toggle='tooltip' title='" + (d.data.fileTypesIncoming) + "'>Incoming File Types:</span> " + (d.data.fileTypesIncoming) + "</br><span class='filetype' data-toggle='tooltip' title='" + (d.data.fileTypesOutgoing) + "'>Outgoing File Types:</span> " + (d.data.fileTypesOutgoing)
                                // return "<p><span class='designtitle'>Design Tool:</span> " + (d.data.key) + "</p><p><span class='designtitle'>Developer: </span>" + (d.data.developer) + "</br>Resource: <a href=\" " + (d.data.link) + "\" target=\"_blank\">Weblink</a></p><p>Incoming File Types: " + (d.data.fileTypesIncoming) + "</p><p>Outgoing File Types: " + (d.data.fileTypesOutgoing) + "</p>"
                                ;
                            //console.log(node);
                        });
                    })


                d3.select(".datain")
                    .on("mouseover", function () { return tooltip.style("visibility", "visible"); })
                    .on("mousemove", function () { return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"); })
                    .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });

            });

            myChartCatNameArc = d3.select('#network svg')
                .append('g')
                .attr('transform', 'translate(' + (960 / 2) + ', ' + (960 / 2) + ')')
                .selectAll(".catArc")
                .data(pie(piedata))
                .enter().append("path")
                .attr("class", "catArc")
                .attr("id", function (d, i) { return "catArc" + i; }) //Unique id for each slice
                .attr("d", arc)
                .style("fill", "transparent")
                .select(".catArc")
                .data(pie(piedata))
                .enter().append("text")
                .attr("class", "catText")
                .attr("x", 10) //Move the text from the start angle of the arc
                .attr("dy", 20) //Move the text down
                .append("textPath")
                .attr("class", "catTextStyle")
                //.attr("startOffset","50%")
                .style("text-anchor", "start")
                .attr("href", function (d, i) { return "#catArc" + i; })
                .text(function (d) { return d.data.name + " >"; });
        }

        this.onSettingsChanged = function (newSettings) {
            currentSettings = newSettings;
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == 'value') {

            }
        }

        this.onDispose = function () {

        }

        this.getHeight = function () {
            return 20;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "big_circle_widget",
        display_name: "Big Circle",
        "external_scripts": [''],
        settings: [
            {
                name: "value",
                display_name: "Value",
                type: "calculated"
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new bigCircleWidget(settings));
        }
    });
});