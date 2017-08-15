console.log("App.js start");

function App(element) {
  this.element = element;
  this.maskHidden = false;
  this.blocks = new Set();
  
  this.bounds = {
      min : {        x : 0,        y : 0,        z : 0      },
      max : {        x : 0,        y : 0,        z : 0      },
      w : {        x : 0,        y : 0,        z : 0      },
      c : {        x : 0,        y : 0,        z : 0      },
      diagonal: Math.sqrt(3)
    };
  
  var displayDiv = $(element).find(".display-div")[0];
  displayDiv.controller = new Display(displayDiv, this);
  this.displayController = displayDiv.controller;
  this.drawer = new BlockDrawer(this, this.displayController);
  
}

App.prototype.init = function() {
  this.canvas = $(this.element).find(".surface-mask .mask-display canvas")[0];
  $(this.canvas).resizable({
    resize : function(event, ui) {
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

  this.isMouseDown = false;
  this.isMouseSetting = false;

  this.canvasScale = 20;
  this.canvasX = 0;
  this.canvasZ = 0;

  this.canvasSetFill = "#D0D0FF";
  this.canvasNotsetFill = "#F0F0F0";

  this.displayController.init();
  this.drawer.init();
  
  this.redrawCanvas();
  this.recalculateBounds();
}

App.prototype.recalculateBounds = function() {

  var gotone = false;

  var c = this;
  var b = this.bounds;

  this.blocks.forEach(function(p) {
    if (!gotone) {
      b.min.x = p.x;
      b.max.x = p.x;
      b.min.z = p.z;
      b.max.z = p.z;
      var y = c.getY(p)
      b.min.y = y;
      b.max.y = y;

      gotone = true
    } else {
      b.min.x = Math.min(b.min.x, p.x)
      b.max.x = Math.max(b.max.x, p.x)
      b.min.z = Math.min(b.min.z, p.z)
      b.max.z = Math.max(b.max.z, p.z)
      var y = c.getY(p)
      b.min.y = Math.min(b.min.y, y);
      b.max.y = Math.max(b.max.y, y);
    }
  });

  if(!gotone) {
    b.min.x = 0;
    b.max.x = 0;
    b.min.z = 0;
    b.max.z = 0;
    b.min.y = 0;
    b.max.y = 0;
    
  }
  
  b.w.x = (b.max.x - b.min.x);
  b.w.y = (b.max.y - b.min.y);
  b.w.z = (b.max.z - b.min.z);
  b.c.x = (b.max.x + b.min.x) / 2;
  b.c.y = (b.max.y + b.min.y) / 2;
  b.c.z = (b.max.z + b.min.z) / 2;
  
  // add one to take into account the block size of 1
  b.diagonal = Math.sqrt((b.w.x+1)*(b.w.x+1) + (b.w.y+1)*(b.w.y+1) + (b.w.y+1)*(b.w.y+1));
  
  c.displayController.updateCamera();  
}

App.prototype.getY = function(p) {
  return 0;
}

App.prototype.redrawCanvas = function(x, z) {
  canvasRedraw(this, x, z);

  var c = this;
  var canvas = c.canvas;
  var ctx = canvas.getContext("2d");

  if (x == undefined || z == undefined) {
    for (var x = 0; x * c.canvasScale < $(canvas).width(); x++) {
      for (var z = 0; z * c.canvasScale < $(canvas).height(); z++) {
        var p = up(x, z);
        Layer.prototype.allLayers.forEach(function(l) {
          if (l.enabled && l.blocks.has(p)) {
            ctx.beginPath();
            ctx.moveTo(x * c.canvasScale + 1, z * c.canvasScale + 1);
            ctx
                .lineTo((x + 1) * c.canvasScale - 2, (z + 1) * c.canvasScale
                    - 2);
            ctx.moveTo(x * c.canvasScale + 1, (z + 1) * c.canvasScale - 2);
            ctx.lineTo((x + 1) * c.canvasScale - 2, z * c.canvasScale + 1);
            ctx.stroke();
          }
        });
      }
    }
  } else {
    var p = up(x, z);
    Layer.prototype.allLayers.forEach(function(l) {
      if (l.enabled && l.blocks.has(p)) {
        ctx.beginPath();
        ctx.moveTo(x * c.canvasScale + 1, z * c.canvasScale + 1);
        ctx.lineTo((x + 1) * c.canvasScale - 2, (z + 1) * c.canvasScale - 2);
        ctx.moveTo(x * c.canvasScale + 1, (z + 1) * c.canvasScale - 2);
        ctx.lineTo((x + 1) * c.canvasScale - 2, z * c.canvasScale + 1);
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
  layer.controller = new Layer(layer, this);

  $(this.element).find("#layers").prepend(layer);

  layer.controller.init();
  
  this.layerAdded(layer.controller);
}

App.prototype.hideShowMask = function() {
  this.maskHidden = !this.maskHidden;
  $(this.element).find(".surface-mask .content").css("display",
      this.maskHidden ? "none" : "block");
  $(this.element).find(".surface-mask .hideshow > span").html(
      this.maskHidden ? "Closed" : "Open");
}

App.prototype.shiftall = function(x,z) {
  var nope = false;
  
  var newblocks = new Set();
  this.blocks.forEach(function (p){
    if(p.x+x >= 0 && p.z+z >=0) {
      newblocks.add(up(p.x+x, p.z+z));
    }
    else {
      // can't move this far
      nope = true;
      return;
    }
  }); 

  if(nope) return;
  
  this.blocks = newblocks;
  
  this.redrawCanvas();
  this.updateAllMask();
}

//////////////////////////////////////////////////////////////////////////
// these functions have the job of adjusting the contents of the Drawer
// by manipulating the contents of the THREE.GRoup this.displayController.offsetter

App.prototype.updateAllMask = function() {
  this.recalculateBounds();
  this.drawer.updateAllMask(this.blocks);
}

App.prototype.blockUpdate = function(p, added) {
  this.recalculateBounds();
  this.drawer.blockUpdate(p, added);
}

App.prototype.layerBlockUpdate = function(layer, p, added) {
  this.drawer.layerBlockUpdate(layer, p, added); 
}

App.prototype.layerAdded = function(layer) {
  this.drawer.layerAdded(layer);
}

App.prototype.layerRemoved = function(layer) {
  this.drawer.layerRemoved(layer);
}

App.prototype.layerEnabled = function(layer, enabled) {
  this.drawer.layerEnabled(layer, enabled);
}

App.prototype.layerUpdatedYvalues = function(layer) {
  this.drawer.layerUpdatedYvalues(layer);
}

App.prototype.layerAllUpdated = function(layer) {
  this.drawer.layerAllUpdated(layer);
}

console.log("App.js ok");
