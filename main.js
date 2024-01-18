import * as THREE from 'three';

//Scene and Cemera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

//Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
// ============================================== //



//cube object
const faceColours = [0xff0000, 0xff5733, 0xffffff, 0xffff00, 0x00ff00, 0x0000ff];
const materials = faceColours.map(color => new THREE.MeshBasicMaterial({ color }));

// Function to create a single cube with specified colors
const createColoredCube = (x, y, z, materials) => {
	const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
	const cubeMaterials = [
	  materials[0], // Right
	  materials[1], // Left
	  materials[2], // Top
	  materials[3], // Bottom
	  materials[4], // Front
	  materials[5]  // Back
	];
	const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
	cube.position.set(x, y, z);
	return cube;
  };


// Create a 3x3x3 grid of cubes
const cubeSize = 3;
for (let x = 0; x < cubeSize; x++) {
  for (let y = 0; y < cubeSize; y++) {
    for (let z = 0; z < cubeSize; z++) {
      const offsetX = (x - Math.floor(cubeSize / 2)) * 1.05; // Adjust spacing
      const offsetY = (y - Math.floor(cubeSize / 2)) * 1.05;
      const offsetZ = (z - Math.floor(cubeSize / 2)) * 1.05;
      const cube = createColoredCube(offsetX, offsetY, offsetZ, materials);
      scene.add(cube);
    }
  }
}


camera.position.z = 5;

// Animation and rendering function, calls every frame
function animate() {
	requestAnimationFrame( animate );

	scene.rotation.x += 0.001;
	scene.rotation.y += 0.001;

	renderer.render( scene, camera );
}

animate();