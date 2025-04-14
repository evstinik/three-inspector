import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Object3D, Scene, Camera, WebGLRenderer, Vector3, PerspectiveCamera } from 'three'

// Define the OutlinerNode interface directly in this module
export interface OutlinerNode {
  /** Three object unique id */
  objectId: string
  /** Object name or type if name is empty */
  name: string
  /** Three.js object type */
  type: string
  /** Child nodes */
  children: OutlinerNode[]
  /** Visibility state */
  visible?: boolean
  /** Whether this node is expanded in the outliner - for compatibility with react-arborist */
  isOpen?: boolean
}

// Main state interface for the inspector
interface InspectorState {
  // Inspector visibility state
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void

  // Scene references
  scene: Scene | null
  camera: Camera | null
  renderer: WebGLRenderer | null
  setScene: (scene: Scene) => void
  setCamera: (camera: Camera) => void
  setRenderer: (renderer: WebGLRenderer) => void

  // Selection state
  selectedObject: Object3D | null
  selectObject: (object: Object3D | null) => void
  // Get object by ID
  getObjectById: (id: string) => Object3D | null
  // Focus on object (camera will focus on this object)
  focusObject: (object: Object3D | null) => void

  // Scene graph
  sceneGraph: OutlinerNode[]
  updateSceneGraph: (nodes: OutlinerNode[]) => void
  refreshSceneGraph: () => void

  // Filter state
  searchTerm: string
  setSearchTerm: (term: string) => void

  // Free Look mode state
  isFreeLookActive: boolean
  freeLookCamera: PerspectiveCamera | null
  activateFreeLook: (active: boolean) => void
  setFreeLookCamera: (camera: PerspectiveCamera | null) => void
}

// Create the store with subscribeWithSelector middleware to allow subscribing to specific state changes
export const useInspectorStore = create<InspectorState>()(
  subscribeWithSelector((set, get) => ({
    // Inspector visibility
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),

    // Scene references
    scene: null,
    camera: null,
    renderer: null,
    setScene: (scene) => set({ scene }),
    setCamera: (camera) => set({ camera }),
    setRenderer: (renderer) => set({ renderer }),

    // Selection state
    selectedObject: null,
    selectObject: (object) => set({ selectedObject: object }),
    getObjectById: (id) => {
      const { scene } = get()
      if (!scene) return null

      let foundObject: Object3D | null = null
      scene.traverse((obj) => {
        if (obj.uuid === id) {
          foundObject = obj
        }
      })
      return foundObject
    },
    focusObject: (object) => {
      if (!object) return

      // Store the selection
      set({ selectedObject: object })

      // Emit a focus event that our controls will listen to
      const { renderer } = get()
      if (renderer) {
        renderer.domElement.dispatchEvent(new CustomEvent('freelook:focus'))
      }
    },

    // Scene graph
    sceneGraph: [],
    updateSceneGraph: (nodes) => set({ sceneGraph: nodes }),
    refreshSceneGraph: () => {
      const { scene } = get()
      if (scene) {
        const graph = buildSceneGraph(scene)
        set({ sceneGraph: graph })
      }
    },

    // Filter state
    searchTerm: '',
    setSearchTerm: (searchTerm) => set({ searchTerm }),

    // Free Look mode state
    isFreeLookActive: false,
    freeLookCamera: null,
    activateFreeLook: (active) => set({ isFreeLookActive: active }),
    setFreeLookCamera: (camera) => set({ freeLookCamera: camera })
  }))
)

// Helper function to build the scene graph for the outliner with filtering
export function buildSceneGraph(root: Object3D): OutlinerNode[] {
  const createNodes = (obj: Object3D): OutlinerNode[] => {
    return obj.children.map(
      (child): OutlinerNode => ({
        objectId: child.uuid,
        name: child.name || child.type,
        type: child.type,
        visible: child.visible,
        isOpen: false, // Default to collapsed, react-arborist will manage this
        children: createNodes(child)
      })
    )
  }

  return createNodes(root)
}

// Removed toggleNodeExpansion since react-arborist will manage node expansion state

// Setup listener for scene graph changes with improved filtering
export function setupSceneGraphListener(
  scene: Object3D,
  onSceneGraphChanged: (scene: Object3D) => void,
  objectFilter?: (obj: Object3D) => boolean
): () => void {
  const registerNewObject = (event: { child: Object3D }) => {
    let shouldNotify = false

    event.child.traverse((obj) => {
      // If we have no custom filter or the object passes the filter
      if (!shouldNotify && (!objectFilter || objectFilter(obj))) {
        shouldNotify = true
      }
      subscribeToObject(obj)
    })

    if (shouldNotify) {
      onSceneGraphChanged(scene)
    }
  }

  const unregisterObject = (event: { child: Object3D }) => {
    let shouldNotify = false

    event.child.traverse((obj) => {
      if (!shouldNotify && (!objectFilter || objectFilter(obj))) {
        shouldNotify = true
      }
      obj.removeEventListener('childadded', registerNewObject)
      obj.removeEventListener('childremoved', unregisterObject)
    })

    if (shouldNotify) {
      onSceneGraphChanged(scene)
    }
  }

  const subscribeToObject = (obj: Object3D) => {
    obj.addEventListener('childadded', registerNewObject)
    obj.addEventListener('childremoved', unregisterObject)
  }

  // Initial subscription to all objects in the scene
  scene.traverse(subscribeToObject)
  onSceneGraphChanged(scene)

  // Return cleanup function
  return () => {
    scene.traverse((obj) => {
      obj.removeEventListener('childadded', registerNewObject)
      obj.removeEventListener('childremoved', unregisterObject)
    })
  }
}

// Helper functions for working with selected objects

// Get the world position of an object
export function getObjectWorldPosition(object: Object3D): Vector3 {
  const position = new Vector3()
  object.getWorldPosition(position)
  return position
}

// Get the distance between two objects
export function getDistanceBetweenObjects(objA: Object3D, objB: Object3D): number {
  const posA = getObjectWorldPosition(objA)
  const posB = getObjectWorldPosition(objB)
  return posA.distanceTo(posB)
}

// Find an object in the scene by name (returns the first match)
export function findObjectByName(scene: Object3D, name: string): Object3D | null {
  let result: Object3D | null = null

  scene.traverse((obj) => {
    if (!result && obj.name === name) {
      result = obj
    }
  })

  return result
}

// Find objects in the scene by type
export function findObjectsByType(scene: Object3D, type: string): Object3D[] {
  const results: Object3D[] = []

  scene.traverse((obj) => {
    if (obj.type === type) {
      results.push(obj)
    }
  })

  return results
}
