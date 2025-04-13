// Export the main component
export * from './components/ThreeInspector'

// Export types for external use
export { type OutlinerNode } from './store/inspectorStore'
export { type ObjectFilter, type ObjectFilterType } from './store/objectFilters'

// Export utility functions that might be useful for users
export {
  findObjectByName,
  findObjectsByType,
  getObjectWorldPosition,
  getDistanceBetweenObjects
} from './store/inspectorStore'
