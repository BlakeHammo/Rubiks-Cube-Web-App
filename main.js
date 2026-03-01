import * as THREE from 'three';
import {
  createCube, getCubelets, executeMove, isSolved,
  resetCube, scrambleCube, isMoving,
} from './cube.js';
import { setupControls, FACE_NAMES, FACE_COLORS } from './controls.js';
import {
  setupUI, incrementMoveCount, startTimer, stopTimer,
  isTimerRunning, getElapsedSeconds, showWinMessage, resetUI, setFrontFace,
} from './ui.js';
import { setupSettings } from './settings.js';

// ─── Scene ────────────────────────────────────────────────────────────────────

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// ─── Camera ───────────────────────────────────────────────────────────────────

const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(4, 3, 5);
camera.lookAt(0, 0, 0);

// ─── Renderer ─────────────────────────────────────────────────────────────────

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ─── Lighting ─────────────────────────────────────────────────────────────────

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// ─── Cube ─────────────────────────────────────────────────────────────────────

createCube(scene);

// ─── Face Highlight ───────────────────────────────────────────────────────────
// A transparent plane that floats in front of the currently selected face.

const highlightMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(3.06, 3.06),
  new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
);
scene.add(highlightMesh);

function vecToKey(v) {
  const ax = Math.abs(v.x), ay = Math.abs(v.y), az = Math.abs(v.z);
  if (ax >= ay && ax >= az) return v.x > 0 ? '+x' : '-x';
  if (ay >= ax && ay >= az) return v.y > 0 ? '+y' : '-y';
  return v.z > 0 ? '+z' : '-z';
}

function onFaceSelect(frontDir) {
  const key = vecToKey(frontDir);

  // Position the highlight plane slightly outside the selected face
  highlightMesh.position.copy(frontDir.clone().multiplyScalar(1.52));
  highlightMesh.lookAt(frontDir.clone().multiplyScalar(3));
  highlightMesh.material.color.setHex(FACE_COLORS[key]);

  setFrontFace(FACE_NAMES[key]);
}

// ─── State ────────────────────────────────────────────────────────────────────

let solved = false;

// ─── Move Handler ─────────────────────────────────────────────────────────────

function handleMove(moveName) {
  if (solved) return;
  if (isMoving()) return;

  executeMove(moveName, scene, () => {
    if (!isTimerRunning()) startTimer();
    incrementMoveCount();

    if (isSolved()) {
      stopTimer();
      solved = true;
      showWinMessage(
        document.getElementById('move-counter').textContent.replace('Moves: ', ''),
        getElapsedSeconds()
      );
    }
  });
}

// ─── Controls ─────────────────────────────────────────────────────────────────

const orbitControls = setupControls(
  camera, renderer, getCubelets, handleMove, onFaceSelect
);

// ─── UI ───────────────────────────────────────────────────────────────────────

setupSettings();

setupUI(
  // Scramble
  () => {
    if (isMoving()) return;
    solved = false;
    resetUI();
    scrambleCube(scene, () => {});
  },
  // Reset
  () => {
    if (isMoving()) return;
    solved = false;
    resetUI();
    resetCube(scene);
  }
);

// ─── Resize ───────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Animation Loop ───────────────────────────────────────────────────────────

function animate() {
  requestAnimationFrame(animate);
  orbitControls.update();
  renderer.render(scene, camera);
}

animate();
