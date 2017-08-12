console.log("Display.js start");

function Display(element, app) {
  this.element = element;
  this.app = app;
  
  $(element).find(".display-controls .spanbutton").each(function(i, e) {
    e.controller = new ContinuousButton(e);
  });

}

Display.prototype.init = function() {
  var c = this;

  
  
  c.container = $(this.element).find(".display-content")[0];

  c.scene = new THREE.Scene();
  c.scene.background = new THREE.Color(0xf8f8f8);

  c.camera = new THREE.PerspectiveCamera(10, 1, 1, 200);
  c.camera.position.z = 50;
  this.camera.updateProjectionMatrix();
  

  c.renderer = new THREE.WebGLRenderer();
  c.renderer.setSize(50, 50);
  c.container.appendChild(c.renderer.domElement);

  $(c.renderer.domElement).width($(c.container).width());
  $(c.renderer.domElement).height($(c.container).height());

  $(c.renderer.domElement).addClass("ui-widget-content");

  $(c.renderer.domElement).resizable({
    resize : $.proxy(this.resizeFunc, this)
  });

  var geometry = new THREE.BoxGeometry(1, 1, 1);

  var material = new THREE.MeshLambertMaterial({
    transparent : true,
    opacity : .9,
    color : 0x2194ce
  });

  for (var x = 0; x <= 3; x += 2)
    for (var y = -3; y <= 3; y += 2)
      for (var z = -2; z <= 0; z += 2) {
        var cube = new THREE.Mesh(geometry, material);
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        c.scene.add(cube);
      }

  var light = new THREE.AmbientLight(0x404040); // soft white light
  c.scene.add(light);

  hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 500, 0);
  c.scene.add(hemiLight);

  this.resizeFunc();

  $(this.element).find(".display-controls .spanbutton").each(function(i, e) {
    e.controller.init();
  });

  $(this.element).find(".display-controls #display-ccw")[0].controller.onTick = $
      .proxy(this.ccwTick, this);
  $(this.element).find(".display-controls #display-left")[0].controller.onTick = $
      .proxy(this.leftTick, this);
  $(this.element).find(".display-controls #display-up")[0].controller.onTick = $
      .proxy(this.upTick, this);
  $(this.element).find(".display-controls #display-down")[0].controller.onTick = $
      .proxy(this.downTick, this);
  $(this.element).find(".display-controls #display-right")[0].controller.onTick = $
      .proxy(this.rightTick, this);
  $(this.element).find(".display-controls #display-cw")[0].controller.onTick = $
      .proxy(this.cwTick, this);
  $(this.element).find(".display-controls #display-fwd")[0].controller.onTick = $
      .proxy(this.fwdTick, this);
  $(this.element).find(".display-controls #display-back")[0].controller.onTick = $
      .proxy(this.backTick, this);
  $(this.element).find(".display-controls #display-plus")[0].controller.onTick = $
      .proxy(this.plusTick, this);
  $(this.element).find(".display-controls #display-minus")[0].controller.onTick = $
      .proxy(this.minusTick, this);
}

Display.prototype.resizeFunc = function(event, ui) {
  // resize the canvas pixels - not the same as the canvas size!
  this.renderer.domElement.width = $(this.renderer.domElement).width();
  this.renderer.domElement.height = $(this.renderer.domElement).height();
  // let the renderer itself know that th canvas has changed size
  this.renderer.setSize($(this.renderer.domElement).width(), $(
      this.renderer.domElement).height());

  this.camera.aspect = $(this.renderer.domElement).width()
      / $(this.renderer.domElement).height();
  this.camera.updateProjectionMatrix();
  this.renderer.render(this.scene, this.camera);
}

Display.prototype.ccwTick = function() {
  var q = new THREE.Quaternion();
  q.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), -Math.PI / 2 / 60 );
  this.camera.quaternion.multiply(q);
  
  relpos = new THREE.Vector3(
 (this.app.bounds.max.x + this.app.bounds.min.x)/2 - this.camera.x,
   (this.app.bounds.max.y + this.app.bounds.min.y)/2- this.camera.y,
   (this.app.bounds.max.z + this.app.bounds.min.z)/2- this.camera.z);
  
  relpos.applyQuaternion(q);

  this.camera.x = (this.app.bounds.max.x + this.app.bounds.min.x)/2 - relpos.x;
  this.camera.y = (this.app.bounds.max.y + this.app.bounds.min.y)/2 - relpos.y;
  this.camera.z = (this.app.bounds.max.z + this.app.bounds.min.z)/2 - relpos.z;
  
  this.renderer.render(this.scene, this.camera);

}

Display.prototype.leftTick = function() {
  var offs = new THREE.Vector3(.25,0,0);
  offs.applyQuaternion(this.camera.quaternion);
  
  this.camera.position.x += offs.x;
  this.camera.position.y += offs.y;
  this.camera.position.z += offs.z;
  this.camera.updateProjectionMatrix();
  this.renderer.render(this.scene, this.camera);
}

Display.prototype.upTick = function() {
  var offs = new THREE.Vector3(0,-.25,0);
  offs.applyQuaternion(this.camera.quaternion);
  
  this.camera.position.x += offs.x;
  this.camera.position.y += offs.y;
  this.camera.position.z += offs.z;
  this.camera.updateProjectionMatrix();
  this.renderer.render(this.scene, this.camera);

}

Display.prototype.downTick = function() {
  var offs = new THREE.Vector3(0,.25,0);
  offs.applyQuaternion(this.camera.quaternion);
  
  this.camera.position.x += offs.x;
  this.camera.position.y += offs.y;
  this.camera.position.z += offs.z;
  this.camera.updateProjectionMatrix();
  this.renderer.render(this.scene, this.camera);

}

Display.prototype.rightTick = function() {
  var offs = new THREE.Vector3(-.25,0,0);
  offs.applyQuaternion(this.camera.quaternion);
  
  this.camera.position.x += offs.x;
  this.camera.position.y += offs.y;
  this.camera.position.z += offs.z;
  this.camera.updateProjectionMatrix();
  this.renderer.render(this.scene, this.camera);

}

Display.prototype.cwTick = function() {
  var q = new THREE.Quaternion();
  q.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 / 60 );
  this.camera.quaternion.multiply(q);
  this.renderer.render(this.scene, this.camera);
}

Display.prototype.fwdTick = function() {
  var offs = new THREE.Vector3(0,0,.25);
  offs.applyQuaternion(this.camera.quaternion);
  
  this.camera.position.x += offs.x;
  this.camera.position.y += offs.y;
  this.camera.position.z += offs.z;
  this.camera.updateProjectionMatrix();
  this.renderer.render(this.scene, this.camera);
}

Display.prototype.backTick = function() {
  var offs = new THREE.Vector3(0,0,-.25);
  offs.applyQuaternion(this.camera.quaternion);
  
  this.camera.position.x += offs.x;
  this.camera.position.y += offs.y;
  this.camera.position.z += offs.z;
  this.camera.updateProjectionMatrix();
  this.renderer.render(this.scene, this.camera);
}

Display.prototype.minusTick = function() {
  if (this.camera.fov < 145) {
    this.camera.fov *= 1.1;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }
}

Display.prototype.plusTick = function() {
  if (this.camera.fov > 20) {
    this.camera.fov /= 1.1;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }
}

function ContinuousButton(element) {
  this.element = element;

}

ContinuousButton.prototype.init = function() {
  this.ticking = false;

  this.tickProxy = $.proxy(this.possibleTick, this);

  $(this.element).mouseout($.proxy(this.mouseOut, this));
  $(this.element).mousedown($.proxy(this.mouseDown, this));
  $(this.element).mouseup($.proxy(this.mouseUp, this));
}

ContinuousButton.prototype.mouseOut = function() {
  this.ticking = false;
}

ContinuousButton.prototype.mouseDown = function() {
  this.ticking = true;
  this.tickProxy();
}

ContinuousButton.prototype.mouseUp = function() {
  this.ticking = false;
}

ContinuousButton.prototype.possibleTick = function() {
  if (this.ticking) {
    this.onTick();
    window.setTimeout(this.tickProxy, 50);
  }
}

ContinuousButton.prototype.onTick = function() {
  console.log("tick!");
}

console.log("Display.js ok");
