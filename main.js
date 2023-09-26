import * as THREE from 'three';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

import {myVertShader, myFragShader} from '/OceanGrid/shader.js';


// Debuggin global variables
window.THREE = THREE;

// CREATE SCENE
const scene = new THREE.Scene();

// CREATE CAMERA
const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 2000;
const cameraUser = new THREE.PerspectiveCamera(fov, aspect, near, far);

// CREATE CAMERA GRID
const cameraGrid = new THREE.PerspectiveCamera(fov, aspect, near, far);

// CREATE RENDERER
const renderer = new THREE.WebGLRenderer();
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize( window.innerWidth/2, window.innerHeight );

// CREATE CANVAS
const canvas = renderer.domElement;
canvas.style.width = '50vw';
canvas.style.height = '100vh';
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
document.body.appendChild( canvas );


// CAMERA CONTROLS
const controls = new OrbitControls(cameraUser, canvas);
cameraUser.position.set(10, 5, 0);
controls.target.set(0, 0, 0);


// SCENE PREVIEW SYSTEM
// CREATE OUTSIDE CAMERA
const cameraPreview = new THREE.PerspectiveCamera(fov, aspect, near, far*2);
cameraPreview.position.set(0, 10, 30);
cameraPreview.lookAt(0, 0, 0);
cameraPreview.aspect = 1;
cameraPreview.updateProjectionMatrix();
let rendererPreview = new THREE.WebGLRenderer();
rendererPreview.outputEncoding = THREE.sRGBEncoding;
rendererPreview.setSize( window.innerWidth/2, window.innerHeight);
let canvasPreview = rendererPreview.domElement;
canvasPreview.style.width = '50vw';
canvasPreview.style.height = '100vh';
canvasPreview.style.position = 'absolute';
canvasPreview.style.top = '0';
canvasPreview.style.right = '0';
document.body.appendChild( canvasPreview );
const controlsPreview = new OrbitControls(cameraPreview, canvasPreview);
controlsPreview.target.set(0, 0, 0);

// CAMERA HELPER
const helper = new THREE.CameraHelper( cameraUser );
scene.add( helper );



// OBJECTS (HELPERS)
// CUBE
let geometry = new THREE.BoxGeometry( 1, 1, 1 );
let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

// CAMERA CONE
let coneGeom = new THREE.ConeGeometry(0.5, 2);
let coneMat = new THREE.MeshBasicMaterial( { color:  "rgb(255, 127, 127)"} );
const cameraCone = new THREE.Mesh(coneGeom, coneMat);
const coneObj = new THREE.Object3D();
cameraCone.rotateX(Math.PI/2);
coneObj.add(cameraCone);
scene.add( coneObj );

// CAMERA GRID CONE
let coneGeom2 = new THREE.ConeGeometry(0.5, 1);
let coneMat2 = new THREE.MeshBasicMaterial( { color:  "rgb(127, 255, 127)"} );
const cameraGridCone = new THREE.Mesh(coneGeom2, coneMat2);
const coneGridObj = new THREE.Object3D();
cameraGridCone.rotateX(Math.PI/2);
coneGridObj.add(cameraGridCone);
scene.add( coneGridObj );

let sphGeo = new THREE.SphereGeometry(0.3);
let sphMat = new THREE.MeshBasicMaterial({color: "rgb(0, 0, 255)"});
let sphMat2 = new THREE.MeshBasicMaterial({color: "rgb(255, 0, 0)"});
const sph1 = new THREE.Mesh(sphGeo, sphMat);
const sph2 = new THREE.Mesh(sphGeo, sphMat2);
scene.add(sph1);
scene.add(sph2);


// GRID HELPER
let size = 2000;
let divisions = 100;
const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );







// OCEAN GRID
size = 5;
divisions = 50;
let distanceFrontCamera = 5;
let yHeightScale = 1; // Parameter that depends on camera orientation and aspect
let planeGeometry = new THREE.PlaneGeometry( size, size, divisions, divisions );
let planeGeometryDefault = new THREE.PlaneGeometry( size, size, divisions, divisions );
let projectedPlaneGeom = new THREE.PlaneGeometry( size, size, divisions, divisions );

let oceanGrid = new THREE.LineSegments( new THREE.WireframeGeometry( planeGeometry));
oceanGrid.material.depthTest = false;
oceanGrid.material.opacity = 0.2;
oceanGrid.material.transparent = true;
oceanGrid.frustrumculled = false;
// OCEAN GRID PROJECTED
let oceanGridProjected = new THREE.LineSegments( new THREE.WireframeGeometry( projectedPlaneGeom));
oceanGridProjected.material.depthTest = false;
oceanGridProjected.material.opacity = 1.0;
oceanGridProjected.material.transparent = true;
oceanGridProjected.frustrumculled = false;

// OCEAN GRID GPU-PROJECTED
divisions = 200;
let extraYsubdivisionFactor = 4;
let gpuGridGeom = new THREE.PlaneGeometry( size, size, divisions , divisions * extraYsubdivisionFactor );
// Randomize grid vertex positions to avoid aliasing
let vertices = gpuGridGeom.attributes.position.array;
for (let i = 0; i < (vertices.length/3) - 1; i++){
  let x = vertices[i*3];
  let y = vertices[i*3 + 1];
  // Avoid modifying sides of the plane
  if (x != Math.abs(size/2) && y != Math.abs(size/2)){
    let step = 0.5 * size/divisions;
    let randNum = (Math.random() - 1) * 2;
    vertices[i*3] = x + randNum * step;
    vertices[i*3 + 1] = y + randNum * step / extraYsubdivisionFactor; // More divisions in this axis
  }
}

let time = new Date().getTime();
let gpuGridMat = new THREE.ShaderMaterial({
  blending: THREE.NormalBlending,
  transparent: true,
  vertexShader: myVertShader,
  fragmentShader: myFragShader,
  uniforms: {
    u_time: { value: new Date().getTime() - time},
    u_cameraModelMatrix: {value: cameraGrid.matrix},
    u_cameraGridPosition: {value: cameraGrid.position},
    u_cameraViewportScale: {value: new THREE.Vector2(1, 1)},
  }
});
gpuGridMat.side = THREE.DoubleSide;
let gpuGrid = new THREE.Mesh(gpuGridGeom, gpuGridMat);
//gpuGrid.frustrumculled = false;

scene.add( oceanGrid );
scene.add( oceanGridProjected );
scene.add( gpuGrid);

















let rowCentralVertex = new THREE.Vector3();
let rayCameraUserToRowCentralVertex = new THREE.Vector3();
let intersectionPoint = new THREE.Vector3();
let rayCameraUserToIntersectPoint = new THREE.Vector3();

let camGridPosition = new THREE.Vector3();
let cameraUserForward = new THREE.Vector3();
let oppositeRowCentralVertex = new THREE.Vector3();
let secondIntersectionPoint = new THREE.Vector3();
let gridTopCentralVertex = new THREE.Vector3();
let gridBottomCentralVertex = new THREE.Vector3();

let tempVec4 = new THREE.Vector4();

function updatePlane(inputCamera){
  // Temporal, moves the vertices in front of camera using THREE operations
  //updateObjectMatrixAccordingToCamera(oceanGrid);
  //oceanGrid.translateZ(-distanceFrontCamera);

  let camera = inputCamera || cameraUser;

  let defaultVertices = planeGeometryDefault.attributes.position.array;
  let vertices = planeGeometry.attributes.position.array;
  let projectedVertices = projectedPlaneGeom.attributes.position.array;
  let numVertices = vertices.length/3;
  

  for (let i = 0; i < numVertices; i++){
    // Use temp vector
    tempVec4.set(defaultVertices[i*3], defaultVertices[i*3 + 1], defaultVertices[i*3 + 2], 1);
    // Scale plane height according to camera orientation and aspect
    tempVec4.x = tempVec4.x * cameraUser.aspect;
    tempVec4.z = tempVec4.z * cameraUser.aspect;
    tempVec4.y = tempVec4.y * yHeightScale;
    
    // Move vertices in front of the camera
    camera.translateZ(-distanceFrontCamera);
    camera.updateMatrix();
    tempVec4 = tempVec4.applyMatrix4(camera.matrix, tempVec4);
    camera.translateZ(distanceFrontCamera);
    camera.updateMatrix();
    // Homogeneous division if needed
    if (tempVec4.w != 0)
      tempVec4.divideScalar(tempVec4.w);

    // Calculate intersection with xz plane and camera ray
    rowCentralVertex.set(tempVec4.x, tempVec4.y, tempVec4.z);
    rayCameraUserToRowCentralVertex.subVectors(rowCentralVertex, camera.position);
    // Ray is not parallel to the horizon
    if (rayCameraUserToRowCentralVertex.y !== 0){
      let t = (0 - camera.position.y) / rayCameraUserToRowCentralVertex.y;
      // Intersection point
      intersectionPoint = intersectionPoint.copy(camera.position).add(rayCameraUserToRowCentralVertex.multiplyScalar(t));
      // Recalculate ray (even if not used?) because it was modified by scalar
      rayCameraUserToRowCentralVertex.subVectors(rowCentralVertex, camera.position);
    }

    rayCameraUserToIntersectPoint.subVectors(intersectionPoint, camera.position)
    // TODO: if cameraForward is opposite from ray direction, flip ray direction?
    cameraUser.getWorldDirection(cameraUserForward);
    let dotResult = cameraUserForward.dot(rayCameraUserToIntersectPoint);
    if (dotResult < 0){
      intersectionPoint.multiplyScalar(-1);
      
    }
    //console.log(Math.sign(dotResult));



    // Reassign position to vertex
    if (isNaN(rowCentralVertex.x) || isNaN(rowCentralVertex.y) || isNaN(rowCentralVertex.z)){
      debugger;
    }
    // In front of the camera
    vertices[i*3] = rowCentralVertex.x;
    vertices[i*3 + 1] = rowCentralVertex.y; 
    vertices[i*3 + 2] = rowCentralVertex.z;
    // On the XZ plane
    projectedVertices[i*3] = intersectionPoint.x;
    projectedVertices[i*3 + 1] = intersectionPoint.y; 
    projectedVertices[i*3 + 2] = intersectionPoint.z;

  }

  // Update geometry
  let geom = oceanGrid.geometry;
  oceanGrid.geometry.dispose();
  oceanGrid.geometry = new THREE.WireframeGeometry(geom.parameters.geometry);

  geom = oceanGridProjected.geometry;
  oceanGridProjected.geometry.dispose();
  oceanGridProjected.geometry = new THREE.WireframeGeometry(geom.parameters.geometry);
}





// Update the camera grid position and orientation
function updateCameraGrid(){

  // Check if central vertex of top row is inside frustrum
  let defaultVertices = planeGeometryDefault.attributes.position.array;
  // When cameraUser is below XZ plane, the central vertex of the last row should be taken
  // TODO: always consider a positive Y for the cameraUser position --> it does not matter for the grid projection
  if (cameraUser.position.y >= 0)
    tempVec4.set(0, defaultVertices[1], 0, 1); // Top row central vertex
  else{
    let lastVertexIndex = (defaultVertices.length/3 - 1);
    tempVec4.set(0, defaultVertices[lastVertexIndex*3 + 1], 0, 1); // Bottom row central vertex
  }
  

  // Move vertices in front of the cameraUser
  cameraUser.translateZ(-distanceFrontCamera);
  cameraUser.updateMatrix();
  tempVec4 = tempVec4.applyMatrix4(cameraUser.matrix, tempVec4);
  cameraUser.translateZ(distanceFrontCamera);
  cameraUser.updateMatrix();
  // Homogeneous division if needed
  if (tempVec4.w != 0)
    tempVec4.divideScalar(tempVec4.w);

  rowCentralVertex.set(tempVec4.x, tempVec4.y, tempVec4.z);

  // Calculate intersection with xz plane and cameraUser ray
  rayCameraUserToRowCentralVertex = rayCameraUserToRowCentralVertex.subVectors(rowCentralVertex, cameraUser.position);

  

  // Ray is not parallel to the horizon
  if (rayCameraUserToRowCentralVertex.y !== 0){
    let t = (0 - cameraUser.position.y) / rayCameraUserToRowCentralVertex.y;
    // Intersection point
    intersectionPoint.copy(cameraUser.position).add(rayCameraUserToRowCentralVertex.multiplyScalar(t));
    let magnitude = intersectionPoint.length();

    // If ray points behind the cameraUser
    let dirA = rayCameraUserToRowCentralVertex.subVectors(rowCentralVertex, cameraUser.position);
    let dirB = rayCameraUserToIntersectPoint.subVectors(intersectionPoint, cameraUser.position);
    let dotResult = dirA.dot(dirB);
    if(dotResult < 0){
      // Find intersection between frustrum and XZ plane
      intersectionPoint.copy(rayCameraUserToRowCentralVertex).normalize().multiplyScalar(cameraUser.far); // Extend ray to end of frustrum (cameraUser.far)
      intersectionPoint.y = 0;
      calculateCameraGridMatrix(intersectionPoint, rowCentralVertex);
    } 
    else if (magnitude > cameraUser.far){
      // APPROXIMATING HORIZON, RECALCULATE CAMERA GRID MATRIX
      calculateCameraGridMatrix(intersectionPoint, rowCentralVertex);
    }
    else {
      // DEFAULT, NO MODIFICATION
      updateObjectMatrixAccordingToCamera(cameraGrid);
    }
  } 
  // LOOKING AT HORIZON, RECALCULATE CAMERA GRID MATRIX
  else {
    // Find intersection between frustrum and XZ plane
    intersectionPoint.copy(rayCameraUserToRowCentralVertex).normalize().multiplyScalar(cameraUser.far); // Extend ray to end of frustrum (cameraUser.far)
    intersectionPoint.y = 0;

    calculateCameraGridMatrix(intersectionPoint, rowCentralVertex);
  }
}


let camGridTarget = new THREE.Vector3();
// Camera grid must be moved
function calculateCameraGridMatrix(intersectionPoint, rowCentralVertex){
  // Find camera position using top row central vertex, intersection point and distance from camera to top row central vertex
  let distanceCamToVertex = cameraUser.position.distanceTo(rowCentralVertex);
  camGridPosition.subVectors(rowCentralVertex, intersectionPoint).normalize().multiplyScalar(distanceCamToVertex);
  camGridPosition.add(rowCentralVertex);
  
  cameraGrid.position.copy(camGridPosition);
  cameraGrid.updateMatrix();

  // Find camera direction (forward, target) using the intersection between the opposite row central vertex, which calculates a second
  // intersection point. The camera direction (target) is found by calculating the point between the two intersection points.
  // TODO: Check if central vertex of opposite row is inside frustrum --> ocean must not be painted then!
  let defaultVertices = planeGeometryDefault.attributes.position.array;
  if (cameraUser.position.y >= 0){
    let lastVertexIndex = (defaultVertices.length/3 - 1);
    tempVec4.set(0, defaultVertices[lastVertexIndex*3 + 1], 0, 1); // Bottom row central vertex
 } else
    tempVec4.set(0, defaultVertices[1], 0, 1); // Top row central vertex
  

  // Calcaulate intersection point
  // Move vertex in front of the cameraUser
  cameraUser.translateZ(-distanceFrontCamera);
  cameraUser.updateMatrix();
  tempVec4 = tempVec4.applyMatrix4(cameraUser.matrix, tempVec4);
  cameraUser.translateZ(distanceFrontCamera);
  // Homogeneous division if needed
  if (tempVec4.w != 0)
    tempVec4.divideScalar(tempVec4.w);

  oppositeRowCentralVertex.set(tempVec4.x, tempVec4.y, tempVec4.z);

  // Calculate intersection with xz plane and cameraUser ray
  rayCameraUserToRowCentralVertex.subVectors(oppositeRowCentralVertex, cameraUser.position);
  // Ray is not parallel to the horizon
  if (rayCameraUserToRowCentralVertex.y !== 0){
    let t = (0 - cameraUser.position.y) / rayCameraUserToRowCentralVertex.y;
    // Intersection point
    secondIntersectionPoint.copy(cameraUser.position).add(rayCameraUserToRowCentralVertex.multiplyScalar(t));
    let magnitude = secondIntersectionPoint.length();
    if (magnitude > cameraUser.far){
      // APPROXIMATING HORIZON
      // TODO: DO NOT PAINT
      console.log("Do not paint (cameraUser looking towards horizon but too far).");
    }
    // If ray points behind the cameraUser
    let dirA = rayCameraUserToRowCentralVertex.subVectors(oppositeRowCentralVertex, cameraUser.position);
    let dirB = rayCameraUserToIntersectPoint.subVectors(secondIntersectionPoint, cameraUser.position);
    let dotResult = dirA.dot(dirB);
    if(dotResult < 0){
      // TODO: DO NOT PAINT
      console.log("Do not paint (cameraUser looking upwards).");
    } else {
      // CONTINUE SCRIPT
      // CALCULATE CAMERA LOOKAT AND oceanGrid HEIGHT (RANGE)
      // Extend intersect point to horizon
      intersectionPoint.normalize().multiplyScalar(cameraUser.far);
      // Calculate top and bottom central vertices of ocean grid
      gridTopCentralVertex.subVectors(intersectionPoint, cameraGrid.position).normalize().multiplyScalar(distanceFrontCamera).add(cameraGrid.position);
      gridBottomCentralVertex.subVectors(secondIntersectionPoint, cameraGrid.position).normalize().multiplyScalar(distanceFrontCamera).add(cameraGrid.position);
      let yRange = gridBottomCentralVertex.distanceTo(gridTopCentralVertex);
      yHeightScale = yRange / 4.5;
      camGridTarget.addVectors(gridTopCentralVertex, gridBottomCentralVertex).multiplyScalar(0.5);
      cameraGrid.lookAt(camGridTarget);
      cameraGrid.updateMatrix();
    }
  } 
  // LOOKING AT HORIZON, DO NOT PAINT
  else {
    // TODO: DO NOT PAINT
    console.log("Do not paint (bottom cameraUser frustrum looking at horizon).")
  }
  
}






// Make as if it was a child of camera
function updateObjectMatrixAccordingToCamera(node, inCam){
  let cam = inCam || cameraUser;
  node.position.copy( cam.position );
  node.rotation.copy( cam.rotation );
  node.updateMatrix();
}











// Update uniforms
function updateUniforms(){
  cameraGrid.updateMatrix();

  gpuGrid.material.uniforms.u_time.value = new Date().getTime() - time;
  gpuGrid.material.uniforms.u_time.uniformsNeedUpdate = true;

  gpuGrid.material.uniforms.u_cameraModelMatrix.value = cameraGrid.matrix;
  gpuGrid.material.uniforms.u_cameraModelMatrix.uniformsNeedUpdate = true;
  
  gpuGrid.material.uniforms.u_cameraGridPosition.value = cameraGrid.position;
  gpuGrid.material.uniforms.u_cameraGridPosition.uniformsNeedUpdate = true;

  gpuGrid.material.uniforms.u_cameraViewportScale.value.x = cameraUser.aspect;
  gpuGrid.material.uniforms.u_cameraViewportScale.value.y = yHeightScale;
  gpuGrid.material.uniforms.u_cameraViewportScale.uniformsNeedUpdate = true;



  
  

}








function resizeRendererToDisplaySize(renderer) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    rendererPreview.setSize(canvasPreview.clientWidth, canvasPreview.clientHeight, false);
  }
  return needResize;
}


function windowWasResized(){
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    cameraUser.aspect = canvas.clientWidth / canvas.clientHeight;
    cameraUser.updateProjectionMatrix();
    const canvasPreview = rendererPreview.domElement;
    cameraPreview.aspect = canvasPreview.clientWidth / canvasPreview.clientHeight;
    cameraPreview.updateProjectionMatrix();
  }
}

window.addEventListener("resize", windowWasResized);
window.addEventListener("load", ()=> {
  cameraUser.aspect = canvas.clientWidth / canvas.clientHeight;
  cameraUser.updateProjectionMatrix();
  cameraPreview.aspect = canvasPreview.clientWidth / canvasPreview.clientHeight;
  cameraPreview.updateProjectionMatrix();
  windowWasResized();
});






function animate() {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

  // Update camera grid
  updateCameraGrid();
  // Update grid from camera
  updatePlane(cameraGrid);

  // Update grid gpu
  updateObjectMatrixAccordingToCamera(gpuGrid, cameraGrid);
  gpuGrid.translateZ(-distanceFrontCamera);
  gpuGrid.updateMatrix();
  
  // Helpers
  updateObjectMatrixAccordingToCamera(coneObj);
  updateObjectMatrixAccordingToCamera(coneGridObj, cameraGrid);

  // Update uniforms for grid gpu
  updateUniforms();
  
  
  // Render main scene
  // Hide frontal grid
  oceanGrid.visible = false;
  cameraGridCone.visible = false;
	renderer.render( scene, cameraUser );
  oceanGrid.visible = true;
  cameraGridCone.visible = true;

  controls.update();
  controlsPreview.update();

  rendererPreview.render( scene, cameraPreview);
}

animate();