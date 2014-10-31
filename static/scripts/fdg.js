//http://bl.ocks.org/couchand/6420534

var width = 1250,
    height = 650;

function name(d) { return d.name; }
function group(d) { return d.group; }
function colorByGroup(d) { return color(group(d)); }

var color = d3.scale.category10();
var node, link;

var svg = d3.select('#viz')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

var voronoi = d3.geom.voronoi()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .clipExtent([[-10, -10], [width+10, height+10]]);

function recenterVoronoi(nodes) {
    var shapes = [];
    voronoi(nodes).forEach(function(d) {
        if ( !d.length ) return;
        var n = [];
        d.forEach(function(c){
            n.push([ c[0] - d.point.x, c[1] - d.point.y ]);
        });
        n.point = d.point;
        shapes.push(n);
    });
    return shapes;
}

var force = d3.layout.force()
    .charge(-2000)
    .chargeDistance(500)
    .friction(.6)
    .linkDistance(function(d) { return d.value; })
    .size([width, height]);

force.on('tick', function() {

    node.attr('transform', function(d) { return 'translate('+d.x+','+d.y+')'; })
        .attr('clip-path', function(d) { return 'url(#clip-'+d.index+')'; })
        .attr('cx', function(d) { return 500;});

    link.attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

    var clip = svg.selectAll('.clip')
        .data( recenterVoronoi(node.data()), function(d) { return d.point.index; } );

    clip.enter().append('clipPath')
        .attr('id', function(d) { return 'clip-'+d.point.index; })
        .attr('class', 'clip');
    clip.exit().remove()

    clip.selectAll('path').remove();
    clip.append('path')
        .attr('d', function(d) { return 'M'+d.join(',')+'Z'; });
});

d3.json('data.json', function(err, data) {

    data.nodes.forEach(function(d, i) {
        d.id = i;
        if (!d.id) { 
          d.x = width/2; 
          d.y = height/2; 
          d.fixed = true; }
    });

    link = svg.selectAll('.link')
        .data( data.links )
      .enter().append('line')
        .attr('class', 'link')
        .style("stroke-width", 3);

    node = svg.selectAll('.node')
        .data( data.nodes )
      .enter().append('g')
        .attr('title', name)
        .attr('class', 'node')
        .call( force.drag );

    node.append('circle')
        .attr('r', 30)
        .attr('fill', colorByGroup)
        .attr('fill-opacity', 0.5);

    node.append('circle')
        .attr('r', 4)
        .attr('stroke', 'black');

    force
        .nodes( data.nodes )
        .links( data.links )
        .start();
});

// var zoomListener = d3.behavior.zoom().on("zoom", zoom);
// function zoom() {
//     force.alpha([-1]);
//     for ( y = 0; y < node[0].length; y++ ) {
//         node[y].x++;
//         node[y].y++;
//         node[y].px++;
//         node[y].py++;
//         }
//     //$(force).trigger('tick');
// }
svg.call(zoomListener)