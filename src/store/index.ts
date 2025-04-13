// Export store and utility functions
export {
  useInspectorStore,
  buildSceneGraph,
  setupSceneGraphListener,
  findObjectByName,
  findObjectsByType,
  getObjectWorldPosition,
  getDistanceBetweenObjects
} from './inspectorStore'

// Export filters
export {
  useFilterStore,
  createNameFilter,
  createTypeFilter,
  createPropertyFilter,
  createCustomFilter,
  type ObjectFilter,
  type ObjectFilterType
} from './objectFilters'

// Export hooks
export { useInspectorHotkeys } from './useInspectorHotkeys'
