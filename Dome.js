console.log("Dome.js start");




$(function() {
  console.log("initialization");
  
});

function ctl(e) {
  while(e) {
    if(e.controller) return e.controller;
    e = e.parentNode;
  }
  return null;
}

function addLayer() {
  console.log("add layer");
  
  var layer = $(".layer.template").clone(true, true);
  layer.removeClass("template");
  layer = layer[0];
  layer.controller = new Layer(layer);
  
  $("#layers").prepend(layer);
}

var layeridx = 1;
function Layer(element) {
  this.idx = layeridx++;
  this.element = element;
}

function test(t) {
  console.log("test");
  console.log(ctl(t).idx);
}

console.log("Dome.js ok");
