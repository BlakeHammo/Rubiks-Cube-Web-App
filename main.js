import * as THREE from 'three';

//setting the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//setting the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//cube object
const geometry = new THREE.BoxGeometry( 3, 3, 3 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

//new object
const cube2 = new THREE.Mesh( geometry, material );
cube2.position.x = 1;
cube2.position.y = 1;
cube2.position.z = 1; 
scene.add( cube2 );

const cube3 = new THREE.Mesh( geometry, material );
cube3.position.x = -1;
cube3.position.y = -1;
cube3.position.z = -1;
scene.add( cube3 );


camera.position.z = 5;

// Animation and rendering function, calls every frame
function animate() {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	cube2.rotation.x += 0.01;
	cube2.rotation.y += 0.01;

	cube3.rotation.x += 0.01;
	cube3.rotation.y += 0.01;

	renderer.render( scene, camera );
}

animate();