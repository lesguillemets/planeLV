// globals {{{
var size=400;
var initialPopMax = 10;
var aColour = "#ffaa00";
var bColour = "#00aaFF";
var gridSize = 2;
// }}}

// {{{ SETUP
function setUp(wCanv0,wCanv1,gCanv){
  var _w = {
    alpha:1, beta:2, k0:1, k1:3,
    r0:1, r1:3,
    w0:undefined, maxw0: 0,
    w1:undefined, maxw1: 0,
    wCanv0 : wCanv0, wCanv1 : wCanv1, gCanv : gCanv
  };
  // prepare contexts
  _w['wCtx0'] = wCanv0.getContext('2d');
  _w['wCtx1'] = wCanv1.getContext('2d');
  _w['gCtx'] = gCanv.getContext('2d');
  // initialise population
  var w0 = new Array(size);
  var w1 = new Array(size);
  for (var i=0; i<size;i++){
    w0[i] = new Array(size);
    w1[i] = new Array(size);
    for(var j=0; j<size; j++){
      // initialise with a random value
      var w0ij = Math.floor(Math.random()*initialPopMax);
      w0[i][j] = w0ij;
      if (w0ij > _w.maxw0) { _w.maxw0 = w0ij ;}
      var w1ij = Math.floor(Math.random()*initialPopMax);
      w1[i][j] = w1ij;
      if (w1ij > _w.maxw1) { _w.maxw1 = w1ij ;}
    }
  }
  _w.w0 = w0;
  _w.w1 = w1;
  return _w;
}
// }}}

// showWorld {{{
function showWorld(w){
  var m0 = w.maxw0;
  var m1 = w.maxw1;
  for (var i=0; i<size;i++){
    for(var j=0; j<size; j++){
      // draw for A
      w.wCtx0.fillStyle = "rgba(" + (w.w0[i][j]*255/m0) + ",0,0,0.5)";
      w.wCtx0.fillRect(i*gridSize,j*gridSize,gridSize,gridSize);
      // draw for B
      w.wCtx1.fillStyle = "rgba(0," + (w.w1[i][j]*255/m1) + ",0,0.5)";
      w.wCtx1.fillRect(i*gridSize,j*gridSize,gridSize,gridSize);
    }
  }
} // }}}


function mainLoop(w){
  showWorld(w);
}

function main(){
  var wCanv0 = document.getElementById("world0");
  var wCanv1 = document.getElementById("world1");
  var gCanv = document.getElementById("graph");
  var _w = setUp(wCanv0, wCanv1, gCanv);
  mainLoop(_w);
}

window.onload = main;
