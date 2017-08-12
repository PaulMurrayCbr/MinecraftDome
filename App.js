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
  this.canvasZ = 0;
  
  this.canvasSetFill = "#D0D0FF";
  this.canvasNotsetFill = "#F0F0F0";    
    
  this.redrawCanvas();
}

App.prototype.redrawCanvas = function(x, z) {
  canvasRedraw(this, x, z);
  
  var c = this;
  var canvas = c.canvas;
  var ctx = canvas.getContext("2d");
  
  if(x == undefined || z == undefined) {
    for(var x=0; x * c.canvasScale <  $(canvas).width(); x++) {
      for(var z=0; z * c.canvasScale <  $(canvas).height(); z++) {
        var p = up(x,z);
        Layer.prototype.allLayers.forEach(function(l) {
          if(l.enabled && l.blocks.has(p)) {
            ctx.beginPath();
            ctx.moveTo(x*c.canvasScale+1,z*c.canvasScale+1);
            ctx.lineTo((x+1)*c.canvasScale-2,(z+1)*c.canvasScale-2);
            ctx.moveTo(x*c.canvasScale+1,(z+1)*c.canvasScale-2);
            ctx.lineTo((x+1)*c.canvasScale-2,z*c.canvasScale+1);
            ctx.stroke();
          }
        });
      }
    }
  }
  else {
    var p = up(x,z);
    Layer.prototype.allLayers.forEach(function(l) {
      if(l.enabled && l.blocks.has(p)) {
        ctx.beginPath();
        ctx.moveTo(x*c.canvasScale+1,z*c.canvasScale+1);
        ctx.lineTo((x+1)*c.canvasScale-2,(z+1)*c.canvasScale-2);
        ctx.moveTo(x*c.canvasScale+1,(z+1)*c.canvasScale-2);
        ctx.lineTo((x+1)*c.canvasScale-2,z*c.canvasScale+1);
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

