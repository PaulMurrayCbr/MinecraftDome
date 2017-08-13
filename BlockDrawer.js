
console.log("BlockDrawer.js start");

function BlockDrawer(app, displayController) {
  this.app = app;
  this.drawer = app.displayController;
}

BlockDrawer.prototype.init = function() {
  this.container = this.drawer.offsetter;
  
  for (var x = 0; x <= 3; x ++)
    for (var y = 0; y <= 3; y ++)
      for (var z = 0; z <= 3; z ++) {
        var cube = this.anchorMesh();
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        this.container.add(cube);
      }


}

BlockDrawer.prototype.blockShape = new THREE.BoxGeometry(.95, .95, .95);

BlockDrawer.prototype.blockMaterial = new THREE.MeshLambertMaterial({
  transparent : true,
  opacity : .6,
  color : 0xF0F0F0// 0x80A0C0 //0x2194ce
});

BlockDrawer.prototype.anchorMaterial = new THREE.MeshLambertMaterial({
  transparent : true,
  opacity : .9,
  color : 0x808080
});

BlockDrawer.prototype.blockMesh = function() { return new THREE.Mesh(this.blockShape, this.blockMaterial); }

BlockDrawer.prototype.anchorMesh = function() { return new THREE.Mesh(this.blockShape, this.anchorMaterial); }

BlockDrawer.prototype.blockUpdate = function(p, added) {
  this.drawer.updateCamera();
}

BlockDrawer.prototype.layerBlockUpdate = function(layer, p, added) {
  this.drawer.repaint();
}

BlockDrawer.prototype.layerAdded = function(layer) {
  this.drawer.repaint();
}

BlockDrawer.prototype.layerRemoved = function(layer) {
  this.drawer.repaint();
}

BlockDrawer.prototype.layerEnabled = function(layer, enabled) {
  this.drawer.repaint();
}

console.log("BlockDrawer.js ok");

