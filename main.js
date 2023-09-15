import * as THREE from 'three';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';


// Debuggin global variables
window.THREE = THREE;

// CREATE SCENE
const scene = new THREE.Scene();

// CREATE CAMERA
const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 2000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

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
const controls = new OrbitControls(camera, canvas);
camera.position.set(5, 6, 5);
controls.target.set(0, 0, 0);


// SCENE PREVIEW SYSTEM
// CREATE OUTSIDE CAMERA
const cameraPreview = new THREE.PerspectiveCamera(fov, aspect, near, far);
cameraPreview.position.set(-15, 12, -15);
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



// OBJECTS
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
//let coneGeom2 = new THREE.ConeGeometry(0.5, 2);
let coneGeom2 = new THREE.SphereGeometry(0.3);
let coneMat2 = new THREE.MeshBasicMaterial( { color:  "rgb(127, 255, 127)"} );
const cameraGridCone = new THREE.Mesh(coneGeom2, coneMat2);
const coneGridObj = new THREE.Object3D();
cameraGridCone.rotateX(Math.PI/2);
coneGridObj.add(cameraGridCone);
scene.add( coneGridObj );


// GRID HELPER
let size = 10;
let divisions = 10;
const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );

// OCEAN GRID
size = 5;
divisions = 10;
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
oceanGridProjected.material.opacity = 0.2;
oceanGridProjected.material.transparent = true;
oceanGridProjected.frustrumculled = false;

scene.add( oceanGrid );
scene.add( oceanGridProjected );















let tempVec3 = new THREE.Vector3();
let tempVec3a = new THREE.Vector3();
let tempVec3b = new THREE.Vector3();
let tempVec4 = new THREE.Vector4();
let tempVec4a = new THREE.Vector4();
let tempVec4b = new THREE.Vector4();
function updatePlane(){
  // Temporal, moves the vertices in front of camera using THREE operations
  //updateObjectMatrixAccordingToCamera(oceanGrid);
  //oceanGrid.translateZ(-10);

  let defaultVertices = planeGeometryDefault.attributes.position.array;
  let vertices = planeGeometry.attributes.position.array;
  let projectedVertices = projectedPlaneGeom.attributes.position.array;
  let numVertices = vertices.length/3;
  

  for (let i = 0; i < numVertices; i++){
    // Use temp vector
    tempVec4.set(defaultVertices[i*3], defaultVertices[i*3 + 1], defaultVertices[i*3 + 2], 1);
    
    // Move vertices in front of the camera
    camera.translateZ(-10);
    camera.updateMatrix();
    tempVec4 = tempVec4.applyMatrix4(camera.matrix, tempVec4);
    camera.translateZ(10);
    // Homogeneous division if needed
    if (tempVec4.w != 0)
      tempVec4.divideScalar(tempVec4.w);

    topRowCentralVertex.set(tempVec4.x, tempVec4.y, tempVec4.z);

    // Calculate intersection with xz plane and camera ray
    let rayDirection = tempVec4a.subVectors(tempVec4, camera.position);
    // Ray is not parallel to the horizon
    if (rayDirection.y !== 0){
      let t = (0 - camera.position.y) / rayDirection.y;
      // Intersection point
      tempVec4b = tempVec4b.copy(camera.position).add(rayDirection.multiplyScalar(t));
    }


    // Reassign position to vertex
    if (isNaN(tempVec4.x) || isNaN(tempVec4.y) || isNaN(tempVec4.z) || isNaN(tempVec4.w)){
      debugger;
    }
    // In front of the camera
    vertices[i*3] = tempVec4.x;
    vertices[i*3 + 1] = tempVec4.y; 
    vertices[i*3 + 2] = tempVec4.z;
    // On the XZ plane
    projectedVertices[i*3] = tempVec4b.x;
    projectedVertices[i*3 + 1] = tempVec4b.y; 
    projectedVertices[i*3 + 2] = tempVec4b.z;

  }
  // Reset matrx

  // Update geometry
  let geom = oceanGrid.geometry;
  oceanGrid.geometry.dispose();
  oceanGrid.geometry = new THREE.WireframeGeometry(geom.parameters.geometry);

  geom = oceanGridProjected.geometry;
  oceanGridProjected.geometry.dispose();
  oceanGridProjected.geometry = new THREE.WireframeGeometry(geom.parameters.geometry);
  //oceanGridProjected.scale.set(1.5,1.5, 1.5);
}





// Update the camera grid position and orientation
let intersectPoint = new THREE.Vector3();
let topRowCentralVertex = new THREE.Vector3();
function updateCameraGrid(){
  
  // Check if central vertex of top row is inside frustrum
  let defaultVertices = planeGeometryDefault.attributes.position.array;
  tempVec4.set(0, defaultVertices[1], 0, 1); // Top row central vertex
  
  // Move vertices in front of the camera
  camera.translateZ(-10);
  camera.updateMatrix();
  tempVec4 = tempVec4.applyMatrix4(camera.matrix, tempVec4);
  camera.translateZ(10);
  // Homogeneous division if needed
  if (tempVec4.w != 0)
    tempVec4.divideScalar(tempVec4.w);

  topRowCentralVertex.set(tempVec4.x, tempVec4.y, tempVec4.z);

  // Calculate intersection with xz plane and camera ray
  let rayDirection = tempVec4a.subVectors(tempVec4, camera.position);

  

  // Ray is not parallel to the horizon
  if (rayDirection.y !== 0){
    let t = (0 - camera.position.y) / rayDirection.y;
    // Intersection point
    intersectPoint.copy(camera.position).add(rayDirection.multiplyScalar(t));
    let magnitude = intersectPoint.length();
    if (magnitude > camera.far){
      // APPROXIMATING HORIZON, RECALCULATE CAMERA GRID MATRIX
      calculateCameraGridMatrix(intersectPoint, topRowCentralVertex);
    }
    // If ray points behind the camera
    let dirA = tempVec3.subVectors(topRowCentralVertex, camera.position);
    let dirB = tempVec3a.subVectors(intersectPoint, camera.position);
    let dotResult = dirA.dot(dirB);
    if(dotResult < 0){
      // Find intersection between frustrum and XZ plane
      intersectPoint.copy(rayDirection).normalize().multiplyScalar(camera.far); // Extend ray to end of frustrum (camera.far)
      intersectPoint.y = 0;
      calculateCameraGridMatrix(intersectPoint, topRowCentralVertex);
    } else {
      updateObjectMatrixAccordingToCamera(cameraGrid);
    }
  } 
  // LOOKING AT HORIZON, RECALCULATE CAMERA GRID MATRIX
  else {
    // Find intersection between frustrum and XZ plane
    intersectPoint.copy(rayDirection).normalize().multiplyScalar(camera.far); // Extend ray to end of frustrum (camera.far)
    intersectPoint.y = 0;
    calculateCameraGridMatrix(intersectPoint, topRowCentralVertex);
  }
}


// Camera grid must be moved
function calculateCameraGridMatrix(intersectPoint, topRowCentralVertex){
  if (intersectPoint.y > 0.0001)
    console.log(intersectPoint);

  // Find camera position using top row central vertex, intersection point and distance from camera to top row central vertex
  let distanceCamToVertex = camera.position.distanceTo(topRowCentralVertex);
  let camGridPosition = tempVec3b.subVectors(intersectPoint, topRowCentralVertex).normalize().multiplyScalar(distanceCamToVertex);
  camGridPosition.add(topRowCentralVertex);
  cameraGrid.position.copy(camGridPosition);
  cameraGrid.updateMatrix();


  
  

}






// Make as if it was a child of camera
function updateObjectMatrixAccordingToCamera(node, inCam){
  let cam = inCam || camera;
  node.position.copy( cam.position );
  node.rotation.copy( cam.rotation );
  node.updateMatrix();
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
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    const canvasPreview = rendererPreview.domElement;
    cameraPreview.aspect = canvasPreview.clientWidth / canvasPreview.clientHeight;
    cameraPreview.updateProjectionMatrix();
  }
}

window.addEventListener("resize", windowWasResized);
window.addEventListener("load", ()=> {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  cameraPreview.aspect = canvasPreview.clientWidth / canvasPreview.clientHeight;
  cameraPreview.updateProjectionMatrix();
  windowWasResized();
});






function animate() {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

  // Update grid from camera
  updatePlane();
  // Update camera grid
  updateCameraGrid();
  // Helpers
  updateObjectMatrixAccordingToCamera(coneObj);
  updateObjectMatrixAccordingToCamera(coneGridObj, cameraGrid);
  
  

	renderer.render( scene, camera );

  controls.update();

  rendererPreview.render( scene, cameraPreview);
}

animate();