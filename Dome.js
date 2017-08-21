/**
 * Copyright Ⓒ 2017 Paul Murray pmurray@bigpond.com
 * Minecraft Dome by Paul Murray is licensed under a 
 * Creative Commons Attribution 4.0 International License.
 * http://creativecommons.org/licenses/by/4.0/
 */

console.log("Dome.js start");

$(function() {
  console.log("initialization");
  
  var body = $("body")[0];
  body.controller = new App(body);
  body.controller.init();
  
});

function ctl(e) {
  while(e) {
    if(e.controller) return e.controller;
    e = e.parentNode;
  }
  return null;
}

function Point(x,z) {
  this.x = x;
  this.z = z;
}

// a set of point objects, used for map keys and set membership
var uniquePoint = [];

function reset_up() {
  for(i in uniquePoint) {
    for(j in uniquePoint[i]) {
      uniquePoint[i][j].y = 0;
    }
  }
}

// canonicalizing mapping
function up(x,z) {
  if(!uniquePoint[x]) {
    uniquePoint[x] = [];
  }
  if(!uniquePoint[x][z]) {
    uniquePoint[x][z] = new THREE.Vector3(x, 0, z);
  }
  return uniquePoint[x][z];
}

function canvasMouseover(event) {
}

function canvasMouseout (event) {
  canvasMouseup(event);
}

function canvasMousedown(event) {
  $(this.canvas).css("cursor", "pointer");
  this.isMouseDown = true;
  
  var offs = this.canvas.getBoundingClientRect();
  x = event.clientX - offs.left;
  z = event.clientY - offs.top;
  
  x = Math.floor(x / this.canvasScale);
  z = Math.floor(z / this.canvasScale);
  
  var p = up(x,z);

  this.isMouseSetting = !this.blocks.has(p);
  
  if(this.isMouseSetting) {
    this.blocks.add(p);
    this.blockUpdate(p, true);
  }
  else {
    this.blocks.delete(p);
    this.blockUpdate(p, false);
  }
  
  this.redrawCanvas(x, z);
}

function canvasMouseup(event) {
  $(this.canvas).css("cursor", "crosshair");
  this.isMouseDown = false;
}

function canvasMousemove(event) {
  if(!this.isMouseDown) return;
  
  var offs = this.canvas.getBoundingClientRect();
  var x = event.clientX - offs.left;
  var z = event.clientY - offs.top;
  
  x = Math.floor(x / this.canvasScale);
  z = Math.floor(z / this.canvasScale);
  
  var p = up(x,z);
  
  if(this.blocks.has(p) == this.isMouseSetting) return;
  
  if(this.isMouseSetting) {
    this.blocks.add(p);
    this.blockUpdate(p, true);
  }
  else {
    this.blocks.delete(p);
    this.blockUpdate(p, false);
  }
  
  this.redrawCanvas(x, z);
}

function canvasRedraw(c, x, z) {
  var canvas = c.canvas;
  var ctx = canvas.getContext("2d");
  
  if(x == undefined || z == undefined) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0,$(canvas).width(), $(canvas).height());
    for(var x=0; x * c.canvasScale <  $(canvas).width(); x++) {
      for(var z=0; z * c.canvasScale <  $(canvas).height(); z++) {
        var p = up(x,z);
        ctx.fillStyle = (c.blocks.has(p) ? c.canvasSetFill : c.canvasNotsetFill)
        ctx.fillRect(x*c.canvasScale+1,z*c.canvasScale+1,c.canvasScale-1,c.canvasScale-1);
      }
    }
  }
  else {
    var p = up(x,z);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x*c.canvasScale,z*c.canvasScale,c.canvasScale+1,c.canvasScale+1);
    ctx.fillStyle = (c.blocks.has(p) ? c.canvasSetFill : c.canvasNotsetFill)
    ctx.fillRect(x*c.canvasScale+1,z*c.canvasScale+1,c.canvasScale-1,c.canvasScale-1);
  }
  
}

function test(t) {
  console.log("test");
  console.log(ctl(t).idx);
}


console.log("Dome.js ok");
