"use strict";

twgl.setDefaults({attribPrefix: "a_"});
const m4 = twgl.m4;
var gl, textureProgramInfo, colorProgramInfo;
var baseDir, shaderDir;

var bodyPath = 'model/body/Cat_body_norm.obj';
var eyePath = 'model/pieces/eye_norm.obj';
var minutesClockhandPath = 'model/pieces/minutesClockhand.obj';
var hoursClockhandPath = 'model/pieces/hoursClockhand.obj';
var tailPath = 'model/pieces/tail.obj';

var obj = [];
var objectBufferInfo = [];
var objectUniforms = [];
var drawObjects = [];

var clockHand1LocalMatrix = utils.MakeWorld(0.0, 0.0, 0.029, 0.0, 0.0, 0.0, 1.0);
var clockHand2LocalMatrix = utils.MakeWorld(0.0, 0.0, 0.028, 0.0, 0.0, 0.0, 1.0);
var leftEyeLocalMatrix = utils.MakeWorld(-0.009095, 0.047, 0.018732, 0.0,0.0,0.0,1.0);
var rightEyeLocalMatrix = utils.MakeWorld(0.007117, 0.047, 0.018971, 0.0,0.0,0.0,1.0);
var tailLocalMatrix = utils.MakeWorld(-0.005182, -0.014557, 0.012112, 0.0,0.0,0.0,1.0);

var worldMatrix;


function main() {
  const black = [0.0, 0.0, 0.0, 1.0];
  const white = [1.0, 1.0, 1.0, 1.0];

  twgl.resizeCanvasToDisplaySize(gl.canvas);
  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  //gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const tex_nm = twgl.createTexture(gl, {
    min: gl.NEAREST,
    mag: gl.NEAREST,
    src: "textures/kitcat_NM.png",
    flipY: true
  });
  
  const tex_color = twgl.createTexture(gl, {
    min: gl.NEAREST,
    mag: gl.NEAREST,
    src: "textures/KitCat_color.png",
    flipY: true
  });


  obj.forEach( (object, index) => {
    // 0 = tail, 1 = body, 2 = leftEye, 3 = rightEye, 4 = hoursClockhand, 5 = minutedClockhand
    let uniforms;
    let arrays = {
      position: object.getVertices(),
      normal: object.getNormals(),
      texcoord: object.getTextures(),
      indices: object.getIndices()
    };
    let objBuffInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    let programInfo = object.getProgramInfo();
    
    objectBufferInfo.push(objBuffInfo);

    switch(index) {
      case 0: // tail
        uniforms = {
          u_color: black,
        };
        break;
      case 4:
      case 5: //clockhands
        uniforms = {
          u_color: white,
        };
        break;
      default:
        uniforms = {
          u_texture1: tex_color,
          u_texture2: tex_nm
        };
    }
    //uniforms.matrix = object.getLocalMatrix();
    drawObjects.push({
      programInfo: programInfo,
      vertexArrayInfo: objBuffInfo,
      uniforms: uniforms
    });
  });

  function drawScene(time){
    //animate();
    time *= 0.001;
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    //gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    const projection = m4.perspective(30 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100);
    const eye = [0.0, 0.0, 0.3];
    const target = [0, 0, 0];
    const up = [0.0, 1.0, 0.0];

    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);
    const viewProjection = m4.multiply(projection, view);
    const worldID = m4.identity();
    const worldScale = m4.identity();//utils.MakeScaleMatrix(3);
    const world = utils.multiplyMatrices(worldID, worldScale);

    //uniforms.u_viewInverse = camera;
    //uniforms.u_world = world;
    //uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);

    drawObjects.forEach(function(obj) {
      const programInfo = obj.programInfo;
      
      let uniforms = obj.uniforms;
      uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);

      gl.useProgram(programInfo.program);
      twgl.setBuffersAndAttributes(gl, programInfo, obj.vertexArrayInfo);
      twgl.setUniforms(programInfo, obj.uniforms);
      twgl.drawBufferInfo(gl, obj.vertexArrayInfo);
    })

    //with this call, we call again drawScene for each frame, used for animation
    window.requestAnimationFrame(drawScene)
  }

  drawScene();
  
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
  
  // Loading the shaders and creating programs
  await utils.loadFiles([shaderDir + 'texture_vs.vert', shaderDir + 'texture_fs.frag'], function (shaderText) {
    textureProgramInfo = twgl.createProgramInfo(gl, [shaderText[0], shaderText[1]], ["a_texcoord", "a_position"]);
  });
  await utils.loadFiles([shaderDir + 'color_vs.vert', shaderDir + 'color_fs.frag'], function (shaderText) {
    colorProgramInfo = twgl.createProgramInfo(gl, [shaderText[0], shaderText[1]], ["a_position"]);
  });

  /*
  * Loading the obj mod
  */
  let tailWrapper = new ObjectWrapper(baseDir + tailPath);
  let bodyWrapper = new ObjectWrapper(baseDir + bodyPath);
  let leftEyeWrapper = new ObjectWrapper(baseDir + eyePath);
  let rightEyeWrapper = new ObjectWrapper(baseDir + eyePath);
  let hoursClockhandWrapper = new ObjectWrapper(baseDir + hoursClockhandPath);
  let minutesClockhandWrapper = new ObjectWrapper(baseDir + minutesClockhandPath);
  tailWrapper.setLocalMatrix(tailLocalMatrix).setProgramInfo(colorProgramInfo);
  bodyWrapper.setLocalMatrix(m4.identity()).setProgramInfo(textureProgramInfo);
  leftEyeWrapper.setLocalMatrix(leftEyeLocalMatrix).setProgramInfo(textureProgramInfo);
  rightEyeWrapper.setLocalMatrix(rightEyeLocalMatrix).setProgramInfo(textureProgramInfo);
  hoursClockhandWrapper.setLocalMatrix(clockHand2LocalMatrix).setProgramInfo(colorProgramInfo);
  minutesClockhandWrapper.setLocalMatrix(clockHand1LocalMatrix).setProgramInfo(colorProgramInfo);

  await tailWrapper.loadModel();
  await bodyWrapper.loadModel();
  await leftEyeWrapper.loadModel();
  await rightEyeWrapper.loadModel();
  await hoursClockhandWrapper.loadModel();
  await minutesClockhandWrapper.loadModel();

  obj = [tailWrapper, bodyWrapper, leftEyeWrapper, rightEyeWrapper, hoursClockhandWrapper, minutesClockhandWrapper];
  
  main();
}

window.onload = init;