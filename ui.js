let moveCount = 0;
let timerInterval = null;
let timerStart = null;
let elapsedMs = 0;
let timerRunning = false;

// ─── Setup ───────────────────────────────────────────────────────────────────

export function setupUI(onScramble, onReset) {
  document.getElementById('scramble-btn').addEventListener('click', onScramble);
  document.getElementById('reset-btn').addEventListener('click', onReset);
}

// ─── Move Counter ─────────────────────────────────────────────────────────────

export function incrementMoveCount() {
  moveCount++;
  document.getElementById('move-counter').textContent = `Moves: ${moveCount}`;
}

// ─── Timer ────────────────────────────────────────────────────────────────────

export function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerStart = Date.now() - elapsedMs;
  timerInterval = setInterval(() => {
    elapsedMs = Date.now() - timerStart;
    document.getElementById('timer').textContent =
      `Time: ${(elapsedMs / 1000).toFixed(1)}s`;
  }, 100);
}

export function stopTimer() {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  elapsedMs = Date.now() - timerStart;
}

export function isTimerRunning() {
  return timerRunning;
}

export function getElapsedSeconds() {
  return elapsedMs / 1000;
}

// ─── Win Message ──────────────────────────────────────────────────────────────

export function showWinMessage(moves, seconds) {
  const el = document.getElementById('win-message');
  document.getElementById('win-stats').textContent =
    `${moves} moves · ${seconds.toFixed(1)}s`;
  el.style.display = 'block';
}

export function hideWinMessage() {
  document.getElementById('win-message').style.display = 'none';
}

// ─── Front Face Display ───────────────────────────────────────────────────────

export function setFrontFace(name) {
  document.getElementById('front-face').textContent = `Front: ${name}`;
}

// ─── Reset ────────────────────────────────────────────────────────────────────

export function resetUI() {
  stopTimer();
  moveCount = 0;
  elapsedMs = 0;
  timerStart = null;
  timerRunning = false;
  document.getElementById('move-counter').textContent = 'Moves: 0';
  document.getElementById('timer').textContent = 'Time: 0.0s';
  hideWinMessage();
}
