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

// GRID
let size = 10;
let divisions = 10;
const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );

// PLANE
size = 5;
divisions = 10;
geometry = new THREE.PlaneGeometry( size, size, divisions, divisions );
let geomWireframe = new THREE.WireframeGeometry( geometry);
let line = new THREE.LineSegments( geomWireframe );
line.material.depthTest = false;
line.material.opacity = 1.0;
line.material.transparent = true;

scene.add( line );





function updateObjectMatrixAccordingToCamera(node){
  node.position.copy( camera.position );
  node.rotation.copy( camera.rotation );
  node.updateMatrix();
  node.translateZ( - 10 );
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

  updateObjectMatrixAccordingToCamera(line);

	renderer.render( scene, camera );

  controls.update();
}

animate();