import { Object3D, Mesh, Light, Camera, InstancedMesh, Scene } from 'three'

/**
 * Type for a panel component that renders details about a 3D object
 */
export type DetailPanelComponent = React.ComponentType<{ object: Object3D }>

/**
 * Interface for defining a detail panel entry in the registry
 */
export interface DetailPanelEntry {
  /**
   * The panel component to render
   */
  component: DetailPanelComponent

  /**
   * Function that determines if this panel should be shown for the given object
   */
  shouldShow: (object: Object3D) => boolean

  /**
   * Display order of the panel (lower numbers appear first)
   */
  order: number
}

/**
 * Registry of all available detail panel components
 */
const detailPanelRegistry: DetailPanelEntry[] = []

/**
 * Register a new detail panel component
 */
export function registerDetailPanel(entry: DetailPanelEntry): void {
  detailPanelRegistry.push(entry)
}

/**
 * Get all panels that should be shown for a given object, sorted by order
 */
export function getPanelsForObject(object: Object3D): DetailPanelComponent[] {
  return detailPanelRegistry
    .filter((entry) => entry.shouldShow(object))
    .sort((a, b) => a.order - b.order)
    .map((entry) => entry.component)
}

/**
 * Public API for registering custom detail panels
 */
export function registerCustomDetailPanel(entry: DetailPanelEntry): void {
  // Insert the custom panel based on its order priority
  detailPanelRegistry.push(entry)

  // Sort the registry by order to maintain correct display order
  detailPanelRegistry.sort((a, b) => a.order - b.order)
}

/**
 * Create a custom panel component factory with TypeScript type safety
 */
export function createDetailPanel<T extends Object3D>(
  component: React.ComponentType<{ object: T }>,
  options: {
    shouldShow: (obj: Object3D) => obj is T
    order: number
  }
): void {
  registerDetailPanel({
    component: component as DetailPanelComponent,
    shouldShow: options.shouldShow,
    order: options.order
  })
}

/**
 * Helper function to create type-checking predicates
 */
export const is = {
  mesh: (obj: Object3D): obj is Mesh => obj.type === 'Mesh',
  instancedMesh: (obj: Object3D): obj is InstancedMesh => obj.type === 'InstancedMesh',
  light: (obj: Object3D): obj is Light => obj instanceof Light,
  camera: (obj: Object3D): obj is Camera => obj instanceof Camera,
  scene: (obj: Object3D): obj is Scene => obj.type === 'Scene'
}
