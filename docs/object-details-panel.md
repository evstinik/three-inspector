# Object Details Panel System

The ThreeInspector's object details panel has been completely redesigned with a modular, extensible architecture. This system makes it easy to display object properties in a structured way and allows for extending the inspector with custom panels for specialized object types.

## Architecture

The details panel system is built around these key components:

1. **BasePanel** - A reusable component that provides the structure for all detail panels
2. **Panel Registry** - A registry system that determines which panels to show for each object type
3. **Specialized Panels** - Individual panels for different Three.js object types
4. **Extension API** - Functions for registering custom panels for your own object types

## Built-in Panel Types

The inspector includes these specialized panels by default:

- **ObjectPanel** - Basic Object3D properties (shown for all objects)
- **TransformPanel** - Position, rotation, and scale (shown for all objects)
- **MeshPanel** - Mesh-specific properties
- **GeometryPanel** - Geometry information for meshes
- **MaterialPanel** - Material properties and appearance
- **LightPanel** - Light-specific properties
- **CameraPanel** - Camera-specific properties
- **InstancedMeshPanel** - InstancedMesh properties and instance information
- **SkinnedMeshPanel** - Skinned mesh and bone hierarchy visualization

## Extending with Custom Panels

You can easily extend the inspector with your own custom panels for specialized object types. The library exports two functions for this purpose:

```typescript
// Option 1: Register a panel with full control
registerCustomDetailPanel({
  component: MyCustomPanel,
  shouldShow: (obj) => obj instanceof MyCustomObjectType,
  order: 50 // Controls where the panel appears in the list
})

// Option 2: Type-safe helper function
createDetailPanel<MyCustomObjectType>(MyCustomPanel, {
  shouldShow: (obj): obj is MyCustomObjectType => obj instanceof MyCustomObjectType,
  order: 50
})
```

### Example: Custom Panel for a Specialized Object

```tsx
import React from 'react'
import { Object3D } from 'three'
import { BasePanel, PropertyRow, registerCustomDetailPanel } from 'three-inspector'

// Your custom Three.js object type
class MyCustomObject extends Object3D {
  customProperty = 'Custom Value'
  anotherProperty = 42
}

// Create a custom panel component
function MyCustomObjectPanel({ object }: { object: Object3D }) {
  // Cast to your custom type
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

## Panel Component Structure

When creating custom panels, follow this structure:

1. Use the `BasePanel` component as the container
2. Use `PropertyRow` components for individual properties
3. Implement a `shouldShow` function to determine when to display your panel
4. Set the `order` value to control where your panel appears in the list

The details panel system is designed to be easy to extend while providing a consistent user experience.
