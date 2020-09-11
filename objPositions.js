"use strict";

var program;
var gl;
var baseDir; //base directory where we have the texture and the codes
var shaderDir; //directory where we have the shaders
var bodyPath = 'model/body/Cat_body_norm.obj';
var eyePath = 'model/pieces/eye_norm.obj';
var minutesClockhandPath = 'model/pieces/minutesClockhand.obj';
var hoursClockhandPath = 'model/pieces/hoursClockhand.obj';
var tailPath = 'model/pieces/tail.obj';
var obj;

var clockHand1LocalMatrix = utils.MakeWorld(0.0, 0.0, 0.029, 0.0, 0.0, 0.0, 1.0);
var clockHand2LocalMatrix = utils.MakeWorld(0.0, 0.0, 0.028, 0.0, 0.0, 0.0, 1.0);
var leftEyeLocalMatrix = utils.MakeWorld(-0.009095, 0.047, 0.018732, 0.0,0.0,0.0,1.0);
var rightEyeLocalMatrix = utils.MakeWorld(0.007117, 0.047, 0.018971, 0.0,0.0,0.0,1.0);
var tailLocalMatrix = utils.MakeWorld(-0.005182, -0.014557, 0.012112, 0.0,0.0,0.0,1.0);

var worldMatrix;

function main() {
  var lastUpdateTime = (new Date).getTime();

  utils.resizeCanvasToDisplaySize(gl.canvas);
  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // Clear the canvas
  gl.clearColor(0.85, 1.0, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //to check the depth, what is near to the camera
  gl.enable(gl.DEPTH_TEST);

  var vao = new Array();
  // get GLSL variables
  // we don't need to retrive the attributes more than once cause we are using the same program
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
  const matrixLocation = gl.getUniformLocation(program, "matrix");
  const textLocation = gl.getUniformLocation(program, "u_texture");

  const perspectiveMatrix = utils.MakePerspective(120, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
  const viewMatrix = utils.MakeView(0, 0.0, 3.0, 0.0, 0.0);

    //######## TEXTURE #########
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textLocation, texture);
    
    //load the image
    let image = new Image();
    image.src = baseDir + "textures/KitCat_Color.png";
    //when the texture is loaded (it's async) start the function
    image.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      // to automatically optimize the picture
      gl.generateMipmap(gl.TEXTURE_2D);
    };

  obj.forEach( (object, index) => {
    // 0 = body, 1 = tail, 2 = leftEye, 3 = rightEye, 4 = hoursClockhand, 5 = minutedClockhand

    //create vertex array object that store the state of vbo (position, color, indeces), need it to manage more obj
    vao[index] = gl.createVertexArray();
    gl.bindVertexArray(vao[index]);

    // ### POSITION ###
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.getVertices()), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    // ### UV Coordinates ###
    let uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.getTextures()), gl.STATIC_DRAW); //non abbiamo coordinate uv
    gl.enableVertexAttribArray(uvAttributeLocation); 
    gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    // ### Index Buffer ###
    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.getIndices()), gl.STATIC_DRAW);

    if(index == 1 || index == 4 || index == 5) {
      // tail + hands

    } else {
      // body, left eye, right eye
      
    }
  });



  drawScene();

  function animate(){
    var currentTime = (new Date).getTime();
    var Rx = 0;
    var Ry = 0;
    var Rz = 0;
    var S = 1.0;
    if (lastUpdateTime != null){
      //TODO calcolare gli spostamenti di coda e occhi
      var deltaC = 0//(30*(currentTime - lastUpdateTime)) / 1000.0; //è un esempio, non è quello che dobbiamo usare!
      Rx += deltaC;
      Ry -= deltaC;
      Rz += deltaC;
      //TODO clockhands?? deve rispettare l'orario reale
    }
    // update the local matrices for each object that have been moved.
    worldMatrix = utils.MakeWorld(0.0, 0.0, 0.0, Rx, Ry, Rz, S);
    lastUpdateTime = currentTime;
  }

  function drawScene(){
    //animate();

    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clearColor(0.7, 1.0, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compute the projection matrix
    // var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
    // var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);

    // Compute all the matrices for rendering
    obj.forEach( (object, index) => {
      var worldViewMatrix = utils.multiplyMatrices(viewMatrix, object.getLocalMatrix());
      var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);

      gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      //gl.uniform1i(textLocation, 0);

      gl.bindVertexArray(vao[index]);
      gl.drawElements(gl.TRIANGLES, object.getIndices.length, gl.UNSIGNED_SHORT, 0);
    });

    //TODO disegnare altri 2 elementi per le lancette

    //with this call, we call again drawScene for each frame, used for animation
    //window.requestAnimationFrame(drawScene)
  }
  
} // end main

async function init(){
  // retrieve shader using path
  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, '');
  shaderDir = baseDir + "shaders/";

  // create canvas
  var canvas = document.getElementById("c");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("GL context not opened");
    return;
  }
  // to use the program wait until the shaders have been loaded
  await utils.loadFiles([shaderDir + 'vs.vert', shaderDir + 'fs.frag'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    program = utils.createProgram(gl, vertexShader, fragmentShader);
  });
  gl.useProgram(program);

  /*
  * Loading the obj models
  */
  let bodyWrapper = new ObjectWrapper(baseDir + bodyPath);
  let tailWrapper = new ObjectWrapper(baseDir + tailPath);
  let leftEyeWrapper = new ObjectWrapper(baseDir + eyePath);
  let rightEyeWrapper = new ObjectWrapper(baseDir + eyePath);
  let hoursClockhandWrapper = new ObjectWrapper(baseDir + hoursClockhandPath);
  let minutesClockhandWrapper = new ObjectWrapper(baseDir + minutesClockhandPath);
  bodyWrapper.setLocalMatrix(utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0));
  tailWrapper.setLocalMatrix(tailLocalMatrix);
  leftEyeWrapper.setLocalMatrix(leftEyeLocalMatrix);
  rightEyeWrapper.setLocalMatrix(rightEyeLocalMatrix);
  hoursClockhandWrapper.setLocalMatrix(clockHand2LocalMatrix);
  minutesClockhandWrapper.setLocalMatrix(clockHand1LocalMatrix);
  
  await bodyWrapper.loadModel();
  await tailWrapper.loadModel();
  await leftEyeWrapper.loadModel();
  await rightEyeWrapper.loadModel();
  await hoursClockhandWrapper.loadModel();
  await minutesClockhandWrapper.loadModel();

  obj = [bodyWrapper, tailWrapper, leftEyeWrapper, rightEyeWrapper, hoursClockhandWrapper, minutesClockhandWrapper];
  
  main();
}

window.onload = init;