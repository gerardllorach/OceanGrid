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





// CREATE RENDERER
const renderer = new THREE.WebGLRenderer();
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize( window.innerWidth, window.innerHeight );

// CREATE CANVAS
const canvas = renderer.domElement;
canvas.style.width = '100vw';
canvas.style.height = '100vh';
document.body.appendChild( canvas );


// CAMERA CONTROLS
const controls = new OrbitControls(camera, canvas);
camera.position.set(5, 6, 5);
controls.target.set(0, 0, 0);



// OBJECTS
// CUBE
let geometry = new THREE.BoxGeometry( 1, 1, 1 );
let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

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

let oceanGrid = new THREE.LineSegments( new THREE.WireframeGeometry( planeGeometry));
oceanGrid.material.depthTest = false;
oceanGrid.material.opacity = 1.0;
oceanGrid.material.transparent = true;
oceanGrid.frustrumculled = false;

scene.add( oceanGrid );



let tempVec4 = new THREE.Vector4();
let tempVec4a = new THREE.Vector4();
function updatePlane(){
  // Temporal, moves the vertices in front of camera using THREE operations
  //updateObjectMatrixAccordingToCamera(oceanGrid);
  //oceanGrid.translateZ(-10);

  let defaultVertices = planeGeometryDefault.attributes.position.array;
  let vertices = planeGeometry.attributes.position.array;
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

    // Calculate intersection with xz plane and camera ray

    // Reassign position to vertex
    if (isNaN(tempVec4.x) || isNaN(tempVec4.y) || isNaN(tempVec4.z) || isNaN(tempVec4.w)){
      debugger;
    }
    vertices[i*3] = tempVec4.x;
    vertices[i*3 + 1] = tempVec4.y; 
    vertices[i*3 + 2] = tempVec4.z;
  }
  //console.log(camera.matrix.elements[0]);
  //console.log(tempVec4.z);
  //console.log(defaultVertices[0])
  // Reset matrx

  // Update geometry
  let geom = oceanGrid.geometry;
  oceanGrid.geometry.dispose();
  oceanGrid.geometry = new THREE.WireframeGeometry(geom.parameters.geometry);
  
}



// Make as if it was a child of camera
function updateObjectMatrixAccordingToCamera(node){
  node.position.copy( camera.position );
  node.rotation.copy( camera.rotation );
  node.updateMatrix();
}






function resizeRendererToDisplaySize(renderer) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}


function windowWasResized(){
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

window.addEventListener("resize", windowWasResized);
window.addEventListener("load", ()=> {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  windowWasResized();
});






function animate() {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

  updatePlane();

	renderer.render( scene, camera );

  controls.update();
}

animate();