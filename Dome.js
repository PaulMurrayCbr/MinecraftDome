console.log("Dome.js start");




$(function() {
  console.log("initialization");
  $("body")[0].controller = new App($("body")[0]);
  
  $("body")[0].controller.init();
});

function ctl(e) {
  while(e) {
    if(e.controller) return e.controller;
    e = e.parentNode;
  }
  return null;
}

function Point(x,y) {
  this.x = x;
  this.y = y;
}

// a set of point objects, used for map keys and set membership
var uniquePoint = [];

function up(x,y) {
  if(!uniquePoint[x]) {
    uniquePoint[x] = [];
  }
  if(!uniquePoint[x][y]) {
    uniquePoint[x][y] = new Point(x,y);
  }
  return uniquePoint[x][y];
}

function App(element) {
  this.element = element;
  this.maskHidden = false;
}

App.prototype.init = function() {
  this.canvas = $(this.element).find(".surface-mask .mask-display canvas")[0];
  $(this.canvas).resizable();
  
  $(this.canvas).mouseover($.proxy(canvasMouseover, this));
  $(this.canvas).mouseover($.proxy(canvasMouseout, this));
  $(this.canvas).mousemove($.proxy(canvasMousemove, this));
  $(this.canvas).mousedown($.proxy(canvasMousedown, this));
  $(this.canvas).mouseup($.proxy(canvasMouseup, this));
 
  this.isMouseDown = false;
  this.isMouseSetting = false;
  
  
}

App.prototype.addLayer = function() {
  var layer = $(this.element).find(".layer.template").clone(true, true);
  layer.removeClass("template");
  layer = layer[0];
  layer.controller = new Layer(layer);
  
  $(this.element).find("#layers").prepend(layer);
  
  layer.controller.init();
}

App.prototype.hideShowMask = function() {
  this.maskHidden = !this.maskHidden;
  $(this.element).find(".surface-mask .content").css("display", this.maskHidden ? "none" : "block");
  $(this.element).find(".surface-mask .hideshow > span").html(this.maskHidden ? "Closed" : "Open");
}

App.prototype.maskMouseover = function(event) {
}

App.prototype.maskMouseout = function(event) {
}

App.prototype.maskMousemove = function(event) {
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
  
  this.blocks = new Set();
  
  this.anchor = [ {x:5, y:5, z:0},
                   {x:5, y:15, z:0},
                   {x:15, y:10, z:0}
                  ];
  
  
}

Layer.prototype.init = function() {
  this.canvas = $(this.element).find(".layer-display canvas")[0];
  $(this.canvas).resizable();
  
  $(this.canvas).mouseover($.proxy(canvasMouseover, this));
  $(this.canvas).mouseover($.proxy(canvasMouseout, this));
  $(this.canvas).mousemove($.proxy(canvasMousemove, this));
  $(this.canvas).mousedown($.proxy(canvasMousedown, this));
  $(this.canvas).mouseup($.proxy(canvasMouseup, this));
 
  this.isMouseDown = false;
  this.isMouseSetting = false;
  
}

Layer.prototype.b = function(x,y,v) {
  var p = up(x,y);
  if(v != undefined) {
    if(v) {
      this.blocks.add(p);
    }
    else {
      this.blocks.delete(p);
    }
  }

  return this.blocks.has(p);
}

Layer.prototype.btoggle = function(x,y,v) {
  if(!this.blocks[y]) this.blocks[y] = {};
    blocks[y][x] = !blocks[y][x];
  return !!blocks[y][x];
}



Layer.prototype.hideshow = function() {
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


function canvasMouseover(event) {
}

function canvasMouseout (event) {
  canvasMouseup(event);
}

function canvasMousedown(event) {
  $(this.canvas).css("cursor", "pointer");
  this.isMouseDown = true;
}

function canvasMouseup(event) {
  $(this.canvas).css("cursor", "crosshair");
  this.isMouseDown = false;
}

function canvasMousemove(event) {
}


function test(t) {
  console.log("test");
  console.log(ctl(t).idx);
}

console.log("Dome.js ok");
