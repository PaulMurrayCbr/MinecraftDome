
console.log("BlockDrawer.js start");

function BlockDrawer(app, displayController) {
  this.app = app;
  this.drawer = app.displayController;
  
  this.layerInfo = new Map();
}

BlockDrawer.prototype.init = function() {
  this.container = this.drawer.offsetter;
  this.blocks = new Map();
  this.blockContainer = new THREE.Group();
  this.container.add(this.blockContainer);
  
// for (var x = 0; x <= 3; x ++)
// for (var y = 0; y <= 3; y ++)
// for (var z = 0; z <= 3; z ++) {
// var cube = (x+y+z)%2==0 ? this.anchorMesh() : this.blockMesh();
// cube.position.x = x;
// cube.position.y = y;
// cube.position.z = z;
// this.container.add(cube);
// }


}

BlockDrawer.prototype.blockShape = new THREE.BoxGeometry(7/8, 7/8, 7/8);
BlockDrawer.prototype.anchorShape = new THREE.OctahedronGeometry(7/8/2);

BlockDrawer.prototype.blockMaterial = new THREE.MeshLambertMaterial({
  transparent : true,
  opacity : .6,
  color : 0xD0D0F0// 0x80A0C0 //0x2194ce
});

BlockDrawer.prototype.anchorMaterial = new THREE.MeshLambertMaterial({
  //transparent : true,
  //opacity : .9,
  color : 0xFF4040
});

BlockDrawer.prototype.blockMesh = function() { return new THREE.Mesh(this.blockShape, this.blockMaterial); }

BlockDrawer.prototype.anchorMesh = function() { return new THREE.Mesh(this.anchorShape, this.anchorMaterial); }

BlockDrawer.prototype.updateAllMask = function(blocks) {
  this.container.remove(this.blockContainer);
  this.blockContainer = new THREE.Group();
  this.container.add(this.blockContainer);
  
  var c = this;
  blocks.forEach(function (p) {
    if(!c.blocks.has(p)) {
      var block =  c.blockMesh();
      c.blocks.set(p, block);
      block.position.x = p.x;
      block.position.z = p.z;
    }
    var block = c.blocks.get(p);
    block.position.y = c.app.getY(p);
    c.blockContainer.add(block);
    
  });
  this.drawer.updateCamera();
}

BlockDrawer.prototype.blockUpdate = function(p, added) {
	if(added) {
		if(!this.blocks.has(p)) {
			var block =  this.blockMesh();
			this.blocks.set(p, block);
			block.position.x = p.x;
			block.position.z = p.z;
		}
		var block = this.blocks.get(p);
		block.position.y = this.app.getY(p);
		this.blockContainer.add(block);
	}
	else {
		if(this.blocks.has(p)) {
			this.blockContainer.remove(this.blocks.get(p));
		}
		
	}
	
  this.drawer.updateCamera();
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

