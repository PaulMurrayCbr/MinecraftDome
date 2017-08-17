/**
 * Copyright Ⓒ 2017 Paul Murray pmurray@bigpond.com
 * Minecraft Dome by Paul Murray is licensed under a 
 * Creative Commons Attribution 4.0 International License.
 * http://creativecommons.org/licenses/by/4.0/
 */

console.log("BlockDrawer.js start");

function BlockDrawer(app, displayController) {
  this.app = app;
  this.drawer = app.displayController;
    
  this.layerInfo = new Map();
  
  this.blocks = new Map();
  this.blockContainer = new THREE.Group();
  this.lineContainer = new THREE.Group();
  this.mcContainer = new THREE.Group();
  
  // for each surface point, maintain a Vector3 for it
  this.pointVec = new Map();
  // all grid lines at x = p.x
  this.xline = new Map();
  // all grid lines at z = p.z
  this.zline = new Map();
  
  this.mcColumns = new Map();
  
  this.isUseHalfSlabs = false;
  this.isJoinFaces = false;
  
  
}



BlockDrawer.prototype.init = function() {
  this.container = this.drawer.offsetter;
  this.container.add(this.blockContainer);
  this.container.add(this.lineContainer);
}

BlockDrawer.prototype.reset = function() {
  this.blocks.clear();
  this.pointVec.clear();
  this.xline.clear();
  this.zline.clear();
  //this.mcColumns.clear();
  
  while(this.blockContainer.children.length >0) this.blockContainer.remove(this.blockContainer.children[0]);
  while(this.lineContainer.children.length >0) this.lineContainer.remove(this.lineContainer.children[0]);
  //while(this.mcContainer.children.length >0) this.mcContainer.remove(this.mcContainer.children[0]);
}

BlockDrawer.prototype.blockShape = new THREE.BoxGeometry(7/8, 7/8, 7/8);

BlockDrawer.prototype.uSlabShape = new THREE.BoxGeometry(7/8, 7/16, 7/8);
BlockDrawer.prototype.uSlabShape.translate(0,7/32,0); // line up the top surface

BlockDrawer.prototype.lSlabShape = new THREE.BoxGeometry(7/8, 7/16, 7/8);
BlockDrawer.prototype.lSlabShape.translate(0,-7/32,0); // line up the bottom surface

BlockDrawer.prototype.anchorShape = new THREE.OctahedronGeometry(7/8/2);

BlockDrawer.prototype.blockMaterial = new THREE.MeshLambertMaterial({
  transparent : true,
  opacity : .6,
  color : 0xD0D0F0// 0x80A0C0 //0x2194ce
});

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

BlockDrawer.prototype.blockMesh = function() { return new THREE.Mesh(this.blockShape, this.blockMaterial); }

BlockDrawer.prototype.anchorMesh = function() { return new THREE.Mesh(this.anchorShape, this.anchorMaterial); }

BlockDrawer.prototype.mcBlockMesh = function() { return new THREE.Mesh(this.blockShape, this.mcMaterial); }
BlockDrawer.prototype.mcUHSMesh = function() { return new THREE.Mesh(this.uSlabShape, this.mcMaterial); }
BlockDrawer.prototype.mcLHSMesh = function() { return new THREE.Mesh(this.lSlabShape, this.mcMaterial); }


BlockDrawer.prototype.getPointVec = function(p) {
  if(!this.pointVec.has(p)) {
    var v = new THREE.Vector3(p.x, 0, p.z);
    this.pointVec.set(p, v);
  }
  return this.pointVec.get(p);  
}

BlockDrawer.prototype.getMcColumn = function(p) {
  if(!this.mcColumns.has(p)) {
    var g = new THREE.Group();
    g.position.x = p.x;
    g.position.z = p.z;
    this.mcColumns.set(p, g);
  }
  return this.mcColumns.get(p);  
}

BlockDrawer.prototype.getSurfaceBlock = function(p) {
  if(!this.blocks.has(p)) {
    var block =  this.blockMesh();
    this.blocks.set(p, block);
    block.position.x = p.x;
    block.position.z = p.z;
  }
  return this.blocks.get(p);  
}

BlockDrawer.prototype.surfaceUpdateAll = function(blocks) {
  while(this.blockContainer.children.length > 0) {
    this.blockContainer.remove(this.blockContainer.children[0]);
  }
  while(this.lineContainer.children.length > 0) {
    this.lineContainer.remove(this.lineContainer.children[0]);
  }
  
  var c = this;
  this.app.blocks.forEach(function (p) {
    var block = c.getSurfaceBlock(p);
    block.position.y = c.app.getY(p);
    c.blockContainer.add(block);
    var v = c.getPointVec(p);
    v.y = c.app.getY(p);
    
    c.rebuildMcColumn(p);
    
    
  });
  
  
  this.xline.clear();
  this.zline.clear();
  
  for(var x = this.app.bounds.min.x; x <= this.app.bounds.max.x; x++) {
    this.rebuildXline(x);
  }
  
  for(var z = this.app.bounds.min.z; z <= this.app.bounds.max.z; z++) {
    this.rebuildZline(z);
  }
  
  
  
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
      thegeom.vertices.push(this.getPointVec(p));
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
      thegeom.vertices.push(this.getPointVec(p));
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
    col.remove(col.children[0]);
  }
  
  if(!this.app.blocks.has(p)) {
    this.mcContainer.remove(col);
    return;
  }
  
  this.mcContainer.add(col);
  
  var thisY = this.app.getY(p);
  var maxY = thisY;
  var minY = thisY;
  
  if(this.app.blocks.has(up(p.x+1,p.z))) {
    var y = (this.app.getY(up(p.x+1,p.z)) + thisY) /2;
    maxY = Math.max(maxY, y);
    minY = Math.min(minY, y);
  }
  if(this.app.blocks.has(up(p.x-1,p.z))) {
    var y = (this.app.getY(up(p.x-1,p.z)) + thisY) /2;
    maxY = Math.max(maxY, y);
    minY = Math.min(minY, y);
  }
  if(this.app.blocks.has(up(p.x,p.z+1))) {
    var y = (this.app.getY(up(p.x,p.z+1)) + thisY) /2;
    maxY = Math.max(maxY, y);
    minY = Math.min(minY, y);
  }
  if(this.app.blocks.has(up(p.x,p.z-1))) {
    var y = (this.app.getY(up(p.x,p.z-1)) + thisY) /2;
    maxY = Math.max(maxY, y);
    minY = Math.min(minY, y);
  }
  
  var floorY;
  var ceilY;
  
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
  
  for(y=floorY; y<=ceilY; y++) {
    var m = this.mcBlockMesh();
    m.position.y = y;
    col.add(m);
  }
  
  
}

BlockDrawer.prototype.surfaceUpdate = function(p, added) {
  var block = this.getSurfaceBlock(p);
  if(added) {
    block.position.y = this.app.getY(p);
    this.blockContainer.add(block);
    this.mcContainer.add(this.getMcColumn(p));
    this.rebuildMcColumn(p);
  }
  else {
    this.mcContainer.remove(this.getMcColumn(p));
    this.blockContainer.remove(block);
  }

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
  
  this.drawer.updateCamera();
}

BlockDrawer.prototype.surfaceUpdateY = function(p) {
  var block = this.getSurfaceBlock(p);
  block.position.y = this.app.getY(p);
  
  var v = this.getPointVec(p);
  p.y = this.app.getY(p);
  
  this.drawer.repaint();
}


BlockDrawer.prototype.useHalfSlabs = function(v) {
    this.isUseHalfSlabs = v;
    this.surfaceUpdateAll();
}

BlockDrawer.prototype.joinFaces = function(v) {
  this.isJoinFaces = v;
  this.surfaceUpdateAll();
}

BlockDrawer.prototype.showIdealBlocks = function(v) {
  if(v) {
    this.container.add(this.blockContainer);
  }
  else {
    this.container.remove(this.blockContainer);
  }
  this.drawer.repaint();
}

BlockDrawer.prototype.showLines = function(v) {
  if(v) {
    this.container.add(this.lineContainer);
  }
  else {
    this.container.remove(this.lineContainer);
  }
  this.drawer.repaint();
  
}

BlockDrawer.prototype.showMinecraftBlocks = function(v) {
  if(v) {
    this.container.add(this.mcContainer);
  }
  else {
    this.container.remove(this.mcContainer);
  }
  this.drawer.repaint();
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

