import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { useThree } from '@react-three/fiber'
import { useInspectorStore } from '../../store'
import './InspectorUI.css'

// Interface for the InspectorUI component props
interface InspectorUIProps {
  // Optional props can be added here later
}

/**
 * The actual DOM-based UI component that will be rendered into the root
 */
export function InspectorUIContent({ onClose }: { onClose: () => void }) {
  return (
    <div className='three-inspector-ui'>
      <div className='three-inspector-header'>
        <h1>Three.js Inspector</h1>
        <button onClick={onClose}>Close</button>
      </div>

      <div className='three-inspector-content'>
        <div className='three-inspector-panel three-inspector-outliner'>
          {/* Outliner panel will be implemented in Phase 4 */}
          <h2>Outliner</h2>
          <div className='placeholder-content'>Scene graph will appear here</div>
        </div>

        <div className='three-inspector-panel three-inspector-details'>
          {/* Object details panel will be implemented in Phase 4 */}
          <h2>Object Details</h2>
          <div className='placeholder-content'>Selected object properties will appear here</div>
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
