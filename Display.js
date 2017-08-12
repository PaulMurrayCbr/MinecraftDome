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
