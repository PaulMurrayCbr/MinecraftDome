console.log("Dome.js start");




$(function() {
  console.log("initialization");
  
  var body = $("body")[0];
  body.controller = new App(body);
  body.controller.init();
  
  var displayDiv;
  displayDiv = $(".display-div")[0];
  displayDiv.controller = new Display(displayDiv);
  displayDiv.controller.init();
});

function ctl(e) {
  while(e) {
    if(e.controller) return e.controller;
    e = e.parentNode;
  }
  return null;
}

function Point(x,z) {
  this.x = z;
  this.z = z;
}

Point.prototype.toString = function() {
  return "(" + this.x + ", " + this.z + ")";
}

// a set of point objects, used for map keys and set membership
var uniquePoint = [];

function up(x,z) {
  if(!uniquePoint[x]) {
    uniquePoint[x] = [];
  }
  if(!uniquePoint[x][z]) {
    uniquePoint[x][z] = new Point(x,z);
  }
  return uniquePoint[x][z];
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
  $(this.canvas).mouseover($.proxy(canvasMouseout, this));
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

Layer.prototype.redrawCanvas = function(x, z) {
  canvasRedraw(this, x, z);

  // trigger a redraw of the durface mask
  ctl($(".surface-mask .mask-display")[0]).redrawCanvas(x, z);
  
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
  z = event.clientY - offs.top;
  
  x = Math.floor(x / this.canvasScale);
  z = Math.floor(z / this.canvasScale);
  
  var p = up(x,z);

  this.isMouseSetting = !this.blocks.has(p);
  
  if(this.isMouseSetting) {
    this.blocks.add(p);
  }
  else {
    this.blocks.delete(p);
  }
  
  this.redrawCanvas(x, z);
}

function canvasMouseup(event) {
  $(this.canvas).css("cursor", "crosshair");
  this.isMouseDown = false;
}

function canvasMousemove(event) {
  if(!this.isMouseDown) return;
  
  var offs = $(this.canvas).offset();
  var x = event.clientX - offs.left;
  var z = event.clientY - offs.top;
  
  x = Math.floor(x / this.canvasScale);
  z = Math.floor(z / this.canvasScale);
  
  var p = up(x,z);
  
  if(this.blocks.has(p) == this.isMouseSetting) return;
  
  if(this.isMouseSetting) {
    this.blocks.add(p);
  }
  else {
    this.blocks.delete(p);
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

function Display(element) {
  this.element = element;
}

Display.prototype.init = function() {
  var c = this;
  
  c.container = $(this.element).find(".display-content")[0];
  
  c.scene = new THREE.Scene();
  c.scene.background = new THREE.Color( 0xf8f8f8 );
  
  
  c.camera = new THREE.PerspectiveCamera( 75, 1 /*
                                                 * window.innerWidth /
                                                 * window.innerHeight
                                                 */, 0.1, 1000 );

  c.renderer = new THREE.WebGLRenderer();
  c.renderer.setSize( 50, 50);
  c.container.appendChild(c.renderer.domElement );  
  
  $(c.renderer.domElement).width($(c.container).width());
  $(c.renderer.domElement).height($(c.container).height());
  
  $(c.renderer.domElement).addClass("ui-widget-content");
  
  var resizeFunc = function(event, ui) {
    // resize the canvas pixels - not the same as the canvas size!
    c.renderer.domElement.width = $(c.renderer.domElement).width();
    c.renderer.domElement.height = $(c.renderer.domElement).height();
    // let the renderer itself know that th canvas has changed size
    c.renderer.setSize( $(c.renderer.domElement).width(), $(c.renderer.domElement).height());

    c.camera.aspect = $(c.renderer.domElement).width()/ $(c.renderer.domElement).height();
    c.camera.updateProjectionMatrix();
    
    c.camera.position.z = 5;
    c.renderer.render(c.scene, c.camera);
  };
  
  $(c.renderer.domElement).resizable({
    resize: resizeFunc
  });

  
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  
  var material = new THREE.MeshLambertMaterial( {
    transparent : true,
    opacity : .9,
    color : 0x2194ce
  });
  
  for(var x = -3; x <= 3; x+= 2)
    for(var y = -3; y <= 3; y+= 2)
      for(var z = -2; z <= 2; z+= 2) {
        var cube = new THREE.Mesh( geometry, material );
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        c.scene.add( cube );
  }
  
  var light = new THREE.AmbientLight( 0x404040 ); // soft white light
  c.scene.add( light );
  
  hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, 500, 0 );
  c.scene.add( hemiLight );
  
  resizeFunc();
}

console.log("Dome.js ok");
