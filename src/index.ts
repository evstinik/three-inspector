// Export the main component
export * from './components/ThreeInspector'

// Export types for external use
export { type OutlinerNode } from './store/inspectorStore'

// Export details panel extension system
export {
  registerCustomDetailPanel,
  createDetailPanel,
  type DetailPanelComponent,
  type DetailPanelEntry
} from './components/ui/details/registry'

// Export camera controls
export { FreeLookControls } from './components/controls/FreeLookControlsComponent'
export { useFreeLookControls } from './components/controls/useFreeLookControls'

// Export utility functions that might be useful for users
export {
  findObjectByName,
  findObjectsByType,
  getObjectWorldPosition,
  getDistanceBetweenObjects
} from './store/inspectorStore'
