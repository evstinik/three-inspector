import React, { useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import {
  useInspectorStore,
  useInspectorHotkeys,
  setupSceneGraphListener,
  buildSceneGraph
} from '../store'
import { InspectorUI } from './ui/InspectorUI'
import { useInspectorEvents } from './ui/useInspectorEvents'

export interface ThreeInspectorProps {
  children?: React.ReactNode
}

/**
 * ThreeInspector component - Main entry point for the Three.js Inspector
 * Renders in a React Three Fiber canvas and provides scene inspection capabilities
 */
export function ThreeInspector({ children, ...props }: ThreeInspectorProps) {
  const { scene, camera, gl } = useThree()
  const { isOpen, setScene, setCamera, setRenderer, updateSceneGraph } = useInspectorStore()

  // Setup keyboard shortcuts for toggling the inspector
  useInspectorHotkeys()

  // Setup events for inspector open/close
  useInspectorEvents()

  // Display welcome message in console
  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modKey = isMac ? '⌘' : 'Ctrl'

    console.log(
      `%c🔍 Three.js Inspector %cInitialized ✨\n%c👀 Press %c${modKey}+I %cto toggle the inspector`,
      'color: #42a5f5; font-weight: bold; font-size: 14px;',
      'color: #66bb6a; font-weight: bold; font-size: 14px;',
      'color: #78909c; font-size: 12px;',
      'color: #ff9800; font-weight: bold; font-size: 12px;',
      'color: #78909c; font-size: 12px;'
    )
  }, [])

  // Register scene, camera, and renderer with the inspector store
  useEffect(() => {
    setScene(scene)
    setCamera(camera)
    setRenderer(gl)

    // Initial scene graph build
    const sceneGraph = buildSceneGraph(scene)
    updateSceneGraph(sceneGraph)

    // Set up scene graph listener
    const cleanupListener = setupSceneGraphListener(scene, (updatedScene) => {
      const updatedGraph = buildSceneGraph(updatedScene)
      updateSceneGraph(updatedGraph)
    })

    return () => {
      cleanupListener()
    }
  }, [scene, camera, gl, setScene, setCamera, setRenderer, updateSceneGraph])

  // Handle rendering loop takeover when inspector is open
  useFrame(() => {
    if (isOpen) {
      // When inspector is open:
      // 1. Mark scene as being rendered by inspector
      scene.userData.isRenderedByInspector = true

      // 2. Render scene with inspector camera
      // (This will be implemented in Phase 5 with camera controls)
    } else {
      // When inspector is closed:
      // Remove flag and let the application handle rendering
      scene.userData.isRenderedByInspector = false
    }
  })

  return (
    <>
      {/* The wrapped scene content */}
      <group name='ThreeInspector' {...props}>
        {children}
      </group>

      {/* The inspector UI will render here when isOpen is true */}
      {isOpen && <InspectorUI />}
    </>
  )
}
