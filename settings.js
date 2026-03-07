import { getAllBindings, setKeyForMove, resetDefaults } from './keybindings.js';

const MOVE_LABELS = {
  'U': 'U  ·  Up layer',
  'D': 'D  ·  Down layer',
  'L': 'L  ·  Left layer',
  'R': 'R  ·  Right layer',
  'F': 'F  ·  Front face',
  'B': 'B  ·  Back face',
  'RotateLeft':  'Rotate left',
  'RotateRight': 'Rotate right',
  'RotateUp':    'Rotate up',
  'RotateDown':  'Rotate down',
};

const KEY_DISPLAY = {
  'ArrowLeft':  '←',
  'ArrowRight': '→',
  'ArrowUp':    '↑',
  'ArrowDown':  '↓',
};

function displayKey(key) {
  return KEY_DISPLAY[key] ?? key.toUpperCase();
}

const CUBE_MOVES   = ['U', 'D', 'L', 'R', 'F', 'B'];
const CAMERA_MOVES = ['RotateLeft', 'RotateRight', 'RotateUp', 'RotateDown'];
const ALLOWED_SPECIAL = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

let awaitingKeyFor = null; // move name currently waiting to be rebound

// ─── Setup ────────────────────────────────────────────────────────────────────

export function setupSettings() {
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  document.getElementById('bindings-reset').addEventListener('click', () => {
    resetDefaults();
    renderBindings();
  });

  // Click the backdrop to close
  document.getElementById('settings-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeSettings();
  });

  // Capture-phase keydown so this intercepts before the cube's move handler
  window.addEventListener('keydown', onRebindKeyDown, { capture: true });

  renderBindings();
}

function openSettings() {
  cancelRebind();
  renderBindings();
  document.getElementById('settings-modal').style.display = 'flex';
}

function closeSettings() {
  cancelRebind();
  document.getElementById('settings-modal').style.display = 'none';
}

// ─── Rebind Capture ───────────────────────────────────────────────────────────

function onRebindKeyDown(e) {
  if (!awaitingKeyFor) return;

  // Always swallow the event so the cube doesn't move
  e.preventDefault();
  e.stopImmediatePropagation();

  if (e.key === 'Escape') {
    cancelRebind();
    return;
  }

  // Accept single printable characters or allowed special keys (arrows)
  if (e.key.length !== 1 && !ALLOWED_SPECIAL.has(e.key)) return;

  // Store multi-char keys as-is; lowercase single chars
  const storeKey = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  setKeyForMove(awaitingKeyFor, storeKey);
  awaitingKeyFor = null;
  renderBindings();
}

function cancelRebind() {
  awaitingKeyFor = null;
  renderBindings();
}

// ─── UI Rendering ─────────────────────────────────────────────────────────────

function renderBindings() {
  const bindings = getAllBindings();
  const list = document.getElementById('bindings-list');
  list.innerHTML = '';

  renderSection(list, 'Cube Moves', CUBE_MOVES, bindings);
  renderSection(list, 'Camera Controls', CAMERA_MOVES, bindings);
}

function renderSection(list, title, moves, bindings) {
  const header = document.createElement('div');
  header.className = 'settings-section';
  header.textContent = title;
  list.appendChild(header);

  for (const move of moves) {
    const key = bindings[move];
    const row = document.createElement('div');
    row.className = 'binding-row';

    const label = document.createElement('span');
    label.className = 'move-label';
    label.textContent = MOVE_LABELS[move] ?? move;

    const btn = document.createElement('button');
    btn.className = 'key-btn' + (awaitingKeyFor === move ? ' listening' : '');
    btn.textContent = awaitingKeyFor === move ? '...' : displayKey(key);
    btn.title = 'Click to rebind';
    btn.addEventListener('click', () => startRebind(move));

    row.appendChild(label);
    row.appendChild(btn);
    list.appendChild(row);
  }
}

function startRebind(moveName) {
  awaitingKeyFor = moveName;
  renderBindings(); // refreshes button state to show '...'
}
