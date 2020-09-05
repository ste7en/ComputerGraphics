"use strict";

var BodyDir = 'Body/Cat_body_norm.obj';
var Eye1Dir = 'Pieces/eye_norm.obj';
var Eye2Dir = 'Pieces/eye_norm.obj';
var Hand1Dir = 'Pieces/clockhand1.obj';
var Hand2Dir = 'Pieces/clockhand2.obj';
var TailDir = 'Pieces/tail.obj';
var baseDir; //base directory where we have the texture and the codes
var shaderDir; //directory where we have the shaders
var gl;
var program;
var obj = new Array();

//create a structure to treat a set of objects as one
var Node = function() {
  this.children = [];
  this.localMatrix = utils.identityMatrix(); //the matrix that change the position of the child with respect to the parent
  this.worldMatrix = utils.identityMatrix(); //place the object in the world space
};
Node.prototype.setParent = function(parent) {
  // if the object already has a preavoius parent it remove it to give it to another parent
  if (this.parent) {
    var ndx = this.parent.children.indexOf(this);
    if (ndx >= 0) {
      this.parent.children.splice(ndx, 1);
    }
  }
  // Add us to our new parent
  if (parent) {
    parent.children.push(this);
  }
  this.parent = parent;
};
Node.prototype.updateWorldMatrix = function(matrix) { //call it just from the parent
  if (matrix) {
    // a matrix was passed in so do the math
    this.worldMatrix = utils.multiplyMatrices(matrix, this.localMatrix);
  } else {
    // no matrix was passed in so just copy.
    utils.copy(this.localMatrix, this.worldMatrix);
  }
  // now process all the children
  var worldMatrix = this.worldMatrix;
  this.children.forEach(function(child) {
    child.updateWorldMatrix(worldMatrix);
  });
};


function main() {
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

  for (i = 0; i<obj.length; i++){
    // 0 = body, 1 = tail, 2 = eye1, 3 = eye2, 4 = clockhand1, 5 = clockhand2

    //create vertex array object that store the state of vbo (position, color, indeces), need it to manage more obj 
    vao[i] = gl.createVertexArray();
    gl.bindVertexArray(vao[i]);

    // ########## POSITION ###########

    positionAttributeLocation[i] = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj[i].vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation[i]);
    gl.vertexAttribPointer(positionAttributeLocation[i], 3, gl.FLOAT, false, 0, 0);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj[i].indices), gl.STATIC_DRAW); 

    // ######### UV Coordinates ###########

    uvAttributeLocation[i] = gl.getAttribLocation(program, "a_uv");
    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj[i].textures), gl.STATIC_DRAW); //non abbiamo coordinate uv
    gl.enableVertexAttribArray(uvAttributeLocation[i]); 
    gl.vertexAttribPointer(uvAttributeLocation[i], 2, gl.FLOAT, false, 0, 0);
    
  }

  //######## TEXTURE #########

  textLocation = gl.getUniformLocation(program, "u_texture");
  var texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(textLocation, 0);
  
  //load the image
  var image = new Image();
  image.src = baseDir + "KitCat_Color.png";
  //when the texture is loaded (it's async) start the function - NON HO CAPITO A CHE SERVONO STE FUNZIONI
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
    bufferLength: indexData.length,
    vertexArray: vao[0], //associa body a vao[0] ovvero all'oggetto body
  };
  
  var tailNode = new Node();
  tailNode.drawInfo = {
    programInfo: program,
    bufferLength: indexData.length,
    vertexArray: vao[1],
  };

  var tailOrbitNode = new Node();
  tailOrbitNode.localMatrix = utils.MakeTranslateMatrix(100, 0, 0); //si deve muovere
  
  var eye1Node = new Node();
  eye1Node.localMatrix = utils.MakeScaleMatrix(0.7, 0.7, 0.7);
  eye1Node.drawInfo = {
    programInfo: program,
    bufferLength: indexData.length,
    vertexArray: vao[2],
  };

  var eye1OrbitNode = new Node();
  eye1OrbitNode.localMatrix = utils.MakeTranslateMatrix(30, 0, 0); //si deve muovere
  
  var eye2Node = new Node();
  eye2Node.localMatrix = utils.MakeScaleMatrix(0.7, 0.7, 0.7);
  eye2Node.drawInfo = {
    programInfo: program,
    bufferLength: indexData.length,
    vertexArray: vao[3],
  };

  var eye2OrbitNode = new Node();
  eye2OrbitNode.localMatrix = utils.MakeTranslateMatrix(30, 0, 0); //si deve muovere

  var clockHand1Node = new Node();
  clockHand1Node.localMatrix = utils.MakeScaleMatrix(0.7, 0.7, 0.7);
  clockHand1Node.drawInfo = {
    programInfo: program,
    bufferLength: indexData.length,
    vertexArray: vao[4],
  };
  
  var clockHand2Node = new Node();
  clockHand2Node.localMatrix = utils.MakeScaleMatrix(0.7, 0.7, 0.7);
  clockHand2Node.drawInfo = {
    programInfo: program,
    bufferLength: indexData.length,
    vertexArray: vao[5],
  };

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
  //lancettaNode.setParent(bodyNode);

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
    eye2OrbitNode.localMatrix = utils.multiplyMatrices(utils.MaketranslateMatrix(eyeDx,0.0,0.0), eye2OrbitNode.localMatrix);
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

  //load the objects
  var bodyObjStr = await utils.get_objstr(baseDir + BodyDir);
  var body = new OBJ.Mesh(bodyObjStr);
  obj[0] = body;
  var tailObjStr = await utils.get_objstr(baseDir + TailDir);
  var tail = new OBJ.Mesh(tailObjStr);
  obj[1] = tail;
  var eye1ObjStr = await utils.get_objstr(baseDir + Eye1Dir);
  var eye1 = new OBJ.Mesh(eye1ObjStr);
  obj[2] = eye1;
  var eye2ObjStr = await utils.get_objstr(baseDir + Eye2Dir);
  var eye2 = new OBJ.Mesh(eye2ObjStr);
  obj[3] = eye2;
  var clockHand1ObjStr = await utils.get_objstr(baseDir + Hand1Dir);
  var clockHand1 = new OBJ.Mesh(clockHand1ObjStr);
  obj[4] = clockHand1;
  var clockHand2ObjStr = await utils.get_objstr(baseDir + Hand2Dir);
  var clockHand2 = new OBJ.Mesh(clockHand2ObjStr);
  obj[5] = clockHand2;
  //TODO creare le lancette e utilizzarle come oggetto?? Oppure usare delle linee e muoverle??
  
  main();
}

window.onload = init;