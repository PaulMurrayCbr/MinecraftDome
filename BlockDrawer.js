
console.log("BlockDrawer.js start");

function BlockDrawer(app, displayController) {
  this.app = app;
  this.drawer = app.displayController;
    
  this.layerInfo = new Map();
  
  this.blocks = new Map();
  this.blockContainer = new THREE.Group();
  this.lineContainer = new THREE.Group();
  
  
  // for each surface point, maintain a Vector3 for it
  this.pointVec = new Map();
  // all grid lines at x = p.x
  this.xline = new Map();
  // all grid lines at z = p.z
  this.zline = new Map();
  
}



BlockDrawer.prototype.init = function() {
  this.container = this.drawer.offsetter;
  this.container.add(this.blockContainer);
  this.container.add(this.lineContainer);
}

BlockDrawer.prototype.blockShape = new THREE.BoxGeometry(7/8, 7/8, 7/8);
BlockDrawer.prototype.anchorShape = new THREE.OctahedronGeometry(7/8/2);

BlockDrawer.prototype.blockMaterial = new THREE.MeshLambertMaterial({
  transparent : true,
  opacity : .6,
  color : 0xD0D0F0// 0x80A0C0 //0x2194ce
});

BlockDrawer.prototype.anchorMaterial = new THREE.MeshLambertMaterial({
  // transparent : true,
  // opacity : .9,
  color : 0xFF4040
});

BlockDrawer.prototype.gridMaterial = new THREE.LineBasicMaterial({ color: 0xFFFF00, linewidth: 3 });

BlockDrawer.prototype.blockMesh = function() { return new THREE.Mesh(this.blockShape, this.blockMaterial); }

BlockDrawer.prototype.anchorMesh = function() { return new THREE.Mesh(this.anchorShape, this.anchorMaterial); }

BlockDrawer.prototype.getPointVec = function(p) {
  if(!this.pointVec.has(p)) {
    var v = new THREE.Vector3(p.x, 0, p.z);
    this.pointVec.set(p, v);
  }
  return this.pointVec.get(p);  
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
  blocks.forEach(function (p) {
    var block = c.getSurfaceBlock(p);
    block.position.y = c.app.getY(p);
    c.blockContainer.add(block);
    var v = c.getPointVec(p);
    v.y = c.app.getY(p);
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

BlockDrawer.prototype.surfaceUpdate = function(p, added) {
  var block = this.getSurfaceBlock(p);
  if(added) {
    block.position.y = this.app.getY(p);
    this.blockContainer.add(block);
  }
  else {
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

