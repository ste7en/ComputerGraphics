"use strict";

var CatBody = 'Body/CatBody.obj';
var Eye1 = 'Pieces/eye1.obj';
var Eye2 = 'Pieces/eye2.obj';
var Hand1 = 'Pieces/clockhand2.obj';
var Hand2 = 'Pieces/clockhand1.obj';
var Tail = 'Pieces/tail.obj';
var Texture = 'KitCat_color.png';

// Transform Data
var transform = {
  originalPosition: {
    x: -.5,
    y: -1.5,
    z: 0
  },
  rotation: {
    x: 0,
    y: 0,
    z: 0
  },
  position: {
    x: -.5,
    y: -1.5,
    z: 0
  },
  pointOfInterest: {
    leg: {
      x: 0,
      y: -1.5,
      z: 0
    },
    hand: {
      x: 0,
      y: -4.0,
      z: 0
    },
    back: {
      x: 0,
      y: -5.0,
      z: 0
      }
  },
  rotationSpeed: 4,
}

//shaders declaration (not covered in the first class)
var vertexShaderSource = `#version 300 es
in vec2 a_position; //in = attribute, we need a vertex buffer object

out vec2 pos_color; //don't need the buffer object because we initialize it in here

void main() {
  pos_color = a_position;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

var fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 pos_color;

out vec4 outColor;

void main() {
  outColor = vec4(pos_color, pos_color.x + pos_color.y, 1.0); //cambia colore a seconda della posizione
}
`;

//MUST function
function createShader(gl, type, source) {
  var shader = gl.createShader(type); //create the shader
  gl.shaderSource(shader, source); //load the source code
  gl.compileShader(shader); //compile the shader
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {    
    return shader;
  }else{
    console.log(gl.getShaderInfoLog(shader));  // eslint-disable-line
    gl.deleteShader(shader);
    throw "could not compile shader:" + gl.getShaderInfoLog(shader);
  }

}

//MUST function
function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }else{
     throw ("program filed to link:" + gl.getProgramInfoLog (program));
    console.log(gl.getProgramInfoLog(program));  // eslint-disable-line
    gl.deleteProgram(program);
    return undefined;
  }
}

//MUST function
function autoResizeCanvas(canvas) {
  const expandFullScreen = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  expandFullScreen();
  // Resize screen when the browser has triggered the resize event
  window.addEventListener('resize', expandFullScreen);
}


function main() {
  // Get a WebGL context
  var canvas = document.getElementById("my-canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("GL context not opened");
    return;
  }
  autoResizeCanvas(canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // Clear the canvas
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //keep proportions
  var aspect_ratio = gl.canvas.width*1.0/gl.canvas.height;
  //to check the depth, what is near to the camera
  gl.enable(gl.DEPTH_TEST);
  
  // create shaders and program
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  var program = createProgram(gl, vertexShader, fragmentShader);

  


  
  // var baseDir = window.location.href.replace(page, ''); nella init function
  // var pigObjStr = await utils.get_objstr(baseDir + modelStr);
  // var pigModel = new OBJ.Mesh(pigObjStr);
  
  //POSITION

  var pigVertices = pigModel.vertices;

  // Create a buffer to keep position of the verteces: VBO = Vertex Buffer Object
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pigVertices), gl.STATIC_DRAW);
  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation); 
  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration (3D)
  var normalize = false; // don't normalize the data
  var stride = 0;        // no jump positions
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, gl.FLOAT, normalize, stride, offset);






  

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  //var pigIndices = pigModel.indices;
  //gl.drawElements(gl.TRIANGLES, pigIndices.length, gl.UNSIGNED_SHORT, 0);

  //TEXTURE

  //var pigTexCoords = pigModel.textures;


  // create perspective matrix with (field of view up-direction, aspect ratio, position near plane, p. far plane)
  //var perspectiveMatrix = utils.MakePerspective(45, gl.canvas.width / gl.canvas.height, 0.1, 200.0);
  // build perspective matrix (x,y,z, rotation x, rotation y)
  //    var viewMatrix = utils.MakeView(0, 0.0, 4.0, 0, 0);
  // multiply matries to create viewWorldMatrix and Projection Matrix
  //    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
  //    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
  //matrix is being transposed because WebGl will interpet it in the wrong order so wrong way
  //and we pass projectionMatrix we built to matrixLocation where vertex shader will find it as input
  //    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
  
  }

  window.onload = main;