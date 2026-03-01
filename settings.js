import { getAllBindings, setKeyForMove, resetDefaults } from './keybindings.js';

const MOVE_LABELS = {
  'U': 'U  ·  Up layer',
  'D': 'D  ·  Down layer',
  'L': 'L  ·  Left layer',
  'R': 'R  ·  Right layer',
  'F': 'F  ·  Front face',
  'B': 'B  ·  Back face',
};

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

  // Only accept single printable characters (letters, numbers, symbols)
  if (e.key.length !== 1) return;

  setKeyForMove(awaitingKeyFor, e.key.toLowerCase());
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

  for (const [move, key] of Object.entries(bindings)) {
    const row = document.createElement('div');
    row.className = 'binding-row';

    const label = document.createElement('span');
    label.className = 'move-label';
    label.textContent = MOVE_LABELS[move] ?? move;

    const btn = document.createElement('button');
    btn.className = 'key-btn' + (awaitingKeyFor === move ? ' listening' : '');
    btn.textContent = awaitingKeyFor === move ? '...' : key;
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
