var graph = null,
    link,
    edgepaths,
    edgelabels,
    node,
    circle;

var calcDistance = false
    dist;

var bfs_slider = document.getElementById("bfs-slider");

var bfs_slider_value = bfs_slider.value;

bfs_slider.oninput = function () {
    bfs_slider_value = bfs_slider.value;
}

var border = 5,
    bordercolor = "black";

var vis = d3.select("#bfs-canvas")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("border", border);

var big_box = vis.append("g");

// Border for the Graph
var borderPath = vis.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", "100%")
    .attr("width", "100%")
    .style("stroke", bordercolor)
    .style("fill", "none")
    .style("stroke-width", border);

// Grab the Width and Height
var width = vis.node().getBBox().width,
    height = vis.node().getBBox().height;

big_box.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(d3.zoom()
        .scaleExtent([1 / 4, 8])
        .on("zoom", zoomed));

function zoomed() {
    big_box.attr("transform", d3.event.transform);
}

// Add the Marker for Arrows
vis.append('defs').append('marker')
    .attrs({'id':'arrowhead',
        'viewBox':'-0 -5 10 10',
        'refX': 12,
        'refY':0,
        'orient':'auto',
        'markerWidth': 6,
        'markerHeight': 10,
        'xoverflow':'visible'})
    .append('svg:path')
    .attr('d', 'M 0, -5 L 10 , 0 L 0, 5')
    .attr('fill', '#999')
    .style('stroke','none');

// Simulation Section
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(100))
    .force("charge", d3.forceManyBody().strength(-1000))
    .force("center", d3.forceCenter( width / 2, height / 2))
    .force("forceX", d3.forceX().strength(0.03).x(width / 2))
    .force("forceY", d3.forceY().strength(0.03).y(height / 2));

// Grab the Data
function genGraph() {
    // Create the Edges
    link = big_box.selectAll(".link")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        )
        .attr('marker-end','url(#arrowhead)')

    // Titles for the Edges (hover-over)
    link.append("title")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        )
        .text(function (d) {return d.source + ", " + d.target;});

    // Paths for the Edges to Take
    edgepaths = big_box.selectAll(".edgepath")
        .data(graph.links)
        .enter()
        .append('path')
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        )
        .attrs({
            'class': 'edgepath',
            'fill-opacity': 0,
            'stroke-opacity': 0,
            'id': function (d, i) {return 'edgepath' + i}
        })
        .style("pointer-events", "none");

    // Text Labels for Edges
    edgelabels = big_box.selectAll(".edgelabel")
        .data(graph.links)
        .enter()
        .append('text')
        .style("pointer-events", "none")
        .attr("dy", 10)
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        )
        .attrs({
            'class': 'edgelabel',
            'id': function (d, i) {return 'edgelabel' + i},
            'font-size': 14,
            'fill': '#aaa'
        });

    // Actual Text Labels for Edges
    edgelabels.append('textPath')
        .attr('xlink:href', function (d, i) {return '#edgepath' + i})
        .style("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("startOffset", "50%")
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        )
        .text(function (d) { return d.weight; });

    // Nodes with Draggability
    node = big_box.selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        )
        .on("click", nodeSelected);

    // Add the Circles to Nodes and Fill Them
    circle = node.append("circle")
        .attr("id", function (d) { return "circle" + d.id; })
        .attr("r", 5)
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        )
        .style("fill", circleColor)
        .style("stroke", circleColor);

    // Add a Hover-over Title to Nodes
    // TODO: modify to allow for changing to distance based on id
    node.append("title")
        .text(function (d) {return d.id;})
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        );

    // Node Text Label
    node.append("text")
        .attr("dy", -8)
        .attr("dx", -6)
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        )
        .text(function (d) { return d.id; });
        
    // Simulation Section
    simulation
        .nodes(graph.nodes)
        .on("tick", ticked)
    
    simulation.force("link")
        .links(graph.links)
    
    function ticked() {
        link
            .attr("x1", function (d) {return d.source.x;})
            .attr("y1", function (d) {return d.source.y;})
            .attr("x2", function (d) {return d.target.x;})
            .attr("y2", function (d) {return d.target.y;});

        node
            .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});

        circle.style("fill", circleColor)
            .style("stroke", circleColor);

        edgepaths.attr("d", edgeArc);

        // Ensure Labels are on the Correct Side of the Edge
        edgelabels.attr('transform', function (d) {
            if (d.target.x < d.source.x) {
                var bbox = this.getBBox();

                rx = bbox.x + bbox.width / 2;
                ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            }
            else {
                return 'rotate(0)';
            }
        });
    }
    
    function nodeSelected (d) {
        d.selected = !d.selected;
    
        for (i in graph.nodes) {
            if (i != d.id) {
                graph.nodes[i].selected = false;
            }
        }
    
        bfs([ d.id ], []);
    }
    
    function bfs (queue, visited) {
        if (queue.length != 0) {
            var curr = queue.shift()

            graph.nodes[curr].selected = true;
            console.log(graph);
            d3.select("#circle" + graph.nodes[curr].id).style("fill", "blue");
            d3.select("#circle" + graph.nodes[curr].id).style("stroke", "blue");

            if (!visited.includes(curr)) {
                visited.push(curr);

                for (i in graph.nodes[curr].children) {
                    if (!visited.includes(graph.nodes[curr].children[i])) {
                        queue.push(graph.nodes[curr].children[i]);
                    }
                }
            }

            setTimeout( function () {
                return bfs(queue, visited)
            }, 1000 * (1 / bfs_slider_value));
        } else {
            d3.select("#bfs_text").text("Nodes Visited: " + visited);
            console.log(visited);
            return visited
        }
    }

    simulation.tick();
}

function circleColor (d) {
    if (d.selected) {
        return "blue"
    } else {
        return "black" 
    }
}

function edgeArc (d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function getGraph(s) {
    clear_graph();

    d3.json("json/" + s + "_graph", function (error, g) {
        if (error) throw error;
        
        graph = g;

        genGraph();
    });

    simulation.restart();
    simulation.tick();
}


function clear_graph() {
    graph = null;
    link.remove();
    edgepaths.remove();
    edgelabels.remove();
    node.remove();
    circle.remove();
    simulation.restart();
}

function addBFSDistance () {
    console.log("Distance added");
}

d3.json("json/random_graph", function (error, g) {
    if (error) throw error;
    
    graph = g;
    genGraph();
    simulation.tick();
});
