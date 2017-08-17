/**
 * Copyright Ⓒ 2017 Paul Murray pmurray@bigpond.com
 * Minecraft Dome by Paul Murray is licensed under a 
 * Creative Commons Attribution 4.0 International License.
 * http://creativecommons.org/licenses/by/4.0/
 */

console.log("Display.js start");

function Display(element, app) {
  this.element = element;
  this.app = app;
  this.theta = Math.PI/6;
  this.phi = Math.PI/6;
  this.r = 20;

  $(element).find(".display-controls .spanbutton").each(function(i, e) {
    e.controller = new ContinuousButton(e);
  });

}

Display.prototype.init = function() {
  var c = this;
  
  c.container = $(this.element).find(".display-content")[0];

  c.scene = new THREE.Scene();
  c.scene.background = new THREE.Color(0x607060); // 0xf8f8f8);

  c.camera = new THREE.PerspectiveCamera(10, 1, 1, 200);
  

  c.renderer = new THREE.WebGLRenderer();
  c.renderer.setSize(50, 50);
  c.container.appendChild(c.renderer.domElement);

  $(c.renderer.domElement).width($(c.container).width());
  $(c.renderer.domElement).height($(c.container).height());

  $(c.renderer.domElement).addClass("ui-widget-content");

  $(c.renderer.domElement).resizable({
    resize : $.proxy(this.resizeFunc, this)
  });

  c.rotator = new THREE.Group();
  c.scene.add(c.rotator);
  
  c.offsetter = new THREE.Group();
  c.rotator.add(c.offsetter);
  
  var light = new THREE.AmbientLight(0x404040); // soft white light
  //c.scene.add(light);

  var directionalLight = new THREE.DirectionalLight(0xE0E0E0, .75); // white light over the left shoulder
  directionalLight.position.x = -1;
  directionalLight.position.y = 1;
  directionalLight.position.z = 1;
  c.scene.add( directionalLight );  


  var directionalLight = new THREE.DirectionalLight(0xF0F0C0, .75); // slightly yellow light over the right shoulder
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = 1;
  c.scene.add( directionalLight );  

  directionalLight = new THREE.DirectionalLight(0xA0A0F0, .75); // slightly blue light above and to the back
  directionalLight.position.x = 0;
  directionalLight.position.y = 1;
  directionalLight.position.z = -Math.sqrt(3)/2;  // 60 degrees
  c.scene.add( directionalLight );  

//  var hlight = new THREE.HemisphereLight( 0xbbddff, 0x080820, .5 );
//  c.scene.add( hlight );  
  
  this.updateCamera();
  this.resizeFunc();
  this.repaint();
  

  $(this.element).find(".display-controls .spanbutton").each(function(i, e) {
    e.controller.init();
  });

  $(this.element).find(".display-controls #display-ccw")[0].controller.onTick = $
      .proxy(this.ccwTick, this);
  $(this.element).find(".display-controls #display-up")[0].controller.onTick = $
      .proxy(this.upTick, this);
  $(this.element).find(".display-controls #display-down")[0].controller.onTick = $
      .proxy(this.downTick, this);
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

Display.prototype.updateCamera = function() {
  this.offsetter.position.x = -this.app.bounds.c.x;
  this.offsetter.position.y = -this.app.bounds.c.y;
  this.offsetter.position.z = -this.app.bounds.c.z;
  
  this.camera.position.x = 0;
  this.camera.position.z = this.r * Math.cos(this.phi);
  this.camera.position.y = this.r * Math.sin(this.phi);
  
  this.camera.lookAt(new THREE.Vector3(0,0,0));
  
  this.camera.updateProjectionMatrix();
  this.repaint();
}

Display.prototype.repaint = function() {
  this.renderer.render(this.scene, this.camera);
}

Display.prototype.ccwTick = function() {
  var m = new THREE.Matrix4();
  m.makeRotationY(2 * Math.PI / 50);
  this.rotator.applyMatrix(m);
  this.repaint();
}

Display.prototype.cwTick = function() {
  var m = new THREE.Matrix4();
  m.makeRotationY(-2 * Math.PI / 50);
  this.rotator.applyMatrix(m);
  this.repaint();
}

Display.prototype.upTick = function() {
  this.phi -= 2 * Math.PI / 50;
  if(this.phi < -Math.PI/2) this.phi = -Math.PI/2;
  this.updateCamera();
}

Display.prototype.downTick = function() {
  this.phi += 2 * Math.PI / 50;
  if(this.phi > Math.PI/2 ) this.phi = Math.PI/2 ;
  this.updateCamera();
}


Display.prototype.fwdTick = function() {
  this.r -= 1;
  if(this.r < this.app.bounds.diagonal/2+1) this.r = this.app.bounds.diagonal/2+1;
  this.updateCamera();
}

Display.prototype.backTick = function() {
  this.r += 1;
  if(this.r > this.app.bounds.diagonal * 20) {
    this.r = this.app.bounds.diagonal * 20;
  }
  this.updateCamera();
}

Display.prototype.minusTick = function() {
  if (this.camera.fov < 145) {
    this.camera.fov += 5;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }
}

Display.prototype.plusTick = function() {
  if (this.camera.fov > 20) {
    this.camera.fov -= 5;
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
