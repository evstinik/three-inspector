import { ThreeElements } from '@react-three/fiber'
import { Object3D } from 'three'

// Add Three.js Inspector specific type declarations
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }

  // Extend Object3D userData for inspector-specific properties
  namespace THREE {
    interface Object3DUserData {
      isHiddenFromInspector?: boolean
      isRenderedByInspector?: boolean
      customInspectorInfo?: Record<string, any>
    }
  }
}

// Custom events emitted by the Inspector
export interface InspectorEvents {
  inspectorOpened: CustomEvent
  inspectorClosed: CustomEvent
  objectSelected: CustomEvent<{ object: Object3D }>
  objectFocused: CustomEvent<{ object: Object3D }>
  sceneGraphChanged: CustomEvent<{ scene: Object3D }>
}

// Declare custom events on HTMLCanvasElement
declare global {
  interface HTMLCanvasElement {
    addEventListener<K extends keyof InspectorEvents>(
      type: K,
      listener: (this: HTMLCanvasElement, ev: InspectorEvents[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void
    removeEventListener<K extends keyof InspectorEvents>(
      type: K,
      listener: (this: HTMLCanvasElement, ev: InspectorEvents[K]) => any,
      options?: boolean | EventListenerOptions
    ): void
    dispatchEvent<K extends keyof InspectorEvents>(ev: InspectorEvents[K]): boolean
  }
}
