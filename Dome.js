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

Point.prototype.toString = function() {
  return "(" + this.x + ", " + this.y + ")";
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
  this.blocks = new Set();
  
}

App.prototype.init = function() {
  this.canvas = $(this.element).find(".surface-mask .mask-display canvas")[0];
  $(this.canvas).resizable({
    resize: function(event, ui) {
      var c = ctl(ui.element[0])
      // set the resolution of the canvas equal to the UI size
      c.canvas.width = $(c.canvas).width();
      c.canvas.height = $(c.canvas).height();
      ctl(ui.element[0]).redrawCanvas();
    }
  });
  
  $(this.canvas).mouseover($.proxy(canvasMouseover, this));
  $(this.canvas).mouseover($.proxy(canvasMouseout, this));
  $(this.canvas).mousemove($.proxy(canvasMousemove, this));
  $(this.canvas).mousedown($.proxy(canvasMousedown, this));
  $(this.canvas).mouseup($.proxy(canvasMouseup, this));
 
  this.isMouseDown = false;
  this.isMouseSetting = false;
  
  this.canvasScale = 20;
  this.canvasX = 0;
  this.canvasY = 0;
  
  this.canvasSetFill = "#D0D0FF";
  this.canvasNotsetFill = "#F0F0F0";    
    
  canvasRedraw(this);
}

App.prototype.redrawCanvas = function(x, y) {
  canvasRedraw(this, x, y);
  
  var c = this;
  var canvas = c.canvas;
  var ctx = canvas.getContext("2d");
  
  if(x == undefined || y == undefined) {
    for(var x=0; x * c.canvasScale <  $(canvas).width(); x++) {
      for(var y=0; y * c.canvasScale <  $(canvas).height(); y++) {
        var p = up(x,y);
        Layer.prototype.allLayers.forEach(function(l) {
          if(l.enabled && l.blocks.has(p)) {
            ctx.moveTo(x*c.canvasScale+1,y*c.canvasScale+1);
            ctx.lineTo((x+1)*c.canvasScale-2,(y+1)*c.canvasScale-2);
            ctx.moveTo(x*c.canvasScale+1,(y+1)*c.canvasScale-2);
            ctx.lineTo((x+1)*c.canvasScale-2,y*c.canvasScale+1);
            ctx.stroke();
          }
        });
      }
    }
  }
  else {
    var p = up(x,y);
    Layer.prototype.allLayers.forEach(function(l) {
      if(l.enabled && l.blocks.has(p)) {
        ctx.moveTo(x*c.canvasScale+1,y*c.canvasScale+1);
        ctx.lineTo((x+1)*c.canvasScale-2,(y+1)*c.canvasScale-2);
        ctx.moveTo(x*c.canvasScale+1,(y+1)*c.canvasScale-2);
        ctx.lineTo((x+1)*c.canvasScale-2,y*c.canvasScale+1);
        ctx.stroke();
      }
    });
  }
  
  // go through the layers, draw the layer blocks
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
  
  this.allLayers.add(this);
}

Layer.prototype.toString = function() {
  return "Layer " + this.idx;
}

Layer.prototype.allLayers = new Set();


Layer.prototype.init = function() {
  this.canvas = $(this.element).find(".layer-display canvas")[0];
  $(this.canvas).resizable({
    resize: function(event, ui) {
      var c = ctl(ui.element[0])
      // set the resolution of the canvas equal to the UI size
      c.canvas.width = $(c.canvas).width();
      c.canvas.height = $(c.canvas).height();
      ctl(ui.element[0]).redrawCanvas();
    }
  });
  
  $(this.canvas).mouseover($.proxy(canvasMouseover, this));
  $(this.canvas).mouseover($.proxy(canvasMouseout, this));
  $(this.canvas).mousemove($.proxy(canvasMousemove, this));
  $(this.canvas).mousedown($.proxy(canvasMousedown, this));
  $(this.canvas).mouseup($.proxy(canvasMouseup, this));
 
  this.canvasScale = 20;
  this.canvasX = 0;
  this.canvasY = 0;
  this.canvasSetFill = "#808080";
  this.canvasNotsetFill = "#F0F0F0";    
    
  
  this.isMouseDown = false;
  this.isMouseSetting = false;
    
  canvasRedraw(this);
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
  ctl($(".surface-mask .mask-display")[0]).redrawCanvas();
}

Layer.prototype.delete = function() {
  if(confirm("Are you sure?")) {
    $(this.element).remove();
    this.allLayers.delete(this);
    ctl($(".surface-mask .mask-display")[0]).redrawCanvas();
  }
}

Layer.prototype.redrawCanvas = function(x, y) {
  canvasRedraw(this, x, y);

  // trigger a redraw of the durface mask
  ctl($(".surface-mask .mask-display")[0]).redrawCanvas(x, y);
  
  // draw in the three anchor points
}


function canvasMouseover(event) {
}

function canvasMouseout (event) {
  canvasMouseup(event);
}

function canvasMousedown(event) {
  $(this.canvas).css("cursor", "pointer");
  this.isMouseDown = true;
  
  var offs = $(this.canvas).offset();
  x = event.clientX - offs.left;
  y = event.clientY - offs.top;
  
  x = Math.floor(x / this.canvasScale);
  y = Math.floor(y / this.canvasScale);
  
  var p = up(x,y);

  this.isMouseSetting = !this.blocks.has(p);
  
  if(this.isMouseSetting) {
    this.blocks.add(p);
  }
  else {
    this.blocks.delete(p);
  }
  
  this.redrawCanvas(x, y);
}

function canvasMouseup(event) {
  $(this.canvas).css("cursor", "crosshair");
  this.isMouseDown = false;
}

function canvasMousemove(event) {
  if(!this.isMouseDown) return;
  
  var offs = $(this.canvas).offset();
  x = event.clientX - offs.left;
  y = event.clientY - offs.top;
  
  x = Math.floor(x / this.canvasScale);
  y = Math.floor(y / this.canvasScale);
  
  var p = up(x,y);
  
  if(this.blocks.has(p) == this.isMouseSetting) return;
  
  if(this.isMouseSetting) {
    this.blocks.add(p);
  }
  else {
    this.blocks.delete(p);
  }
  
  this.redrawCanvas(x, y);
}

function canvasRedraw(c, x, y) {
  var canvas = c.canvas;
  var ctx = canvas.getContext("2d");
  
  if(x == undefined || y == undefined) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,$(canvas).width(), $(canvas).height());
    for(var x=0; x * c.canvasScale <  $(canvas).width(); x++) {
      for(var y=0; y * c.canvasScale <  $(canvas).height(); y++) {
        var p = up(x,y);
        ctx.fillStyle = (c.blocks.has(p) ? c.canvasSetFill : c.canvasNotsetFill)
        ctx.fillRect(x*c.canvasScale+1,y*c.canvasScale+1,c.canvasScale-1,c.canvasScale-1);
      }
    }
  }
  else {
    var p = up(x,y);
    ctx.fillStyle = (c.blocks.has(p) ? c.canvasSetFill : c.canvasNotsetFill)
    ctx.fillRect(x*c.canvasScale+1,y*c.canvasScale+1,c.canvasScale-1,c.canvasScale-1);
  }
  
}

function test(t) {
  console.log("test");
  console.log(ctl(t).idx);
}

console.log("Dome.js ok");
