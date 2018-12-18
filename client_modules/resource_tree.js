/* Edit gw 171128 */

var graph = document.getElementById("div_log");
var tree, svg, rsc, root;
var socket;
var idx = 1;

var el = $("#div_log");
var margin = {top: 20, right: 30, bottom: 20, left: 50},
    width = el.width() - margin.right - margin.left,
    height = el.height() - margin.top - margin.bottom;

var i = 0,
    duration = 600;
    

tree = d3.layout.tree()
    .nodeSize([50, 40])
    .separation(function separation(a, b) {
        return a.parent == b.parent ? 1 : 1.2;
    });

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var srcPositionY = height/2 + margin.top;

svg = d3.select(graph).append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .call(zm = d3.behavior.zoom().scaleExtent([0.1,10]).on("zoom", reDraw)).append("g")
    .attr("transform", "translate(" + margin.left + "," + srcPositionY + ")");

zm.translate([margin.left, srcPositionY]);

rsc = {
 "name": "Mobius",
 "ty": "cse",
 "children": [
   {
     "name": "kwu-hub",
     "ty" : "ae",
     "children": [
     ]
   }
  ]
}

root = rsc;
root.x0 = height / 2;
root.y0 = 0;

function reDraw() {
  //console.log("here", d3.event.translate, d3.event.scale);
  svg.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}

function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

// root.children.forEach(collapse);
update(root);

d3.select(self.frameElement).style("height", height);

function delNode(){
  var arg = arguments;
  var nodes = tree.nodes(root).reverse(),
  links = tree.links(nodes);

  switch(arg.length){
    case 2:
      nodes.forEach(function(n,i){
        if(n.name == arg[1]){
          n.parent.children.forEach(function(idx, jdx){
            if(idx.name == n.name)
              n.parent.children.splice(jdx,1);
          });
          update(root);
        }
      });
      break;
    case 3:
      nodes.forEach(function(n,i){
        if(n.name == arg[2] && n.parent.name == arg[1] && n.parent.parent.name == arg[0]){
          n.parent.children.forEach(function(idx, jdx){
            if(idx.name == n.name)
              n.parent.children.splice(jdx,1);
          });
          update(root);
        }
      });
      break;
  }
  
}
function addNode() {
  var arg = arguments;
  var nodes = tree.nodes(root).reverse(),
  links = tree.links(nodes);

  switch(arg.length){
    case 2: // parent, newNode
      nodes.forEach(function(n,i){
        if(n.name == arg[0]){
          var newNode = {
              name : arg[1],
              parent : n
          };
          if(n.children) n.children.push(newNode); else n.children = [newNode];
          nodes.push(newNode);
          update(root);
        }
      });
      break;
    case 4: // grandparnet, parent, newNode
      nodes.forEach(function(n,i){
        if(n.name == arg[1] && n.parent.name == arg[0]){
          if(arg[3] === 'CIN'){
            var newNode = {
                name : 'Content',
                ty : 'cin',
                value : arg[2],
                parent : n
            };  
          }
          else{
            var newNode = {
              name : arg[2],
              ty : 'cnt',
              parent : n
          };
          }
          
          if(n.children) n.children.push(newNode); else n.children = [newNode];
          nodes.push(newNode);
          update(root);
        }
      });
      break;
  }

}

var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

function update(source) {
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * 230;
  });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click)
      .on("mouseover", function(d) {
          if(d.ty == 'cin'){
            div.transition()
              .duration(200)
              .style("opacity", .9);
            div .html(
                "<span style =\"color : black\">Content: " + d.value+"</span>"
              )
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY) + "px");
          }
      })    
      .on("mouseout", function() {
          div.transition()
            .duration(200)
            .style("opacity", 0);
      })

  nodeEnter.append("circle")
      .attr("r", 1e-6)

  nodeEnter.append("text")
      .attr("dy", "1.8em")
      .attr("text-anchor", function(d) { return "middle"; })
      .text(function(d) { 
        if(d.ty == 'cin'){
          var tmp;
          if(d.value.length > 12){
            tmp = '[' + d.value.substring(0,12) + '...]';
            return tmp;
          }
          return '[' + d.value +']';
        }
        else{
          if(d.name == 'target_temperature')
            return 'TargetTemp';
          else if(d.name == 'current_temperature')
            return 'CurrentTemp';
          else if(d.name == 'target_temperature_type')
            return 'TargetTempType';
          else
            return d.name; 
        }
      })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 12)
      .style("stroke-width", function(d) { return d._children ? "3px" : "1px"; })
      .style("fill", function(d) {
        switch(d.ty){
          case 'cse':
            return "#E9ED5F";
          case 'ae':
            return "#BAC2EA";
          case 'cnt':
            return "#F3CFD8";
          case 'cin':
            return "#ACEBB3";
        }
      });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  console.log(d)
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}