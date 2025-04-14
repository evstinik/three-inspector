import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useThree } from '@react-three/fiber'
import { useInspectorStore } from '../../store'
import { SceneGraphContainer } from './SceneGraph'
import { ObjectDetailsPanelContainer } from './details'
import './InspectorUI.css'
import { useDebouncedValue } from '@mantine/hooks'

// Interface for the InspectorUI component props
interface InspectorUIProps {
  // Optional props can be added here later
}

/**
 * The actual DOM-based UI component that will be rendered into the root
 */
export function InspectorUIContent({ onClose }: { onClose: () => void }) {
  const { setSearchTerm } = useInspectorStore()
  const [localSearchTerm, setLocalSearchTerm] = useState(
    localStorage.getItem('three-inspector-search') || ''
  )

  // Debounce the search term with a 300ms delay
  const [debouncedSearchTerm] = useDebouncedValue(localSearchTerm, 300)

  // Update the store's search term whenever the debounced value changes
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm)
    localStorage.setItem('three-inspector-search', debouncedSearchTerm)
  }, [debouncedSearchTerm, setSearchTerm])

  return (
    <div className='three-inspector-ui'>
      <div className='three-inspector-header'>
        <h1>
          Three.js Inspector
          <a
            href='https://tally.so/r/nG75K2'
            target='_blank'
            rel='noopener noreferrer'
            className='feedback-link'
          >
            Feedback
          </a>
        </h1>
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
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          </div>

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

      // Apply critical styles directly to ensure it's correctly positioned
      container.style.position = 'absolute'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '100%'
      container.style.height = '100%'
      container.style.pointerEvents = 'none' // Let events pass through to canvas except where UI elements exist
      container.style.zIndex = '9998' // Just below the actual UI elements

      // Add container to DOM
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
