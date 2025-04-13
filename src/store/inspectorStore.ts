import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Object3D, Scene, Camera, WebGLRenderer } from 'three'

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

  // Scene graph
  sceneGraph: OutlinerNode[]
  updateSceneGraph: (nodes: OutlinerNode[]) => void

  // Filter state
  searchTerm: string
  setSearchTerm: (term: string) => void
}

// Create the store with subscribeWithSelector middleware to allow subscribing to specific state changes
export const useInspectorStore = create<InspectorState>()(
  subscribeWithSelector((set) => ({
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

    // Scene graph
    sceneGraph: [],
    updateSceneGraph: (nodes) => set({ sceneGraph: nodes }),

    // Filter state
    searchTerm: '',
    setSearchTerm: (searchTerm) => set({ searchTerm })
  }))
)

// Helper function to build the scene graph for the outliner
export function buildSceneGraph(root: Object3D): OutlinerNode[] {
  const createNodes = (obj: Object3D): OutlinerNode[] => {
    return obj.children.map(
      (child): OutlinerNode => ({
        objectId: child.uuid,
        name: child.name || child.type,
        type: child.type,
        children: createNodes(child)
      })
    )
  }

  return createNodes(root)
}

// Setup listener for scene graph changes
export function setupSceneGraphListener(
  scene: Object3D,
  onSceneGraphChanged: (scene: Object3D) => void
): () => void {
  const registerNewObject = (event: { child: Object3D }) => {
    event.child.traverse(subscribeToObject)
    onSceneGraphChanged(scene)
  }

  const unregisterObject = (event: { child: Object3D }) => {
    event.child.traverse((obj) => {
      obj.removeEventListener('childadded', registerNewObject)
      obj.removeEventListener('childremoved', unregisterObject)
    })
    onSceneGraphChanged(scene)
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
