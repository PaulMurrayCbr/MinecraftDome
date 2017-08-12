console.log("Layer.js start");

var layeridx = 1;

function Layer(element, app) {
  this.idx = layeridx++;
  this.element = element;
  this.app = app;
  this.hidden = false;
  this.enabled = true;
  
  
  this.height = 20;
  this.width = 20;
  
  this.blocks = new Set();
  
  this.anchor = { red: {x:0, z:0, y:0},
                   green: {x:0, z:5, y:0},
                   blue: {x:5, z:0, y:0}
  };
  
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
  $(this.canvas).mouseout($.proxy(canvasMouseout, this));
  $(this.canvas).mousemove($.proxy(canvasMousemove, this));
  $(this.canvas).mousedown($.proxy(canvasMousedown, this));
  $(this.canvas).mouseup($.proxy(canvasMouseup, this));
 
  this.canvasScale = 20;
  this.canvasX = 0;
  this.canvasZ = 0;
  this.canvasSetFill = "#808080";
  this.canvasNotsetFill = "#F0F0F0";    
    
  
  this.isMouseDown = false;
  this.isMouseSetting = false;

  for(i in this.anchor) {
    $(this.element).find(".layer-anchor." + i + " input.x").val(this.anchor[i].x);
    $(this.element).find(".layer-anchor." + i + " input.y").val(this.anchor[i].y);
    $(this.element).find(".layer-anchor." + i + " input.z").val(this.anchor[i].z);
  }
  
  console.log($(this.element).find(".layer-anchor input"));
  $(this.element).find(".layer-anchor input").change($.proxy(anchorUpdated, this))
  
  this.redrawCanvas();
}

function anchorUpdated() {
  for(i in this.anchor) {
    var f;
    
    f = parseInt($(this.element).find(".layer-anchor." + i + " input.x").val());
    $(this.element).find(".layer-anchor." + i + " input.x").val(f);
    this.anchor[i].x = f;
    
    f = parseInt($(this.element).find(".layer-anchor." + i + " input.z").val());
    $(this.element).find(".layer-anchor." + i + " input.z").val(f);
    this.anchor[i].z = f;
    
    f = parseFloat($(this.element).find(".layer-anchor." + i + " input.y").val());
    $(this.element).find(".layer-anchor." + i + " input.y").val(f);
    this.anchor[i].y = f;
    
    
  }
  
  this.redrawCanvas();
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

Layer.prototype.blockUpdate = function(p, added) {
  
}

Layer.prototype.redrawCanvas = function(x, z) {
  canvasRedraw(this, x, z);

  // trigger a redraw of the surface mask
  this.app.redrawCanvas(x, z);
  
  var c = this;
  var canvas = c.canvas;
  var ctx = canvas.getContext("2d");
  
  ctx.font =  (c.canvasScale-2) + "px sans-serif"
  ctx.textAlign="center";
  ctx.textBaseline="middle"; 
  
  // draw in the three anchor points
  for(var i in this.anchor ) {
    ctx.fillStyle = i;
    ctx.fillText("⚓",(this.anchor[i].x+.5)*c.canvasScale+.5,(this.anchor[i].z+.5)*c.canvasScale+.5);
  }
}

console.log("Layer.js ok");
