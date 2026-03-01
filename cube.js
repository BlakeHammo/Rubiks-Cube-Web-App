import * as THREE from 'three';

// Standard Rubik's cube colors
const COLORS = {
  RED:    0xcc0000,   // Right  (+X)
  ORANGE: 0xff6000,   // Left   (-X)
  YELLOW: 0xffdd00,   // Top    (+Y)
  WHITE:  0xffffff,   // Bottom (-Y)
  GREEN:  0x00aa00,   // Front  (+Z)
  BLUE:   0x0000cc,   // Back   (-Z)
  BLACK:  0x111111,   // Inner faces
};

// BoxGeometry face index → axis/sign mapping:
//   0 = +X (Right), 1 = -X (Left)
//   2 = +Y (Top),   3 = -Y (Bottom)
//   4 = +Z (Front), 5 = -Z (Back)

// Move definitions: axis, which layer (in logical coords), rotation direction
// direction: +1 or -1 (right-hand rule around the axis)
export const MOVES = {
  'U':  { axis: 'y', layer:  1, direction:  1 },
  "U'": { axis: 'y', layer:  1, direction: -1 },
  'D':  { axis: 'y', layer: -1, direction: -1 },
  "D'": { axis: 'y', layer: -1, direction:  1 },
  'R':  { axis: 'x', layer:  1, direction: -1 },
  "R'": { axis: 'x', layer:  1, direction:  1 },
  'L':  { axis: 'x', layer: -1, direction:  1 },
  "L'": { axis: 'x', layer: -1, direction: -1 },
  'F':  { axis: 'z', layer:  1, direction: -1 },
  "F'": { axis: 'z', layer:  1, direction:  1 },
  'B':  { axis: 'z', layer: -1, direction:  1 },
  "B'": { axis: 'z', layer: -1, direction: -1 },
};

let cubelets = [];
let isAnimating = false;

// ─── Cubelet Creation ────────────────────────────────────────────────────────

function getFaceColors(gx, gy, gz) {
  return [
    gx ===  1 ? COLORS.RED    : COLORS.BLACK,  // face 0: +X Right
    gx === -1 ? COLORS.ORANGE : COLORS.BLACK,  // face 1: -X Left
    gy ===  1 ? COLORS.YELLOW : COLORS.BLACK,  // face 2: +Y Top
    gy === -1 ? COLORS.WHITE  : COLORS.BLACK,  // face 3: -Y Bottom
    gz ===  1 ? COLORS.GREEN  : COLORS.BLACK,  // face 4: +Z Front
    gz === -1 ? COLORS.BLUE   : COLORS.BLACK,  // face 5: -Z Back
  ];
}

function createCubelet(gx, gy, gz) {
  const geometry = new THREE.BoxGeometry(0.98, 0.98, 0.98);
  const materials = getFaceColors(gx, gy, gz).map(color =>
    new THREE.MeshLambertMaterial({ color })
  );
  const mesh = new THREE.Mesh(geometry, materials);
  mesh.position.set(gx, gy, gz);
  mesh.userData.logicalPosition = new THREE.Vector3(gx, gy, gz);
  return mesh;
}

export function createCube(scene) {
  for (let gx = -1; gx <= 1; gx++) {
    for (let gy = -1; gy <= 1; gy++) {
      for (let gz = -1; gz <= 1; gz++) {
        const mesh = createCubelet(gx, gy, gz);
        cubelets.push(mesh);
        scene.add(mesh);
      }
    }
  }
}

export function getCubelets() {
  return cubelets;
}

export function resetCube(scene) {
  cubelets.forEach(c => scene.remove(c));
  cubelets.length = 0;
  isAnimating = false;
  createCube(scene);
}

// ─── Layer Rotation ──────────────────────────────────────────────────────────

function finishMove(pivot, layerCubelets, scene, onComplete) {
  // Detach cubelets back to scene preserving world transform.
  // Three.js rotation handles visuals correctly — we must NOT touch material colors.
  layerCubelets.forEach(c => scene.attach(c));
  scene.remove(pivot);

  // Snap positions to integers to kill float drift, then update world matrix
  // so isSolved() can read correct matrixWorld immediately.
  layerCubelets.forEach(c => {
    c.position.x = Math.round(c.position.x);
    c.position.y = Math.round(c.position.y);
    c.position.z = Math.round(c.position.z);
    c.userData.logicalPosition.set(c.position.x, c.position.y, c.position.z);
    c.updateWorldMatrix(true, false);
  });

  isAnimating = false;
  if (onComplete) onComplete();
}

export function executeMove(moveName, scene, onComplete, duration = 200) {
  if (isAnimating) return false;
  const moveDef = MOVES[moveName];
  if (!moveDef) return false;
  isAnimating = true;

  const { axis, layer, direction } = moveDef;

  // Collect the 9 cubelets in this layer
  const layerCubelets = cubelets.filter(c =>
    Math.round(c.userData.logicalPosition[axis]) === layer
  );

  // Create a temporary pivot group at the world origin
  const pivot = new THREE.Group();
  scene.add(pivot);
  layerCubelets.forEach(c => pivot.attach(c));

  // Animate rotation
  const TARGET_ANGLE = (Math.PI / 2) * direction;
  const startTime = performance.now();

  function animateStep(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    // Smoothstep easing
    const eased = t * t * (3 - 2 * t);
    pivot.rotation[axis] = TARGET_ANGLE * eased;

    if (t < 1) {
      requestAnimationFrame(animateStep);
    } else {
      pivot.rotation[axis] = TARGET_ANGLE;
      finishMove(pivot, layerCubelets, scene, onComplete);
    }
  }

  requestAnimationFrame(animateStep);
  return true;
}

export function isMoving() {
  return isAnimating;
}

// ─── Win Detection ───────────────────────────────────────────────────────────

// Determine which material index is facing a given world direction for a cubelet.
// We transform the world direction into the cubelet's local space and find the
// dominant component — this tells us which local face is currently pointing that way.
function getMaterialIndexFacing(cubelet, worldDir) {
  const invMatrix = new THREE.Matrix4().copy(cubelet.matrixWorld).invert();
  const localDir = worldDir.clone().transformDirection(invMatrix);
  const ax = Math.abs(localDir.x), ay = Math.abs(localDir.y), az = Math.abs(localDir.z);
  if (ax >= ay && ax >= az) return localDir.x > 0 ? 0 : 1;
  if (ay >= ax && ay >= az) return localDir.y > 0 ? 2 : 3;
  return localDir.z > 0 ? 4 : 5;
}

export function isSolved() {
  const faceChecks = [
    { axis: 'x', value:  1, worldDir: new THREE.Vector3(1, 0, 0) },
    { axis: 'x', value: -1, worldDir: new THREE.Vector3(-1, 0, 0) },
    { axis: 'y', value:  1, worldDir: new THREE.Vector3(0, 1, 0) },
    { axis: 'y', value: -1, worldDir: new THREE.Vector3(0, -1, 0) },
    { axis: 'z', value:  1, worldDir: new THREE.Vector3(0, 0, 1) },
    { axis: 'z', value: -1, worldDir: new THREE.Vector3(0, 0, -1) },
  ];

  return faceChecks.every(({ axis, value, worldDir }) => {
    const face = cubelets.filter(c =>
      Math.round(c.userData.logicalPosition[axis]) === value
    );
    const colors = face.map(c => {
      const idx = getMaterialIndexFacing(c, worldDir);
      return c.material[idx].color.getHex();
    });
    return colors.every(color => color === colors[0]);
  });
}

// ─── Scramble ────────────────────────────────────────────────────────────────

export function scrambleCube(scene, onComplete) {
  const moveNames = Object.keys(MOVES);
  const moves = Array.from({ length: 20 }, () =>
    moveNames[Math.floor(Math.random() * moveNames.length)]
  );

  function applyNext(index) {
    if (index >= moves.length) {
      onComplete();
      return;
    }
    executeMove(moves[index], scene, () => applyNext(index + 1), 50);
  }
  applyNext(0);
}
