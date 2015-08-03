// globals {{{
var size=200;
var initialPopMax = 10;
var aColour = "#ffaa00";
var bColour = "#00aaFF";
var gridSize = 4;
// draws the world every n steps
var drawEvery = 20;
var dt = 0.01;
var moveRatio = 0.01;
// }}}

// {{{ SETUP
function setUp(wCanv0,wCanv1,gCanv){
  var alpha = 2.0, beta=2.0; k0=200; k1=200; r0=2.0;r1=2.0;
  var _w = {
    alpha:alpha, beta:beta, k0:k0, k1:k1,
    r0:r0, r1:r1,
    w0:undefined, maxw0: 0, totalw0:0,
    w1:undefined, maxw1: 0, totalw1:0,
    wCanv0 : wCanv0, wCanv1 : wCanv1, gCanv : gCanv,
    wCtx0:undefined, wCtx1:undefined, gCtx:undefined,
    f0: undefined, f1:undefined,
    options : { method:"moving", init:"random"}
  };
  // prepare contexts
  _w['wCtx0'] = wCanv0.getContext('2d');
  _w['wCtx1'] = wCanv1.getContext('2d');
  _w['gCtx'] = gCanv.getContext('2d');
  // updaters
  _w.f0 = function(x,y){
    return r0*(1-(x+alpha*y)/k0)*x;
  };
  _w.f1 = function(x,y){
    return r1*(1-(beta*x+y)/k1)*y;
  };
  // initialise population
  var totalw0=0;
  var totalw1=0;
  var w0 = new Array(size);
  var w1 = new Array(size);
  for (var i=0; i<size;i++){
    w0[i] = new Array(size);
    w1[i] = new Array(size);
    for(var j=0; j<size; j++){
      var w0ij, w1ij;
      if (_w.options.init === "random"){
        // initialise with a random value
        w0ij = Math.floor(Math.random()*initialPopMax);
        w1ij = Math.floor(Math.random()*initialPopMax);
      }
      else if (_w.options.init === "rl"){
        if (j < size/2){
          w0ij = 0; w1ij = 10;
        }
        else {
          w1ij = 0; w0ij = 10;
        }
      }
      w0[i][j] = w0ij;
      totalw0 += w0ij;
      if (w0ij > _w.maxw0) { _w.maxw0 = w0ij ;}
      w1[i][j] = w1ij;
      totalw1 += w1ij;
      if (w1ij > _w.maxw1) { _w.maxw1 = w1ij ;}
    }
  }
  _w.w0 = w0;
  _w.w1 = w1;
  _w.totalw0 = totalw0;
  _w.totalw1 = totalw1;
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
      // w.wCtx0.fillStyle = "rgba(" + (Math.floor(w.w0[i][j]*255/m0)) + ",0,0,0.5)";
      // w.wCtx0.fillStyle = "rgb(" + (Math.floor(w.w0[i][j]*255/m0)) + ",0,0)";
      w.wCtx0.fillStyle = "rgb(" + (Math.floor(w.w0[i][j]*255/100)) + ",0,0)";
      w.wCtx0.fillRect(i*gridSize,j*gridSize,gridSize,gridSize/2);
      // draw for B
      // w.wCtx1.fillStyle = "rgba(0," + (Math.floor(w.w1[i][j]*255/m1)) + ",0,0.5)";
      // w.wCtx0.fillStyle = "rgb(0," + (Math.floor(w.w1[i][j]*255/m1)) + ",0)";
      w.wCtx0.fillStyle = "rgb(0," + (Math.floor(w.w1[i][j]*255/100)) + ",0)";
      w.wCtx0.fillRect(i*gridSize,j*gridSize+(gridSize/2),gridSize,gridSize/2);
    }
  }
} // }}}

function drawGraph(w){
  // shift towards right
  var gCanv = w.gCanv;
  var buf = document.createElement('canvas');
  buf.width = gCanv.width; buf.height = gCanv.height;
  buf.getContext('2d').drawImage(gCanv,0,0);
  gCanv.width = gCanv.width;
  w.gCtx.drawImage(buf,1,0);
  w.gCtx.fillStyle = "#ff0000";
  w.gCtx.fillRect(0,Math.floor(gCanv.height-w.totalw0/(5000)),1,1);
  w.gCtx.fillStyle = "#00ff00";
  w.gCtx.fillRect(0,Math.floor(gCanv.height-w.totalw1/(5000)),1,1);
}

function updateWorld(w){
  var nw0 = new Array(size);
  var nw1 = new Array(size);
  // updating inside
  var nmaxw0 = 0;
  var nmaxw1 = 0;
  var ntotalw0 = 0;
  var ntotalw1 = 0;
  for (var i=1; i<(size-1); i++){
    nw0[i] = new Array(size);
    nw1[i] = new Array(size);
    for(var j=1; j<(size-1); j++){
      // how many neighbours are there? // {{{
      var neighbours0 = 0;
      var neighbours1 = 0;
      for (var di=-1; di<2; di++){
        for (var dj=-1; dj<2; dj++){
          neighbours0 += w.w0[i+di][j+dj];
          neighbours1 += w.w1[i+di][j+dj];
        }
      }
      // }}}
      var nw0ij, nw1ij;
      if (w.options.method === "simple"){
        // dx/dt = r0(1- neighboursx*alpha neighboursy)*x
        nw0ij = w.w0[i][j] * (1 + w.f0(neighbours0,neighbours1)/neighbours0 * dt);
        nw1ij = w.w1[i][j] * (1 + w.f1(neighbours0,neighbours1)/neighbours1 * dt);
        // var nw0ij = w.w0[i][j] + w.f0(neighbours0,neighbours1)*dt;
        // var nw1ij = w.w1[i][j] + w.f1(neighbours0,neighbours1)*dt;
      }
      else if (w.options.method === "moving"){
        nw0ij = ((1-moveRatio) * w.w0[i][j] + moveRatio* (neighbours0 - w.w0[i][j]))* (1 + w.f0(neighbours0,neighbours1)/neighbours0 * dt);
        nw1ij = ((1-moveRatio) * w.w1[i][j] + moveRatio* (neighbours1 - w.w1[i][j]))* (1 + w.f1(neighbours0,neighbours1)/neighbours1 * dt);
      }
      nw0[i][j] = nw0ij;
      ntotalw0 += nw0ij;
      if (nw0ij > nmaxw0) { nmaxw0 = nw0ij ;}
      nw1[i][j] = nw1ij;
      ntotalw1 += nw1ij;
      if (nw1ij > nmaxw1) { nmaxw1 = nw1ij ;}
    }
  }
  // border are set to zero
  nw0[0] = new Array(size); nw1[0] = new Array (size);
  nw0[size-1] = new Array(size); nw1[size-1] = new Array (size);
  for (var j=0;j<size;j++){
    nw0[0][j]=0; nw0[size-1][j] = 0; nw0[j][0]=0; nw0[j][size-1]=0;
    nw1[0][j]=0; nw1[size-1][j] = 0; nw1[j][0]=0; nw1[j][size-1]=0;
  }
  w.w0 = nw0;
  w.w1 = nw1;
  w.maxw0 = nmaxw0;
  w.maxw1 = nmaxw1;
  w.totalw0 = ntotalw0;
  w.totalw1 = ntotalw1;
  return 0;
}

function freshWorld(w){
  w.wCtx0.clearRect(0,0,size*gridSize,size*gridSize);
  w.wCtx1.clearRect(0,0,size*gridSize,size*gridSize);
}


function mainLoop(w){
  for (var i=0; i<drawEvery; i++){
    updateWorld(w);
    drawGraph(w);
  }
  freshWorld(w);
  showWorld(w);
  console.log("maxw0 " + w.maxw0 + " \t and totalw0" + w.totalw0);
  setTimeout(function(){mainLoop(w);},200);
}

function main(){
  var wCanv0 = document.getElementById("world0");
  var wCanv1 = document.getElementById("world1");
  var gCanv = document.getElementById("graph");
  var _w = setUp(wCanv0, wCanv1, gCanv);
  mainLoop(_w);
}

window.onload = main;
