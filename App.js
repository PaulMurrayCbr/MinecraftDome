console.log("App.js start");

function App(element) {
  this.element = element;
  this.maskHidden = false;
  this.blocks = new Set();
  this.calculatedY = new Map();
  
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
  
  this.isCalculating = true;
  this.parabolic = 0;
  this.catenary = 0;
  this.lastUpdate = new Date();
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
  
  this.calculate();
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
  if(this.calculatedY.has(p)) {
    return this.calculatedY.get(p);
  }
  else { 
    return 0;
  }
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
            ctx.lineTo((x + 1) * c.canvasScale - 2, (z + 1) * c.canvasScale - 2);
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
  
  this.surfaceUpdateAll();
}

App.prototype.biggerClick = function() {
  this.canvasScale ++;
  this.redrawCanvas();
}

App.prototype.smallerClick = function() {
  if(this.canvasScale > 4) {
    this.canvasScale --;
    this.redrawCanvas();
  }
}

// callback from canvas
App.prototype.blockUpdate = function(p, added) {
  this.surfaceUpdate(p, added);
}

//////////////////////////////////////////////////////////////////////////
// these functions have the job of adjusting the contents of the Drawer
// by manipulating the contents of the THREE.GRoup this.displayController.offsetter

App.prototype.surfaceUpdateAll = function() {
  this.recalculateBounds();
  this.redrawCanvas();
  this.drawer.surfaceUpdateAll(this.blocks);
  
  Layer.prototype.allLayers.forEach(function(l) {
    l.redrawCanvas();
  });
  
}

App.prototype.surfaceUpdate = function(p, added) {
  this.recalculateBounds();
  this.redrawCanvas(p.x, p.z);
  this.drawer.surfaceUpdate(p, added);
  Layer.prototype.allLayers.forEach(function(l) {
    l.redrawCanvas(p);
  });
}

App.prototype.surfaceUpdateY = function(p) {
  this.recalculateBounds();
  this.drawer.surfaceUpdateY(p);
}

App.prototype.layerBlockUpdate = function(layer, p, added) {
  this.redrawCanvas(p.x, p.z);
  this.drawer.layerBlockUpdate(layer, p, added); 
}

App.prototype.layerAdded = function(layer) {
  this.redrawCanvas();
  this.drawer.layerAdded(layer);
}

App.prototype.layerRemoved = function(layer) {
  this.redrawCanvas();
  this.drawer.layerRemoved(layer);
}

App.prototype.layerEnabled = function(layer, enabled) {
  this.redrawCanvas();
  this.drawer.layerEnabled(layer, enabled);
}

App.prototype.layerUpdatedYvalues = function(layer) {
  this.drawer.layerUpdatedYvalues(layer);
}

App.prototype.layerAllUpdated = function(layer) {
  this.redrawCanvas();
  this.drawer.layerAllUpdated(layer);
}

App.prototype.useHalfSlabsChecked = function(v) {
  this.drawer.useHalfSlabs(v);
}

App.prototype.joinFacesChecked = function(v) {
  this.drawer.joinFaces(v);
}

App.prototype.showIdealBlocksChecked = function(v) {
  this.drawer.showIdealBlocks(v);
}

App.prototype.showLinesChecked = function(v) {
  this.drawer.showLines(v);
}

App.prototype.showMinecraftBlocksChecked = function(v) {
  this.drawer.showMinecraftBlocks(v);
}

////////////////////////////////////////////////////////
// These functions are the actual math.

App.prototype.clickCalculate = function() {
  if(this.isCalculating) {
    this.isCalculating = false;
    $(this.element).find(".parameters-div .calculating").text("Idle");
  }
  else {
    this.isCalculating = true;
    $(this.element).find(".parameters-div .calculating").text("Calculating …");
    this.calculate();
  }
  this.surfaceUpdateAll();
  this.lastUpdate = new Date();
}

App.prototype.clickReset = function() {
  this.isCalculating = false;
  $(this.element).find(".parameters-div .calculating").text("Idle");
  this.calculatedY.clear();
  this.drawer.reset();
  this.surfaceUpdateAll();
  this.lastUpdate = new Date();
}

App.prototype.calculate = function() {
  if(!this.isCalculating) return;
  
  var c = this;
  this.blocks.forEach(function(p) {
    c.calculateOne(p);
  });

  if(new Date().getTime() - this.lastUpdate.getTime() > 250) {
    this.surfaceUpdateAll();
    this.lastUpdate = new Date();
  }
  
  window.setTimeout($.proxy(this.calculate, this));
}

App.prototype.calculateOne = function(p) {
  var c = this;
  var supporting = false;
  Layer.prototype.allLayers.forEach(function(l) {
    if (l.enabled && l.blocks.has(p)) {
      c.calculatedY.set(p, l.getY(p));
      supporting = true;
      return;
    }
  });
  if(supporting) return;
  
  var currentY = this.getY(p);
  var neighbours = 0;
  var d;
  
  var avgY = 0;
  if(this.blocks.has(up(p.x, p.z-1))) {
    d = this.getY(up(p.x, p.z-1));
    avgY += d;
    neighbours ++;
  }
  if(this.blocks.has(up(p.x, p.z+1))) {
    d = this.getY(up(p.x, p.z+1));
    avgY += d;
    neighbours ++;
  }
  if(this.blocks.has(up(p.x-1, p.z))) {
    d = this.getY(up(p.x-1, p.z));
    avgY += d;
    neighbours ++;
  }
  if(this.blocks.has(up(p.x+1, p.z))) {
    d = this.getY(up(p.x+1, p.z));
    avgY += d;
    neighbours ++;
  }
  
  if(!neighbours) return;
  
  avgY /= neighbours;
  
  var weight = 0;
  
  if(this.catenary != 0) {
    // this is actually not quite right - we can't use avgY, we should use p.y. But
    // this creates infinities. avgY is ok in the limit of large surfaces with small
    // curvature.
    
    var xpz = new THREE.Vector3( 1, this.getY(up(p.x+1, p.z  ))-avgY,  0);
    var xmz = new THREE.Vector3(-1, this.getY(up(p.x-1, p.z  ))-avgY,  0);
    var xzp = new THREE.Vector3( 0, this.getY(up(p.x  , p.z+1))-avgY,  1);
    var xzm = new THREE.Vector3( 0, this.getY(up(p.x  , p.z-1))-avgY, -1);
    var cross = new THREE.Vector3();
    
    if(this.blocks.has(up(p.x, p.z-1)) && this.blocks.has(up(p.x-1, p.z))) {
      cross.crossVectors(xzm, xmz);
      weight += 1/2 * cross.lengthSq();
    }
    if(this.blocks.has(up(p.x, p.z+1)) && this.blocks.has(up(p.x-1, p.z))) {
      cross.crossVectors(xzp, xmz);
      weight += 1/2 * cross.lengthSq();
    }
    if(this.blocks.has(up(p.x, p.z-1)) && this.blocks.has(up(p.x+1, p.z))) {
      cross.crossVectors(xzm, xpz);
      weight += 1/2 * cross.lengthSq();
    }
    if(this.blocks.has(up(p.x, p.z+1)) && this.blocks.has(up(p.x+1, p.z))) {
      cross.crossVectors(xzp, xpz);
      weight += 1/2 * cross.lengthSq();
    }
  }
  
  var targetY = avgY + this.parabolic / 50 +  this.catenary * weight / 500;
  
  this.calculatedY.set(p, targetY);
}


console.log("App.js ok");
