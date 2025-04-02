# Three.js Inspector

This project is a tool for all Three.js developers to simplify inspection of Three.js scenes, much like Unity has its own editor.

## Features

- (postponed until v2) With Three.js Inspector you can hook into any Three.js scene
- (postponed until v2) Open Inspector by calling `ThreeInspector.open(scene, renderer, camera?)`
- (postponed until v2) Appear in Inspector viewport exactly at the same place as your main camera by passing it in options as a third argument
- For React Three Fiber applications, just render `<ThreeInspector>` component inside `<Canvas>`
- Use CTRL + I / CMD + I shortcut to open Inspector
- Hold right mouse button to switch to Free Look mode (WASD movement, mouse look, shift to fly faster, Q/E to fly down/up)
- Visually inspect scene hierarchy in Outliner Panel
- Filter objects in outliner by name or type. Filters are persistant between sessions.
- Visually distinguish objects in scene hierarchy by icon
- Inspect any object's name; type; local and world position, rotation (in degrees) and scale in Object Detail Panel by selecting it in Outliner
- Zoom on any object by clicking on magnifying glass icon to the right of object name in Outliner or by using pressing F to focus on selected object

## Gotchas

- In order to save computing power, Three.js Inspector will take over the rendering loop. You should pause rendering your scene when Inspector is opened and continue when Inspector is closed. Three.js Inspector will set a flag `scene.userData.isRenderedByInspector` to true and dispatch events `inspectorOpened` and `inspectorClosed` on corresponding `HTMLCanvasElement` from the renderer.

## Roadmap

### v1.0.0

- [ ] React Three Fiber support

### v2.0.0

- [ ] Vanilla Three.js support

## Tech stack

- Three.js
- React
- React Three Fiber
- react-arborist (for outliner)
- Mantine UI
- [tabler](https://tabler.io/icons) icons
- zustand

## Technical Implementation Guide

- Project is a React Three Fiber library
- Use `pnpm`
- `pnpm build` should build a ESM module and TypeScript types and put it to `dist` folder
- When project is uploaded to npm registry or is packed to tar it should only contain `dist` and other required files like package.json. It should omit "src".
- `pnpm dev` should run example React Three Fiber app on vite, that integrates the library with hot module replacement and react fast refresh support
- `pnpm test` should run React Three Fiber component tests via `@react-three/test-renderer`.
