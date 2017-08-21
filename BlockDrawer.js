/**
 * Copyright Ⓒ 2017 Paul Murray pmurray@bigpond.com Minecraft Dome by Paul
 * Murray is licensed under a Creative Commons Attribution 4.0 International
 * License. http://creativecommons.org/licenses/by/4.0/
 */

console.log("BlockDrawer.js start");

function BlockDrawer(app, displayController) {
  this.app = app;
  this.drawer = app.displayController;
    
  this.layerInfo = new Map();
  
  this.lineContainer = new THREE.Group();
  this.mcContainer = new THREE.Group();
  this.showingLines = false;
  this.showingMc = false;
  
  // all grid lines at x = p.x
  this.xline = new Map();
  // all grid lines at z = p.z
  this.zline = new Map();
  
  this.isJoinFaces = false;
  
  this.fullRenderTimeMs = 0;
  
  // I use push and pop to reuse blocks
  this.mcBlockCache = [];
}

BlockDrawer.prototype.init = function() {
  this.container = this.drawer.offsetter;
  this.container.add(this.lineContainer);
  this.showingLines = true;
}

BlockDrawer.prototype.reset = function() {
  this.xline.clear();
  this.zline.clear();
  
  while(this.lineContainer.children.length >0) this.lineContainer.remove(this.lineContainer.children[0]);
  while(this.mcContainer.children.length >0) {
    this.mcContainer.remove(this.mcContainer.children[0]);
  }
  
  for(i in uniquePoint) {
    for(j in uniquePoint[i]) {
      var col = uniquePoint[i][j].mcColumn;
      if(col) {
        while(col.children.length >0) {
          var block = col.children[0]
          col.remove(block);
          this.mcBlockCache.push(block);
        }
      }
    }
  }

}

BlockDrawer.prototype.blockShape = new THREE.BoxGeometry(7/8, 7/8, 7/8);

BlockDrawer.prototype.anchorShape = new THREE.OctahedronGeometry(7/8/2);

BlockDrawer.prototype.mcMaterial = new THREE.MeshLambertMaterial({
  transparent : true,
  opacity : .8,
  color : 0xD0F0D0// 0x80A0C0 //0x2194ce
});

BlockDrawer.prototype.anchorMaterial = new THREE.MeshLambertMaterial({
  // transparent : true,
  // opacity : .9,
  color : 0xFF4040
});

BlockDrawer.prototype.gridMaterial = new THREE.LineBasicMaterial({ color: 0xFFFF00, linewidth: 3 });

BlockDrawer.prototype.anchorMesh = function() { return new THREE.Mesh(this.anchorShape, this.anchorMaterial); }

BlockDrawer.prototype.mcBlockMesh = function() { 
  var mesh = this.mcBlockCache.pop();
  if(mesh) 
    return mesh;
  else
    return new THREE.Mesh(this.blockShape, this.mcMaterial); 
}

BlockDrawer.prototype.getMcColumn = function(p) {

  if(!p.mcColumn) {
    var g = new THREE.Group();
    g.position.x = p.x;
    g.position.z = p.z;
    p.mcColumn = g;
  }
  return p.mcColumn;  
}

BlockDrawer.prototype.getMcComputed = function(p) {
  if(!p.mcComputed) {
    var o = {x: p.x, z: p.z, maxX: 0, minY: 0};
    p.mcComputed = o;
  }
  return p.mcComputed;  
}

BlockDrawer.prototype.surfaceUpdateAll = function() {
  this.reset();
  
  var startRender = new Date().getTime();
  
  var c = this;
  if(this.showingMc) {
    this.app.blocks.forEach(function (p) {
      c.rebuildMcColumn(p);
    });
  }
  
  if(this.showingLines) {
    this.xline.clear();
    this.zline.clear();
    
    for(var x = this.app.bounds.min.x; x <= this.app.bounds.max.x; x++) {
      this.rebuildXline(x);
    }
    
    for(var z = this.app.bounds.min.z; z <= this.app.bounds.max.z; z++) {
      this.rebuildZline(z);
    }
  }
  
  this.fullRenderTimeMs = new Date().getTime() - startRender;
  $(this.app.element).find("#render-time").text(this.fullRenderTimeMs);
  
  this.drawer.updateCamera();
}

BlockDrawer.prototype.rebuildXline = function(x) {
  if(!this.xline.has(x)) {
    this.xline.set(x, new Set());
  }
  var xline = this.xline.get(x);
  
  var thegeom = null;
  
  for(var z = this.app.bounds.min.z; z <= this.app.bounds.max.z; z++) {
    var p = up(x,z);
    if(this.app.blocks.has(p)) {
      if(!thegeom) {
        thegeom = new THREE.Geometry();
      }
      thegeom.vertices.push(p);
    }
    else {
      if(thegeom) {
        var theline = new THREE.Line(thegeom, this.gridMaterial);
        xline.add(theline);
        this.lineContainer.add(theline);
        thegeom = null;
      }
    }
  }
  if(thegeom) {
    var theline = new THREE.Line(thegeom, this.gridMaterial);
    xline.add(theline);
    this.lineContainer.add(theline);
    thegeom = null;
  }
  
}

BlockDrawer.prototype.rebuildZline = function(z) {
  if(!this.zline.has(z)) {
    this.zline.set(z, new Set());
  }
  var zline = this.zline.get(z);
  
  var thegeom = null;
  
  for(var x = this.app.bounds.min.x; x <= this.app.bounds.max.x; x++) {
    var p = up(x,z);
    if(this.app.blocks.has(p)) {
      if(!thegeom) {
        thegeom = new THREE.Geometry();
      }
      thegeom.vertices.push(p);
    }
    else {
      if(thegeom) {
        var theline = new THREE.Line(thegeom, this.gridMaterial);
        zline.add(theline);
        this.lineContainer.add(theline);
        thegeom = null;
      }
    }
  }
  
  if(thegeom) {
    var theline = new THREE.Line(thegeom, this.gridMaterial);
    zline.add(theline);
    this.lineContainer.add(theline);
    thegeom = null;
  }
  
}

BlockDrawer.prototype.rebuildMcColumn = function(p) {
  var col = this.getMcColumn(p);

  while(col.children.length > 0) {
    var block = col.children[0]
    col.remove(block);
    this.mcBlockCache.push(block);
  }
  
  if(!this.app.blocks.has(p)) {
    this.mcContainer.remove(col);
    return;
  }
  
  this.mcContainer.add(col);
  
  var thisY = p.y;
  var maxY = thisY;
  var minY = thisY;
  
  if(this.app.blocks.has(up(p.x+1,p.z))) {
    var y = (up(p.x+1,p.z).y + thisY) /2;
    maxY = Math.max(maxY, y);
    minY = Math.min(minY, y);
  }
  if(this.app.blocks.has(up(p.x-1,p.z))) {
    var y = (up(p.x-1,p.z).y + thisY) /2;
    maxY = Math.max(maxY, y);
    minY = Math.min(minY, y);
  }
  if(this.app.blocks.has(up(p.x,p.z+1))) {
    var y = (up(p.x,p.z+1).y + thisY) /2;
    maxY = Math.max(maxY, y);
    minY = Math.min(minY, y);
  }
  if(this.app.blocks.has(up(p.x,p.z-1))) {
    var y = (up(p.x,p.z-1).y + thisY) /2;
    maxY = Math.max(maxY, y);
    minY = Math.min(minY, y);
  }
  
  var floorY;
  var ceilY;
  
  var floorYhs;
  var ceilYhs;
  
  if(this.isJoinFaces) {
    floorY = Math.round(minY);
    ceilY = Math.round(maxY);
  }
  else {
    floorY = Math.round(minY+.499);
    ceilY = Math.round(maxY-.499);
  }

  floorY = Math.min(floorY, Math.round(thisY));
  ceilY = Math.max(ceilY, Math.round(thisY));
  
  floorY = Math.max(floorY, -512);
  ceilY = Math.min(ceilY, 512);
  
  for(y=floorY; y<=ceilY; y++) {
    var m = this.mcBlockMesh();
    m.position.y = y;
    col.add(m);
  }
  
  this.getMcComputed(p).minY = floorY;
  this.getMcComputed(p).maxY = ceilY;
  
}

BlockDrawer.prototype.surfaceUpdate = function(p, added) {
  if(this.showingMc) {
    if(added) {
      this.mcContainer.add(this.getMcColumn(p));
      this.rebuildMcColumn(p);
    }
    else {
      this.mcContainer.remove(this.getMcColumn(p));
    }
  }

  if(this.showingLines) {
    if(!this.xline.has(p.x)) {
      this.xline.set(p.x, new Set());
    }
    var xline = this.xline.get(x);
    
    if(!this.zline.has(p.z)) {
      this.zline.set(p.z, new Set());
    }
    var zline = this.zline.get(z);
  
    var c = this;
    xline.forEach(function(l){c.lineContainer.remove(l);});
    zline.forEach(function(l){c.lineContainer.remove(l);});
    xline.clear();
    zline.clear();
    this.rebuildXline(p.x);
    this.rebuildZline(p.z);
  }
  
  this.drawer.updateCamera();
}

BlockDrawer.prototype.surfaceUpdateY = function(p) {
  if(this.showingMc) {
    this.rebuildMcColumn(p);
  }
  this.drawer.repaint();
}


BlockDrawer.prototype.joinFaces = function(v) {
  this.isJoinFaces = v;
  this.surfaceUpdateAll();
}

BlockDrawer.prototype.showLines = function(v) {
  
  this.showingLines = v;
  
  if(v) {
    this.container.add(this.lineContainer);
  }
  else {
    this.container.remove(this.lineContainer);
  }
  this.surfaceUpdateAll();
}

BlockDrawer.prototype.showMinecraftBlocks = function(v) {
  this.showingMc = v;
  if(v) {
    this.container.add(this.mcContainer);
  }
  else {
    this.container.remove(this.mcContainer);
  }
  this.surfaceUpdateAll();
}


BlockDrawer.prototype.layerBlockUpdate = function(layer, p, added) {
  if(!this.layerInfo.has(layer)) this.layerInfo.set(layer, new this.LayerInfo(this, layer));
  this.layerInfo.get(layer).layerBlockUpdate(p, added);
  this.drawer.repaint();
}

BlockDrawer.prototype.layerAllUpdated = function(layer) {
  if(!this.layerInfo.has(layer)) this.layerInfo.set(layer, new this.LayerInfo(this, layer));
  this.layerInfo.get(layer).layerAllUpdated();
  this.drawer.repaint();
}

BlockDrawer.prototype.layerAdded = function(layer) {
  if(!this.layerInfo.has(layer)) this.layerInfo.set(layer, new this.LayerInfo(this, layer));
  this.layerInfo.get(layer).layerAdded();
  this.drawer.repaint();
}

BlockDrawer.prototype.layerRemoved = function(layer) {
  if(!this.layerInfo.has(layer)) this.layerInfo.set(layer, new this.LayerInfo(this, layer));
  this.layerInfo.get(layer).layerRemoved();
  this.layerInfo.delete(layer);
  this.drawer.repaint();
}

BlockDrawer.prototype.layerEnabled = function(layer, enabled) {
  if(!this.layerInfo.has(layer)) this.layerInfo.set(layer, new this.LayerInfo(this, layer));
  this.layerInfo.get(layer).layerEnabled(enabled);
  this.drawer.repaint();
}

BlockDrawer.prototype.layerUpdatedYvalues = function(layer) {
  if(!this.layerInfo.has(layer)) this.layerInfo.set(layer, new this.LayerInfo(this, layer));
  this.layerInfo.get(layer).layerUpdatedYvalues();
  this.drawer.repaint();
}


BlockDrawer.prototype.LayerInfo = function(drawer, layer) {
	this.drawer = drawer;
	this.layer = layer;
	this.app = drawer.app;
	this.container = drawer.container;
	
	this.group = new THREE.Group();
	
	this.cubes = new Map();
}


BlockDrawer.prototype.LayerInfo.prototype.layerBlockUpdate = function(p, added) {
	if(added) {
		var cube = this.drawer.anchorMesh();
		cube.position.x = p.x;
		cube.position.z = p.z;
		cube.position.y = this.layer.getY(p);
		this.cubes.set(p, cube);
		this.group.add(cube);
	}
	else {
		this.group.remove(this.cubes.get(p));
		this.cubes.delete(p);
	}
}

BlockDrawer.prototype.LayerInfo.prototype.layerAdded = function() {
	this.container.add(this.group);
}

BlockDrawer.prototype.LayerInfo.prototype.layerRemoved = function() {
	this.container.remove(this.group);
}

BlockDrawer.prototype.LayerInfo.prototype.layerEnabled = function(enabled) {
	if(enabled) {
		this.container.add(this.group);
	}
	else {
		this.container.remove(this.group);
	}
}

BlockDrawer.prototype.LayerInfo.prototype.layerUpdatedYvalues = function() {
  var c = this;
  this.cubes.forEach(function(cube,p) {
      cube.position.y = c.layer.getY(p);
  });
}

BlockDrawer.prototype.LayerInfo.prototype.layerAllUpdated = function() {
  while(this.group.children.length > 0) {
    this.group.remove(this.group.children[0]);
  }
  this.cubes.clear();
  
  var c = this;
  this.layer.blocks.forEach(function(p){
    var cube = c.drawer.anchorMesh();
    cube.position.x = p.x;
    cube.position.z = p.z;
    cube.position.y = c.layer.getY(p);
    c.cubes.set(p, cube);
    c.group.add(cube);
  });
}


console.log("BlockDrawer.js ok");

