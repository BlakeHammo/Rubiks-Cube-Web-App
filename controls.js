import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MOVES } from './cube.js';
import { getKeyMap } from './keybindings.js';

// CW rotation direction for each face when viewed from outside the cube.
// Verified against MOVES table: F(+Z)→dir:-1, U(+Y)→dir:+1, R(+X)→dir:-1, etc.
const FACE_MOVE = {
  '+x': { axis: 'x', layer:  1, cw: -1 },
  '-x': { axis: 'x', layer: -1, cw:  1 },
  '+y': { axis: 'y', layer:  1, cw: -1 },
  '-y': { axis: 'y', layer: -1, cw:  1 },
  '+z': { axis: 'z', layer:  1, cw: -1 },
  '-z': { axis: 'z', layer: -1, cw:  1 },
};

export const FACE_NAMES = {
  '+x': 'Red', '-x': 'Orange', '+y': 'Yellow', '-y': 'White', '+z': 'Green', '-z': 'Blue',
};

export const FACE_COLORS = {
  '+x': 0xcc0000, '-x': 0xff6000, '+y': 0xffdd00, '-y': 0xffffff, '+z': 0x00aa00, '-z': 0x0000cc,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function vecToKey(v) {
  const ax = Math.abs(v.x), ay = Math.abs(v.y), az = Math.abs(v.z);
  if (ax >= ay && ax >= az) return v.x > 0 ? '+x' : '-x';
  if (ay >= ax && ay >= az) return v.y > 0 ? '+y' : '-y';
  return v.z > 0 ? '+z' : '-z';
}

function snapToAxis(v) {
  const key = vecToKey(v);
  const r = new THREE.Vector3();
  if      (key === '+x') r.x =  1;
  else if (key === '-x') r.x = -1;
  else if (key === '+y') r.y =  1;
  else if (key === '-y') r.y = -1;
  else if (key === '+z') r.z =  1;
  else                   r.z = -1;
  return r;
}

// Find the natural "up" direction for a given front face.
// Projects world-up (0,1,0) onto the face plane; degenerates to -Z for top/bottom.
function computeUpDir(frontDir) {
  const worldUp = new THREE.Vector3(0, 1, 0);
  const dot = worldUp.dot(frontDir);
  const projected = worldUp.clone().sub(frontDir.clone().multiplyScalar(dot));
  if (projected.length() < 0.001) {
    // Front is parallel to worldUp (top or bottom face) — use -Z as reference
    const altRef = new THREE.Vector3(0, 0, -1);
    const dot2 = altRef.dot(frontDir);
    return snapToAxis(altRef.clone().sub(frontDir.clone().multiplyScalar(dot2)));
  }
  return snapToAxis(projected);
}

// Find the MOVES key that matches a physical face + CW/CCW intention.
function findMoveName(faceDir, cw) {
  const fm = FACE_MOVE[vecToKey(faceDir)];
  const dir = cw ? fm.cw : -fm.cw;
  return Object.entries(MOVES).find(([, def]) =>
    def.axis === fm.axis && def.layer === fm.layer && def.direction === dir
  )?.[0] ?? null;
}

// Build a key→moveName map for all 12 moves given a front/up orientation.
// right = cross(−front, up)  [verified for default: cross(-Z,+Y)=+X ✓]
function computeKeyMap(frontDir, upDir) {
  const back  = frontDir.clone().negate();
  const down  = upDir.clone().negate();
  const right = new THREE.Vector3().crossVectors(frontDir.clone().negate(), upDir);
  const left  = right.clone().negate();

  return {
    'U':  findMoveName(upDir,    true),
    "U'": findMoveName(upDir,    false),
    'D':  findMoveName(down,     true),
    "D'": findMoveName(down,     false),
    'F':  findMoveName(frontDir, true),
    "F'": findMoveName(frontDir, false),
    'B':  findMoveName(back,     true),
    "B'": findMoveName(back,     false),
    'R':  findMoveName(right,    true),
    "R'": findMoveName(right,    false),
    'L':  findMoveName(left,     true),
    "L'": findMoveName(left,     false),
  };
}

// ─── Setup ───────────────────────────────────────────────────────────────────

export function setupControls(camera, renderer, getCubeletsFn, onMove, onFaceSelect) {
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.08;
  orbitControls.minDistance = 4;
  orbitControls.maxDistance = 18;

  // Default orientation: green face (+Z) is front
  const defaultFront = new THREE.Vector3(0, 0, 1);
  let currentKeyMap = computeKeyMap(defaultFront, computeUpDir(defaultFront));
  onFaceSelect(defaultFront);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  window.addEventListener('keydown', (e) => {
    const stdName = getKeyMap()[e.key.toLowerCase()]; // e.g. 'u' → 'U'
    if (!stdName) return;
    const actualName = e.shiftKey
      ? currentKeyMap[stdName + "'"]
      : currentKeyMap[stdName];
    if (actualName) onMove(actualName);
  });

  // ── Face Click → set front face ───────────────────────────────────────────
  const raycaster = new THREE.Raycaster();

  function getMouseNDC(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width)  *  2 - 1,
      ((event.clientY - rect.top)  / rect.height) * -2 + 1
    );
  }

  // Use `click` (not mousedown) so orbiting doesn't accidentally trigger it.
  renderer.domElement.addEventListener('click', (e) => {
    raycaster.setFromCamera(getMouseNDC(e), camera);
    const hits = raycaster.intersectObjects(getCubeletsFn());
    if (!hits.length) return;

    const hit = hits[0];
    const worldNormal = hit.face.normal.clone()
      .transformDirection(hit.object.matrixWorld);
    const frontDir = snapToAxis(worldNormal);
    const upDir    = computeUpDir(frontDir);

    currentKeyMap = computeKeyMap(frontDir, upDir);
    onFaceSelect(frontDir);
  });

  return orbitControls;
}
