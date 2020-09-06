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

async function main() {
  var lastUpdateTime = (new Date).getTime();

  utils.resizeCanvasToDisplaySize(gl.canvas);
  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //keep proportions
  var aspect_ratio = gl.canvas.width*1.0/gl.canvas.height;
  //to check the depth, what is near to the camera
  gl.enable(gl.DEPTH_TEST);

  //vertices, indeces and uv coords of each object
  var vao = new Array();
  var positionAttributeLocation = new Array();
  var uvAttributeLocation = new Array();

  obj.forEach( (object, index) => {
    // 0 = body, 1 = tail, 2 = leftEye, 3 = rightEye, 4 = minutedClockhand, 5 = hoursClockhand

    //create vertex array object that store the state of vbo (position, color, indeces), need it to manage more obj
    vao[index] = gl.createVertexArray();
    gl.bindVertexArray(vao[index]);

    // ### POSITION ###
    positionAttributeLocation[index] = gl.getAttribLocation(program, "a_position");
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.getVertices()), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation[index]);
    gl.vertexAttribPointer(positionAttributeLocation[index], 3, gl.FLOAT, false, 0, 0);

    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.getIndices()), gl.STATIC_DRAW);

    // ### UV Coordinates ###
    uvAttributeLocation[index] = gl.getAttribLocation(program, "a_uv");
    let uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.getTextures()), gl.STATIC_DRAW); //non abbiamo coordinate uv
    gl.enableVertexAttribArray(uvAttributeLocation[index]); 
    gl.vertexAttribPointer(uvAttributeLocation[index], 2, gl.FLOAT, false, 0, 0);
  });

  //######## TEXTURE #########
  var textLocation = gl.getUniformLocation(program, "u_texture");
  var texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(textLocation, 0);
  
  //load the image
  var image = new Image();
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

  //create the link between the objects (scene graph)
  var bodyNode = new Node();
  bodyNode.drawInfo = {
    programInfo: program,
    bufferLength: obj[0].getIndices().length,
    vertexArray: vao[0], //associa body a vao[0] ovvero all'oggetto body
  };
  
  var tailNode = new Node();
  tailNode.drawInfo = {
    programInfo: program,
    bufferLength: obj[1].getIndices().length,
    vertexArray: vao[1],
  };

  var tailOrbitNode = new Node();
  tailOrbitNode.localMatrix = utils.MakeWorld(-0.005182, -0.014557, 0.012112, 0.0,0.0,0.0,1.0); //utils.MakeTranslateMatrix(100, 0, 0); //si deve muovere
  
  var eye1Node = new Node();
  eye1Node.localMatrix = utils.MakeWorld(-0.009095, 0.047, 0.018732, 0.0,0.0,0.0,1.0); //utils.MakeScaleMatrix(0.7, 0.7, 0.7);
  eye1Node.drawInfo = {
    programInfo: program,
    bufferLength: obj[2].getIndices().length,
    vertexArray: vao[2],
  };

  var eye1OrbitNode = new Node();
  eye1OrbitNode.localMatrix = utils.MakeTranslateMatrix(30, 0, 0); //si deve muovere
  
  var eye2Node = new Node();
  eye2Node.localMatrix = utils.MakeWorld(0.007117, 0.047, 0.018971, 0.0,0.0,0.0,1.0);//utils.MakeScaleMatrix(0.7, 0.7, 0.7);
  eye2Node.drawInfo = {
    programInfo: program,
    bufferLength: obj[3].getIndices().length,
    vertexArray: vao[3],
  };

  var eye2OrbitNode = new Node();
  eye2OrbitNode.localMatrix = utils.MakeTranslateMatrix(30, 0, 0); //si deve muovere

  var clockHand1Node = new Node();
  clockHand1Node.localMatrix = utils.MakeWorld(0.0, 0.0, 0.029, 0.0, 0.0, 0.0, 1.0);//utils.MakeScaleMatrix(0.7, 0.7, 0.7);
  clockHand1Node.drawInfo = {
    programInfo: program,
    bufferLength: obj[4].getIndices().length,
    vertexArray: vao[4],
  };

  var clockHand1OrbitNode = new Node();
  clockHand1OrbitNode.localMatrix = utils.MakeWorld(0.0, 0.0, 0.029, 0.0, 0.0, 0.0, 1.0);
  
  var clockHand2Node = new Node();
  clockHand2Node.localMatrix = utils.MakeWorld(0.0, 0.0, 0.028, 0.0, 0.0, 0.0, 1.0);//utils.MakeScaleMatrix(0.7, 0.7, 0.7);
  clockHand2Node.drawInfo = {
    programInfo: program,
    bufferLength: obj[5].getIndices().length,
    vertexArray: vao[5],
  };

  var clockHand2OrbitNode = new Node();
  clockHand2OrbitNode.localMatrix = utils.MakeWorld(0.0, 0.0, 0.028, 0.0, 0.0, 0.0, 1.0);

  //TODO creare le lancette dell'orologio e linkarle al corpo
  
  tailNode.setParent(tailOrbitNode);
  tailOrbitNode.setParent(bodyNode);
  eye1Node.setParent(eye1OrbitNode);
  eye1OrbitNode.setParent(bodyNode);
  eye2Node.setParent(eye2OrbitNode);
  eye2OrbitNode.setParent(bodyNode);
  clockHand1Node.setParent(clockHand1OrbitNode);
  clockHand1OrbitNode.setParent(bodyNode);
  clockHand2Node.setParent(clockHand2OrbitNode);
  clockHand2OrbitNode.setParent(bodyNode);

  var objects = [
    bodyNode,
    tailNode,
    eye1Node,
    eye2Node,
    clockHand1Node,
    //lancettaNode
    clockHand2Node
  ];

  drawScene();

var tailDx = 0, tailDy = 0, eyeDx = 0;

  function animate(){
    var currentTime = (new Date).getTime();
    if (lastUpdateTime){
      //TODO calcolare gli spostamenti di coda e occhi
      var deltaC = (30*(currentTime - lastUpdateTime)) / 1000.0; //è un esempio, non è quello che dobbiamo usare!
      tailDx += deltaC;
      tailDy -= deltaC;
      eyeDx += deltaC;
      //TODO clockhands?? deve rispettare l'orario reale
    }
    // update the local matrices for each object that have been moved.
    tailOrbitNode.localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(tailDx,tailDy,0.0), tailOrbitNode.localMatrix);
    eye1OrbitNode.localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(eyeDx,0.0,0.0), eye1OrbitNode.localMatrix);
    eye2OrbitNode.localMatrix = utils.multiplyMatrices(utils.MakeTranslateMatrix(eyeDx,0.0,0.0), eye2OrbitNode.localMatrix);
    //update all the world matrix
    bodyNode.updateWorldMatrix();

    lastUpdateTime = currentTime;
  }

  function drawScene(){
    animate();

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compute the projection matrix
    var matrixLocation = gl.getUniformLocation(program, "matrix");  
    var aspect = gl.canvas.width / gl.canvas.height;
    var projectionMatrix = utils.MakePerspective(60.0, aspect, 1.0, 2000.0);

    // Compute the camera matrix using look at.
    var cameraPosition = [0.0, -200.0, 0.0];
    var target = [0.0, 0.0, 0.0];
    var up = [0.0, 0.0, 1.0];
    var cameraMatrix = utils.LookAt(cameraPosition, target, up);
    var viewMatrix = utils.invertMatrix(cameraMatrix);
    var viewProjectionMatrix = utils.multiplyMatrices(projectionMatrix, viewMatrix);
    
    // Compute all the matrices for rendering
    objects.forEach(function(object) {
      gl.useProgram(object.drawInfo.programInfo);
      var projectionMatrix = utils.multiplyMatrices(viewProjectionMatrix, object.worldMatrix);
      gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
      gl.bindVertexArray(object.drawInfo.vertexArray);
      gl.drawElements(gl.TRIANGLES, object.drawInfo.bufferLength, gl.UNSIGNED_SHORT, 0 );
    });
    //TODO disegnare altri 2 elementi per le lancette

    //with this call, we call again drawScene for each frame, used for animation
    window.requestAnimationFrame(drawScene)
  }
  
}

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
  const bodyWrapper = new ObjectWrapper(baseDir + bodyPath);
  const tailWrapper = new ObjectWrapper(baseDir + tailPath);
  const leftEyeWrapper = new ObjectWrapper(baseDir + eyePath);
  const rightEyeWrapper = new ObjectWrapper(baseDir + eyePath);
  const minutesClockhandWrapper = new ObjectWrapper(baseDir + minutesClockhandPath);
  const hoursClockhandWrapper = new ObjectWrapper(baseDir + hoursClockhandPath);
  
  await bodyWrapper.loadModel();
  await tailWrapper.loadModel();
  await leftEyeWrapper.loadModel();
  await rightEyeWrapper.loadModel();
  await minutesClockhandWrapper.loadModel();
  await hoursClockhandWrapper.loadModel();

  obj = [bodyWrapper, tailWrapper, leftEyeWrapper, rightEyeWrapper, minutesClockhandWrapper, hoursClockhandWrapper];
  
  main();
}

window.onload = init;