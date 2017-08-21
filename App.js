/**
 * Copyright Ⓒ 2017 Paul Murray pmurray@bigpond.com Minecraft Dome by Paul
 * Murray is licensed under a Creative Commons Attribution 4.0 International
 * License. http://creativecommons.org/licenses/by/4.0/
 */

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
  
  this.isCalculating = true;
  this.parabolic = 0;
  this.catenary = 0;
  this.roofY = 0;
  this.roofLoad = 0;
  this.lastUpdate = new Date();
  this.biggestShift = 0;
  this.calcX=0;
  this.calcZ=0;
  
  this.calculateProxy = $.proxy(this.calculate, this);
  
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
      var y = p.y;
      b.min.y = y;
      b.max.y = y;

      gotone = true
    } else {
      b.min.x = Math.min(b.min.x, p.x);
      b.max.x = Math.max(b.max.x, p.x);
      b.min.z = Math.min(b.min.z, p.z);
      b.max.z = Math.max(b.max.z, p.z);
      var y = p.y;
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

// ////////////////////////////////////////////////////////////////////////
// these functions have the job of adjusting the contents of the Drawer
// by manipulating the contents of the THREE.GRoup
// this.displayController.offsetter

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

App.prototype.joinFacesChecked = function(v) {
  this.drawer.joinFaces(v);
}

App.prototype.showLinesChecked = function(v) {
  this.drawer.showLines(v);
}

App.prototype.showMinecraftBlocksChecked = function(v) {
  this.drawer.showMinecraftBlocks(v);
}

// //////////////////////////////////////////////////////
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
  reset_up();
  this.drawer.reset();
  this.surfaceUpdateAll();
  this.lastUpdate = new Date();
}

App.prototype.calculate = function() {
  if(!this.isCalculating) return;
  
  var tt = new Date().getTime();
  
  while(new Date().getTime() - tt < 50) {
    if(!this.calcX && this.calcX!=0) {
      this.calcX = this.bounds.min.x;
    }
    else if(this.calcX < this.bounds.min.x) {
      this.calcX = this.bounds.min.x;
    }
    else if(this.calcX > this.bounds.max.x) {
      this.calcX = this.bounds.min.x;
      this.calcZ++;
    }
    
    if(!this.calcZ && this.calcZ!=0) {
      this.calcX = this.bounds.min.x;
    }
    else if(this.calcZ < this.bounds.min.z) {
      this.calcZ = this.bounds.min.z;
    }
    else if(this.calcZ > this.bounds.max.z) {
      this.calcZ = this.bounds.min.z;
    }
  
    var p = up(this.calcX, this.calcZ);
    if(this.blocks.has(p)) {
      this.calculateOne(p);
    }
    
    this.calcX ++;
  }
  
  if(new Date().getTime() - this.lastUpdate.getTime() > 250) {
    $("#biggest-shift").text(Math.round(this.biggestShift*100));
    this.surfaceUpdateAll();
    this.biggestShift = 0;
    this.lastUpdate = new Date();
  }
  
  window.setTimeout(this.calculateProxy);
}

App.prototype.isAnchor = function(p) {
  var supporting = null;
  Layer.prototype.allLayers.forEach(function(l) {
    if (l.enabled && l.blocks.has(p)) {
      supporting = l;
      return l;
    }
  });
  return supporting;
}

App.prototype.calculateOne = function(p) {
  var c = this;
  
  var anchorOf = this.isAnchor(p);
  if(anchorOf) {
    p.y = anchorOf.getY(p);
    return;
  }
  
  var currentY = p.y;
  var neighbours = 0;
  var d;
  
  var avgY = 0;
  if(this.blocks.has(up(p.x, p.z-1))) {
    d = up(p.x, p.z-1).y;
    avgY += d;
    neighbours ++;
  }
  if(this.blocks.has(up(p.x, p.z+1))) {
    d = up(p.x, p.z+1).y;
    avgY += d;
    neighbours ++;
  }
  if(this.blocks.has(up(p.x-1, p.z))) {
    d = up(p.x-1, p.z).y;
    avgY += d;
    neighbours ++;
  }
  if(this.blocks.has(up(p.x+1, p.z))) {
    d = up(p.x+1, p.z).y;
    avgY += d;
    neighbours ++;
  }
  
  if(!neighbours) return;
  
  avgY /= neighbours;
  
  var weight = 0;
  
  if(this.catenary != 0) {
    // this is actually not quite right - we can't use avgY, we should use p.y.
    // But
    // this creates infinities. avgY is ok in the limit of large surfaces with
    // small
    // curvature.
    
    var xpz = new THREE.Vector3( 1, up(p.x+1, p.z  ).y-avgY,  0);
    var xmz = new THREE.Vector3(-1, up(p.x-1, p.z  ).y-avgY,  0);
    var xzp = new THREE.Vector3( 0, up(p.x  , p.z+1).y-avgY,  1);
    var xzm = new THREE.Vector3( 0, up(p.x  , p.z-1).y-avgY, -1);
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
  
  var targetY = avgY + this.parabolic / 50 +  this.catenary * weight / 250 + (this.roofY-avgY) * this.roofLoad/200;
  if(isNaN(targetY)) targetY = 0;
  
  if(Math.floor(targetY) != Math.floor(currentY))
    this.biggestShift ++;

  p.y = targetY;
}


App.prototype.generateConstructionPlans = function() {
  var xoffs = parseInt($(this.element).find("#inputChunkX").val());
  var zoffs = parseInt($(this.element).find("#inputChunkZ").val());
  var yoffs = parseInt($(this.element).find("#inputChunkY").val());
  
  var plan = $(this.element).find(".building-plan.template").clone(true, true);
  plan.removeClass("template");
  
  var newWindow = window.open();
  $(newWindow.document).find("body").append(plan);
  
  var container = $(newWindow.document).find(".plan-layers");

  var info = this.drawer.mcComputed;
  
  var tt = $("<tt></tt>");
  container.append(tt);
  var pre = $("<pre></pre>");
  tt.append(pre);
  for(var y=this.bounds.min.y-1; y <= this.bounds.max.y+2; y++) {
    pre.append('\n');
    
    if((y+yoffs)%8 == 0) {
      for(var x=this.bounds.min.x-1; x <= this.bounds.max.x+2; x++) {
        pre.append("==");
      }
      pre.append('\n');
      pre.append('\n');
    }

    
    for(var z=this.bounds.min.z-1; z <= this.bounds.max.z+2; z++) {
      if((z+zoffs)%16 == 0) {
        for(var x=this.bounds.min.x-1; x <= this.bounds.max.x+2; x++) {
          pre.append((x+xoffs)%16==0?"+-":'--');
        }
        pre.append('\n');
      }
      
      for(var x=this.bounds.min.x-1; x <= this.bounds.max.x+2; x++) {
        var p = up(x,z);
        
        pre.append((x+xoffs)%16==0?"|":' ');
        
        var anchorOf = this.isAnchor(p);
        if(anchorOf && y == Math.round(anchorOf.getY(p))) {
          pre.append('A');
        }
        else if(!this.blocks.has(p)) {
          pre.append('·');
        }
        else {
          var inf = info.get(up(x,z));
          if(inf.minY <= y && inf.maxY >= y) {
            pre.append('■');
          }
          else if(y==inf.minY-1 ){
            pre.append('✕');
          }
          else if(y==inf.maxY+1 ){
            pre.append('○');
          }
          else {
            pre.append('·');
          }
        }
      }
      pre.append('\n');
    }
  }
}

App.prototype.drawFillRectangle = function() {
  var inputRectLeft = parseFloat($(this.element).find("#inputRectLeft").val());
  var inputRectWidth = parseFloat($(this.element).find("#inputRectWidth").val());
  var inputRectTop = parseFloat($(this.element).find("#inputRectTop").val());
  var inputRectHeight = parseFloat($(this.element).find("#inputRectHeight").val());
  var inputRectPower = parseFloat($(this.element).find("#inputRectPower").val());
  
  for(var z = Math.floor(inputRectTop); z < inputRectTop + inputRectHeight; z++) {
    for(var x = Math.floor(inputRectLeft); x <  inputRectLeft + inputRectWidth; x++) {
      var p = up(x,z);
      this.blocks.add(p);
    }
  }
  
  this.surfaceUpdateAll();
}
App.prototype.drawClearRectangle = function() {
  var inputRectLeft = parseFloat($(this.element).find("#inputRectLeft").val());
  var inputRectWidth = parseFloat($(this.element).find("#inputRectWidth").val());
  var inputRectTop = parseFloat($(this.element).find("#inputRectTop").val());
  var inputRectHeight = parseFloat($(this.element).find("#inputRectHeight").val());
  var inputRectPower = parseFloat($(this.element).find("#inputRectPower").val());
  
  for(var z = Math.floor(inputRectTop); z < inputRectTop + inputRectHeight; z++) {
    for(var x = Math.floor(inputRectLeft); x <  inputRectLeft + inputRectWidth; x++) {
      var p = up(x,z);
      this.blocks.delete(p);
    }
  }
  
  this.surfaceUpdateAll();
}

App.prototype.drawFillEllipse = function() {
  var inputRectLeft = parseFloat($(this.element).find("#inputRectLeft").val());
  var inputRectWidth = parseFloat($(this.element).find("#inputRectWidth").val());
  var inputRectTop = parseFloat($(this.element).find("#inputRectTop").val());
  var inputRectHeight = parseFloat($(this.element).find("#inputRectHeight").val());
  var inputRectPower = parseFloat($(this.element).find("#inputRectPower").val());
  
  var xc = inputRectLeft + inputRectWidth / 2;
  var zc = inputRectTop + inputRectHeight / 2;
  
  for(var z = Math.floor(inputRectTop)-1; z < inputRectTop + inputRectHeight+1; z++) {
    for(var x = Math.floor(inputRectLeft)-1; x <  inputRectLeft + inputRectWidth+1; x++) {
      
      r = Math.pow(
          Math.pow(Math.abs(x-xc)/inputRectWidth*2, inputRectPower) + Math.pow(Math.abs(z-zc)/inputRectHeight*2, inputRectPower),
          1/inputRectPower
          );
      
      if(r <= 1) { 
        var p = up(x,z);
        this.blocks.add(p);
      }
    }
  }
  
  this.surfaceUpdateAll();
}

App.prototype.drawClearEllipse = function() {
  console.log("attempting to clear an ellipse");
  
  var inputRectLeft = parseFloat($(this.element).find("#inputRectLeft").val());
  var inputRectWidth = parseFloat($(this.element).find("#inputRectWidth").val());
  var inputRectTop = parseFloat($(this.element).find("#inputRectTop").val());
  var inputRectHeight = parseFloat($(this.element).find("#inputRectHeight").val());
  var inputRectPower = parseFloat($(this.element).find("#inputRectPower").val());
  
  var xc = inputRectLeft + inputRectWidth / 2;
  var zc = inputRectTop + inputRectHeight / 2;
  
  for(var z = Math.floor(inputRectTop)-1; z < inputRectTop + inputRectHeight+1; z++) {
    for(var x = Math.floor(inputRectLeft)-1; x <  inputRectLeft + inputRectWidth+1; x++) {
      
      r = Math.pow(
          Math.pow(Math.abs(x-xc)/inputRectWidth*2, inputRectPower) + Math.pow(Math.abs(z-zc)/inputRectHeight*2, inputRectPower),
          1/inputRectPower
          );
      
      if(r <= 1) { 
        var p = up(x,z);
        this.blocks.delete(p);
      }
    }
  }
  
  this.surfaceUpdateAll();
}

console.log("App.js ok");
