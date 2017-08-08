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

function App(element) {
  this.element = element;
  this.maskHidden = false;
}

App.prototype.init = function() {
  $(this.element).find(".surface-mask .mask-display canvas").resizable();
  
  $(this.element).find(".surface-mask .mask-display canvas").mouseover($.proxy(this.maskMouseover, this));
  $(this.element).find(".surface-mask .mask-display canvas").mouseover($.proxy(this.maskMouseout, this));
  $(this.element).find(".surface-mask .mask-display canvas").mousemove($.proxy(this.maskMousemove, this));
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
  
  this.blocks = {}; // a 2d ragged map. blocks[4][5] will be true when there is a block at y=4,x=5
  
  this.anchor = [ {x:5, y:5, z:0},
                   {x:5, y:15, z:0},
                   {x:15, y:10, z:0}
                  ];
  
  
}

Layer.prototype.init = function() {
  $(this.element).find(".layer-display canvas").resizable();
  
  $(this.element).find(".layer-display canvas").mouseover($.proxy(this.canvasMouseover, this));
  $(this.element).find(".layer-display canvas").mouseover($.proxy(this.canvasMouseout, this));
  $(this.element).find(".layer-display canvas").mousemove($.proxy(this.canvasMousemove, this));
  
}

Layer.prototype.canvasMouseover = function(event) {
  console.log(this.idx);
}

Layer.prototype.canvasMouseout = function(event) {
  console.log(this.idx);
}

Layer.prototype.canvasMousemove = function(event) {
  console.log(this.idx);
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

function test(t) {
  console.log("test");
  console.log(ctl(t).idx);
}

console.log("Dome.js ok");
