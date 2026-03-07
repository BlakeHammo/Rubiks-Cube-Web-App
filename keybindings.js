const STORAGE_KEY = 'rubiks-keybindings';

export const DEFAULT_BINDINGS = {
  'U': 'u',
  'D': 'd',
  'L': 'l',
  'R': 'r',
  'F': 'f',
  'B': 'b',
  'RotateLeft':  'ArrowLeft',
  'RotateRight': 'ArrowRight',
  'RotateUp':    'ArrowUp',
  'RotateDown':  'ArrowDown',
};

function loadBindings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate: all moves present, each a non-empty string
      const valid = Object.keys(DEFAULT_BINDINGS).every(
        k => typeof parsed[k] === 'string' && parsed[k].length >= 1
      );
      if (valid) return { ...DEFAULT_BINDINGS, ...parsed };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_BINDINGS };
}

let bindings = loadBindings();

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings)); } catch { /* ignore */ }
}

// Returns the key currently bound to a move name ('U', 'RotateLeft', etc.)
export function getKeyForMove(moveName) {
  return bindings[moveName] ?? moveName.toLowerCase();
}

// Returns a reverse map: { key → moveName } for the keyboard handler
export function getKeyMap() {
  const map = {};
  for (const [move, key] of Object.entries(bindings)) {
    map[key] = move;
  }
  return map;
}

export function getAllBindings() {
  return { ...bindings };
}

// Bind a move to a new key. If that key was already used by another move,
// swap the two bindings so there are no conflicts.
export function setKeyForMove(moveName, newKey) {
  const conflict = Object.entries(bindings).find(([, k]) => k === newKey)?.[0];
  if (conflict && conflict !== moveName) {
    bindings[conflict] = bindings[moveName]; // give conflict the old key
  }
  bindings[moveName] = newKey;
  save();
}

export function resetDefaults() {
  bindings = { ...DEFAULT_BINDINGS };
  save();
}
