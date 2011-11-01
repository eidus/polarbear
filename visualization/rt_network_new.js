var w = 962,
    h = 500,
    jnodes,
    jlinks,
    node,
    link,
    force,
    fill = d3.scale.category20();

var nodeDict = {};

var hash_tag = "";
var multi_foci = false;

var vis = d3.select("#chart")
  .append("svg:svg")
    .attr("width", w)
    .attr("height", h);

$(document).ready(function() {
  d3.json("retweet_network.json", function(json) {
    jnodes = json.nodes;
    jlinks = json.links;

    // Setup quick node dictionary
    for(var i = 0; i < jnodes.length; i++)
      nodeDict[i] = new Array();

    force = d3.layout.force()
        .charge(-8)
        .linkDistance(15)
        .nodes(jnodes)
        .links(jlinks)
        .size([w, h])
        .start();

    link = vis.selectAll("line.link")
        .data(jlinks)
      .enter().append("svg:line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // Iterate over nodes and links to create dictionary
    for(var n = 0; n < jnodes.length; n++)
      for(var l = 0; l < jlinks.length; l++)
      {
        if(jnodes[n].index == jlinks[l].source.index)
          nodeDict[n].push(jlinks[l].target.index);
        else if(jnodes[n].index == jlinks[l].target.index)
          nodeDict[n].push(jlinks[l].source.index);
      }

    node = vis.selectAll("g.node")
        .data(jnodes)
      .enter().append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", 5)
        .style("fill", function(d) {if (d.group == "right") return "#d62728";
          else return "#1f77b4"; })
        .on('mouseover', function (d) {
          // Grey nodes that are not connected
          var index = d.index;
          var connNodes = nodeDict[index];
          node.style("fill", function(d) {
            if(connNodes.indexOf(d.index) == -1 && d.index != index)
              return "#7f7f7f"
            else
            {
              if (d.group == "right") return "#d62728";
              else return "#1f77b4";
            }
          })
        })
        .on('mouseout', function (d) {
          // Restore original color
          node.style("fill", function(d) {if (d.group == "right") return "#d62728";
            else return "#1f77b4"; })
          })
        .call(force.drag);

    // Set node color based on hash tags
    node.style("fill", function(d) {
      if(d.tags.length > 2)
        return "#7f7f7f";
    });

    force.on("tick", function(e) {
      var k = 6 * e.alpha;

      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      // Move nodes to left or right based on group
      if (multi_foci) {
        jnodes.forEach(function(o, i) {
          if (o.group == "right")
            o.x += k;
          else
            o.x += -k;
        });
      };
      
      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    });

  });

  // Toggle multiple foci
  $('input#foci').click(function () {
    if(multi_foci) multi_foci = false;
    else multi_foci = true;
  });

  // Set hash value
  $('input#hash').keyup(function(e) {
    hash_tag =$(this).val()
  });

});
