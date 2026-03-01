# 3D Rubik's Cube Web App
A fully playable 3D Rubik's Cube in the browser, built with Three.js and Vite.

## Features
- **3D cube** with correct per-face colouring (Red, Orange, Yellow, White, Green, Blue)
- **Camera orbit** — click and drag to rotate the view, scroll to zoom
- **Face selection** — click any face to set it as the Front face; keyboard controls update accordingly
- **Keyboard moves** — U, D, L, R, F, B keys perform the corresponding layer rotation; hold Shift for the inverse move
- **Custom key bindings** — open the Key Bindings panel to remap any move to a key of your choice (persisted in localStorage)
- **Smooth animations** — 200ms easing on every layer rotation
- **Move counter and timer** — tracks moves and elapsed time from your first move
- **Scramble and Reset** buttons
- **Win detection** — timer stops and a message is shown when the cube is solved

## Installation
Install dependencies:
```bash
npm install
```

## Usage
Start the dev server:
```bash
npx vite
```
Press `o + Enter` to open the app in your browser, or navigate to the local URL shown in the terminal.

## Controls

| Action | How |
|---|---|
| Rotate camera | Click and drag on empty space |
| Zoom | Scroll wheel |
| Set front face | Click a face on the cube |
| Perform a move | U / D / L / R / F / B |
| Inverse move | Shift + key |
| Rebind keys | Click **Key Bindings** button |
| Scramble | Click **Scramble** button |
| Reset | Click **Reset** button |

## Tech Stack
- [Three.js](https://threejs.org/) — 3D rendering
- [Vite](https://vitejs.dev/) — dev server and bundler

## Preview

![RubiksCube](https://github.com/BlakeHammo/Rubiks-Cube-Web-App/assets/114743774/0ec43aa1-56b2-45b2-9973-9a2f474cc961)
