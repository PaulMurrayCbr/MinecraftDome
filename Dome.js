console.log("Dome.js start");




$(function() {
  console.log("initialization");
  
});

function ctl(e) {
  while(e) {
    if(e.controller) return e.controller;
    e = e.parentNode;
  }
  return null;
}

function addLayer() {
  var layer = $(".layer.template").clone(true, true);
  layer.removeClass("template");
  layer = layer[0];
  layer.controller = new Layer(layer);
  
  $("#layers").prepend(layer);
}

var layeridx = 1;

function Layer(element) {
  this.idx = layeridx++;
  this.element = element;
  this.hidden = false;
  this.enabled = true;
  
  this.height = 20;
  this.width = 20;
  this.x = 0;
  this.y = 0;
  
  this.blocks = {}; // a 2d ragged map. blocks[4][5] will be true when there is a block at y=4,x=5
  
  this.anchor = [ {x:5, y:5, z:0},
                   {x:5, y:15, z:0},
                   {x:15, y:10, z:0}
                  ];
}

Layer.prototype.b = function(x,y,v) {
  if(!this.blocks[y] && !v) return;
  if(!this.blocks[y]) this.blocks[y] = {};
  
  if(v != undefined) 
    blocks[y][x] = v;
  return !!blocks[y][x];
  
}

Layer.prototype.btoggle = function(x,y,v) {
  if(!this.blocks[y]) this.blocks[y] = {};
    blocks[y][x] = !blocks[y][x];
  return !!blocks[y][x];
}

Layer.prototype.minX = function() {
  return 0;
}

Layer.prototype.maxX = function() {
  return 0;
}

Layer.prototype.minY = function() {
  return 0;
  
}

Layer.prototype.maxY = function() {
  return 0;
}

Layer.prototype.hideshow = function(a,b,c,d,e) {
  console.log(a);
  console.log(b);
  console.log(c);
  console.log(d);
  this.hidden = !this.hidden;
  $(this.element).find(".content").css("display", this.hidden ? "none" : "block");
  $(this.element).find(".hideshow > span").html(this.hidden ? "Closed" : "Open");
}

Layer.prototype.enabledisable = function() {
  this.enabled = !this.enabled;
  $(this.element).find(".enabledisable > span").html(this.enabled ? "Enabled" : "Disabled");
}

Layer.prototype.delete = function() {
  if(confirm("Are you sure?")) {
    $(this.element).remove();
  }
}

function test(t) {
  console.log("test");
  console.log(ctl(t).idx);
}

console.log("Dome.js ok");
