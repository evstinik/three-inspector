import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useThree } from '@react-three/fiber'
import { useInspectorStore, useFilterStore, createNameFilter, createTypeFilter } from '../../store'
import { SceneGraphContainer } from './SceneGraph'
import { ObjectDetailsPanelContainer } from './details'
import './InspectorUI.css'

// Interface for the InspectorUI component props
interface InspectorUIProps {
  // Optional props can be added here later
}

/**
 * The actual DOM-based UI component that will be rendered into the root
 */
export function InspectorUIContent({ onClose }: { onClose: () => void }) {
  const { refreshSceneGraph } = useInspectorStore()
  const { filters, addFilter, removeFilter, toggleFilter, clearFilters } = useFilterStore()
  const [searchTerm, setSearchTerm] = useState('')

  // Handle filter changes
  const handleAddFilter = () => {
    // Create a name filter based on the search term if it exists
    if (searchTerm) {
      addFilter(createNameFilter(searchTerm))
      setSearchTerm('') // Clear the search term after adding filter

      // Refresh the scene graph to apply the filter
      refreshSceneGraph()
    }
  }

  // Clear all filters
  const handleClearFilters = () => {
    clearFilters()
    refreshSceneGraph()
  }

  // Handle toggle filter and refresh scene graph
  const handleToggleFilter = (id: string) => {
    toggleFilter(id)
    refreshSceneGraph()
  }

  // Handle remove filter and refresh scene graph
  const handleRemoveFilter = (id: string) => {
    removeFilter(id)
    refreshSceneGraph()
  }

  return (
    <div className='three-inspector-ui'>
      <div className='three-inspector-header'>
        <h1>Three.js Inspector</h1>
        <button onClick={onClose}>Close</button>
      </div>

      <div className='three-inspector-content'>
        <div className='three-inspector-panel three-inspector-outliner'>
          <h2>Outliner</h2>

          {/* Search and filter controls */}
          <div className='outliner-controls'>
            <input
              type='text'
              placeholder='Search objects...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFilter()}
            />
            <button onClick={handleAddFilter}>Add Filter</button>
          </div>

          {/* Active filters display */}
          {filters.length > 0 && (
            <div className='active-filters'>
              <div className='filter-header'>
                <h3>Active Filters</h3>
                <button className='filter-clear-btn' onClick={handleClearFilters}>
                  Clear All
                </button>
              </div>
              {filters.map((filter) => (
                <div key={filter.id} className='filter-tag'>
                  <span>
                    {filter.type}: {filter.pattern}
                  </span>
                  <button
                    className={`filter-toggle-btn ${filter.enabled ? 'enabled' : 'disabled'}`}
                    onClick={() => handleToggleFilter(filter.id)}
                  >
                    {filter.enabled ? 'On' : 'Off'}
                  </button>
                  <button
                    className='filter-remove-btn'
                    onClick={() => handleRemoveFilter(filter.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Scene graph display using our dedicated component */}
          <SceneGraphContainer />
        </div>

        <div className='three-inspector-panel three-inspector-details'>
          <h2>Object Details</h2>
          {/* Object details using our new modular component system */}
          <ObjectDetailsPanelContainer />
        </div>
      </div>
    </div>
  )
}

/**
 * Main UI hook for the Three.js Inspector
 * This hook creates a separate React root outside the Three.js context
 */
export function InspectorUI({}: InspectorUIProps) {
  const { gl } = useThree()
  const { isOpen, close } = useInspectorStore()
  const rootRef = useRef<{ root: ReturnType<typeof createRoot>; container: HTMLDivElement } | null>(
    null
  )

  // Setup and cleanup the React root for the inspector UI
  useEffect(() => {
    // Create UI when inspector opens and no root exists yet
    if (isOpen && !rootRef.current) {
      // Get the parent container of the canvas
      const canvasParent = gl.domElement.parentElement
      if (!canvasParent) return

      // Create a container div for our UI
      const container = document.createElement('div')
      container.id = 'three-inspector-container'
      canvasParent.appendChild(container)

      // Create a React root
      const root = createRoot(container)

      // Store references
      rootRef.current = { root, container }

      // Render the UI
      root.render(<InspectorUIContent onClose={close} />)
    }

    // Clean up UI when inspector closes and root exists
    if (!isOpen && rootRef.current) {
      // Unmount the React root
      rootRef.current.root.unmount()

      // Remove the container from the DOM
      if (rootRef.current.container.parentElement) {
        rootRef.current.container.parentElement.removeChild(rootRef.current.container)
      }

      // Reset the ref
      rootRef.current = null
    }

    // Also clean up on component unmount
    return () => {
      if (rootRef.current) {
        rootRef.current.root.unmount()

        if (rootRef.current.container.parentElement) {
          rootRef.current.container.parentElement.removeChild(rootRef.current.container)
        }

        rootRef.current = null
      }
    }
  }, [isOpen, close, gl.domElement])

  // This component doesn't render anything in the Three.js canvas
  return null
}
