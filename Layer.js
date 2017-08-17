/**
 * Copyright Ⓒ 2017 Paul Murray pmurray@bigpond.com
 * Minecraft Dome by Paul Murray is licensed under a 
 * Creative Commons Attribution 4.0 International License.
 * http://creativecommons.org/licenses/by/4.0/
 */

console.log("Layer.js start");

var layeridx = 1;

function Layer(element, app) {
  this.idx = layeridx++;
  this.element = element;
  this.app = app;
  this.hidden = false;
  this.enabled = true;
  
  this.y_0 = 0;
  this.y_x = 0;
  this.y_z = 0;
  
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
  
  $(this.element).find(".layer-anchor input").change($.proxy(this.anchorUpdated, this))
  
  this.redrawCanvas();
}


Layer.prototype.anchorUpdated = function() {
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
  
  if((this.anchor.red.x!=this.anchor.green.x || this.anchor.red.z!=this.anchor.green.z) 
      && (this.anchor.red.x!=this.anchor.blue.x || this.anchor.red.z!=this.anchor.blue.z) 
      && (this.anchor.green.x!=this.anchor.blue.x || this.anchor.green.z!=this.anchor.blue.z) 
      )
  {
    // calculate (red->green) X (red->blue)
  
    var rg = new THREE.Vector3(this.anchor.green.x-this.anchor.red.x, this.anchor.green.y-this.anchor.red.y, this.anchor.green.z-this.anchor.red.z);
    var rb = new THREE.Vector3 (this.anchor.blue.x-this.anchor.red.x, this.anchor.blue.y-this.anchor.red.y, this.anchor.blue.z-this.anchor.red.z);
    var cross = new THREE.Vector3();
    cross.crossVectors(rg, rb);

    // ok. The cross product is orthogonal to the anchor plane. The equation for the plane becomes
    // cross.x (x - red.x) + cross.z (z - red.z) + cross.y (y - red.y) = 0
    // wee need to solve this for y
    
    // cross.x (x - red.x) + cross.z (z - red.z) + cross.y y - cross.y red.y = 0
    // cross.x (x - red.x) + cross.z (z - red.z) - cross.y red.y = - cross.y y
    // - cross.x (x - red.x) - cross.z (z - red.z) + cross.y red.y = cross.y y
    // - cross.x (x - red.x) / cross.y - cross.z (z - red.z) / cross.y + red.y =  y
    
    // -cross.x/cross.y (x - red.x)  -cross.z/cross.y (z - red.z)  + red.y =  y
      
    // x (- cross.x/cross.y) + z(-cross.z/cross.y) + red.y + cross.x/cross.y red.x + cross.z/cross.y red.z
    
    this.y_x = -cross.x/cross.y;
    this.y_z = -cross.z/cross.y;
    this.y_0 = this.anchor.red.y + cross.x/cross.y*this.anchor.red.x + cross.z/cross.y*this.anchor.red.z;
  }
  
  this.app.layerUpdatedYvalues(this);
  
  this.redrawCanvas();
}

Layer.prototype.hideshow = function() {
  this.hidden = !this.hidden;
  $(this.element).find(".content").css("display", this.hidden ? "none" : "block");
}

Layer.prototype.enabledisable = function() {
  this.enabled = !this.enabled;
  $(this.element).find(".enabledisable > span").html(this.enabled ? "Enabled" : "Disabled");
  ctl($(".surface-mask .mask-display")[0]).redrawCanvas();
  
  this.app.layerEnabled(this, this.enabled);
}

Layer.prototype.delete = function() {
  if(confirm("Are you sure?")) {
    $(this.element).remove();
    this.allLayers.delete(this);
    ctl($(".surface-mask .mask-display")[0]).redrawCanvas();
    this.app.layerRemoved(this);
  }
}

Layer.prototype.blockUpdate = function(p, added) {
  this.app.layerBlockUpdate(this, p, added);
}

Layer.prototype.shiftall = function(x, z) {
  var nope = false;
  
  this.blocks.forEach(function(p) {
    if(p.x + x < 0 || p.z + z < 0) {
      nope = true;
      return;
    }
  });
  
  for(i in this.anchor) {
    if(this.anchor[i].x + x < 0 || this.anchor[i].z + z < 0) {
      nope = true;
      break;
    }
  }
  
  if(nope) return;
  
  var newBlocks = new Set();
  
  this.blocks.forEach(function(p) {
    newBlocks.add(up(p.x+x, p.z+z));
  });
  
  this.blocks = newBlocks;
  
  for(i in this.anchor) {
    $(this.element).find(".layer-anchor." + i + " input.x").val(this.anchor[i].x + x);
    $(this.element).find(".layer-anchor." + i + " input.z").val(this.anchor[i].z + z);
  }
  this.anchorUpdated();
  this.redrawCanvas();
  
  this.app.layerAllUpdated(this);  
}

Layer.prototype.biggerClick = function() {
  this.canvasScale ++;
  this.redrawCanvas();
}

Layer.prototype.smallerClick = function() {
  if(this.canvasScale > 4) {
    this.canvasScale --;
    this.redrawCanvas();
  }
}

Layer.prototype.redrawCanvas = function(x, z) {
  canvasRedraw(this, x, z);

//  // trigger a redraw of the surface mask
//  this.app.redrawCanvas(x, z);
  
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
  
  ctx.lineWidth = 1;
  ctx.strokeStyle= "#A0A0FF";
  
  if(x==undefined || z == undefined) {
    this.app.blocks.forEach(function(p) {
      ctx.beginPath();
      ctx.moveTo(p.x * c.canvasScale + 1, p.z * c.canvasScale + 1);
      ctx.lineTo((p.x + 1) * c.canvasScale - 2, (p.z + 1) * c.canvasScale - 2);
      ctx.moveTo(p.x * c.canvasScale + 1, (p.z + 1) * c.canvasScale - 2);
      ctx.lineTo((p.x + 1) * c.canvasScale - 2, p.z * c.canvasScale + 1);
      ctx.stroke();
    });
  }
  else {
    if(this.app.blocks.has(up(x,z))) {
      ctx.beginPath();
      ctx.moveTo(x * c.canvasScale + 1, z * c.canvasScale + 1);
      ctx.lineTo((x + 1) * c.canvasScale - 2, (z + 1) * c.canvasScale - 2);
      ctx.moveTo(x * c.canvasScale + 1, (z + 1) * c.canvasScale - 2);
      ctx.lineTo((x + 1) * c.canvasScale - 2, z * c.canvasScale + 1);
      ctx.stroke();
    }
  }
}

Layer.prototype.getY = function(p) {
  return this.y_0 + p.x * this.y_x + p.z * this.y_z;
}

console.log("Layer.js ok");
