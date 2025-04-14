# Three Inspector

[![npm version](https://img.shields.io/npm/v/three-inspector.svg)](https://www.npmjs.com/package/three-inspector)
[![npm downloads](https://img.shields.io/npm/dm/three-inspector.svg)](https://www.npmjs.com/package/three-inspector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful scene inspector for React Three Fiber applications, inspired by Unity's scene hierarchy and inspector panels.

![Three Inspector Demo](https://placeholder.for.demo.screenshot.png)

## Features

- **React Three Fiber Integration**: Simply add the `<ThreeInspector>` component inside your `<Canvas>`
- **Toggle with Keyboard**: Use <kbd>Ctrl</kbd> + <kbd>I</kbd> / <kbd>Cmd</kbd> + <kbd>I</kbd> to open/close the inspector
- **Free Look Navigation**: Hold right mouse button to navigate the scene (WASD movement, mouse look)
  - <kbd>Shift</kbd> to move faster
  - <kbd>Q</kbd>/<kbd>E</kbd> to move down/up
- **Scene Hierarchy**: Browse your scene structure in the Outliner panel
- **Object Filtering**: Filter objects in the outliner by name (filters persist between sessions)
- **Visual Object Types**: Easily distinguish different object types by their icons
- **Object Details**: Inspect any object's properties including:
  - Name and type
  - Local and world positions
  - Rotations (in degrees) and scale

## Installation

```bash
# npm
npm install three-inspector

# pnpm
pnpm add three-inspector

# yarn
yarn add three-inspector
```

## Quick Start

Add the `ThreeInspector` component inside your React Three Fiber canvas:

```jsx
import { Canvas } from '@react-three/fiber'
import { ThreeInspector } from 'three-inspector'
import 'three-inspector/dist/index.css'

function App() {
  return (
    <Canvas>
      <ThreeInspector />

      {/* Your scene content */}
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
    </Canvas>
  )
}
```

That's it! Press <kbd>Ctrl</kbd>+<kbd>I</kbd> (or <kbd>Cmd</kbd>+<kbd>I</kbd> on Mac) to open the inspector.

## Usage Notes

### Performance Consideration

To optimize performance, Three Inspector takes over the rendering loop when opened. Your scene's rendering will be paused while the inspector is active. The inspector will:

1. Set `scene.userData.isRenderedByInspector` to `true`
2. Dispatch `inspectorOpened` and `inspectorClosed` events on the canvas element

You can listen for these events to adjust your application's behavior:

```jsx
useEffect(() => {
  const canvas = document.querySelector('canvas')

  const handleInspectorOpen = () => {
    // Pause your animations or other performance-heavy operations
  }

  const handleInspectorClose = () => {
    // Resume normal rendering
  }

  canvas.addEventListener('inspectorOpened', handleInspectorOpen)
  canvas.addEventListener('inspectorClosed', handleInspectorClose)

  return () => {
    canvas.removeEventListener('inspectorOpened', handleInspectorOpen)
    canvas.removeEventListener('inspectorClosed', handleInspectorClose)
  }
}, [])
```

## Extending with Custom Detail Panels

The object details panel system is modular and extensible. You can create custom panels for your specialized object types.

```tsx
import { BasePanel, PropertyRow, registerCustomDetailPanel } from 'three-inspector'
import { Object3D } from 'three'

// Your custom Three.js object
class MyCustomObject extends Object3D {
  customProperty = 'Custom Value'
  anotherProperty = 42
}

// Create a custom panel component
function MyCustomObjectPanel({ object }: { object: Object3D }) {
  const customObj = object as MyCustomObject

  return (
    <BasePanel title='My Custom Object' object={object}>
      <PropertyRow label='Custom Prop' value={customObj.customProperty} />
      <PropertyRow label='Another Prop' value={customObj.anotherProperty} />
    </BasePanel>
  )
}

// Register your custom panel
registerCustomDetailPanel({
  component: MyCustomObjectPanel,
  shouldShow: (obj) => obj instanceof MyCustomObject,
  order: 25 // Controls where in the panel list it appears
})
```

For more details on extending the inspector, see the [Object Details Panel documentation](./docs/object-details-panel.md).

## Built-in Detail Panels

The inspector includes specialized panels for different Three.js object types:

- **ObjectPanel**: Basic Object3D properties (shown for all objects)
- **TransformPanel**: Position, rotation, and scale
- **MeshPanel**: Mesh-specific properties
- **GeometryPanel**: Geometry information
- **MaterialPanel**: Material properties
- **LightPanel**: Light-specific properties
- **CameraPanel**: Camera-specific properties
- **InstancedMeshPanel**: InstancedMesh properties
- **SkinnedMeshPanel**: Skinned mesh properties

## Requirements

### Peer Dependencies

- React: `^18.0.0 || ^19.0.0`
- React DOM: `^18.0.0 || ^19.0.0`
- React Three Fiber: `^8.0.0 || ^9.0.0`
- Three.js: `^0.164.0`

## Development

```bash
# Install dependencies
pnpm install

# Start development server with example app
pnpm dev

# Build the library
pnpm build

# Run tests
pnpm test
```

## Project Roadmap

### v1.0.0 (Current Focus)

- React Three Fiber support

### v2.0.0 (Future)

- Vanilla Three.js support
- Hook into any Three.js scene with `ThreeInspector.open(scene, renderer, camera?)`
- Match inspector viewport with main camera position

## License

[MIT](LICENSE)
