import React, { useEffect, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import {
  useInspectorStore,
  useInspectorHotkeys,
  setupSceneGraphListener,
  buildSceneGraph
} from '../store'
import { InspectorUI } from './ui/InspectorUI'
import { useInspectorEvents } from './ui/useInspectorEvents'
import { Object3D } from 'three'
import { FreeLookControls } from './controls/FreeLookControlsComponent'

export interface ThreeInspectorProps {
  children?: React.ReactNode
}

/**
 * ThreeInspector component - Main entry point for the Three.js Inspector
 * Renders in a React Three Fiber canvas and provides scene inspection capabilities
 */
export function ThreeInspector({ children, ...props }: ThreeInspectorProps) {
  const { scene, camera, gl } = useThree()
  const {
    isOpen,
    setScene,
    setCamera,
    setRenderer,
    updateSceneGraph,
    selectedObject,
    selectObject
  } = useInspectorStore()

  // Setup keyboard shortcuts for toggling the inspector
  useInspectorHotkeys()

  // Setup events for inspector open/close
  useInspectorEvents()

  // Setup raycasting for object selection in the scene
  const handleSceneClick = useCallback(
    (event: MouseEvent) => {
      if (!isOpen || !scene) return

      // We'll implement this in Phase 5 with raycasting
      // For now, we just notify that it will be implemented later
      console.log('Scene object selection via clicking will be implemented in Phase 5')
    },
    [isOpen, scene]
  )

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

  // Setup click handler for scene object selection
  useEffect(() => {
    if (isOpen) {
      gl.domElement.addEventListener('click', handleSceneClick)
    } else {
      gl.domElement.removeEventListener('click', handleSceneClick)
    }

    return () => {
      gl.domElement.removeEventListener('click', handleSceneClick)
    }
  }, [isOpen, gl.domElement, handleSceneClick])

  // Setup object visibility listener to highlight selected objects
  useEffect(() => {
    if (!selectedObject || !isOpen) return

    // Store original userData to restore later
    const originalUserData = { ...selectedObject.userData }

    // Mark the object as selected in userData for potential visual highlights
    selectedObject.userData.selectedInInspector = true

    return () => {
      // Cleanup: restore original userData when selection changes or inspector closes
      if (selectedObject) {
        delete selectedObject.userData.selectedInInspector

        // Restore any other properties that might have been in userData
        Object.keys(originalUserData).forEach((key) => {
          selectedObject.userData[key] = originalUserData[key]
        })
      }
    }
  }, [selectedObject, isOpen])

  // Register scene, camera, and renderer with the inspector store
  useEffect(() => {
    setScene(scene)
    setCamera(camera)
    setRenderer(gl)

    // Initial scene graph build
    const sceneGraph = buildSceneGraph(scene)
    updateSceneGraph(sceneGraph)

    // Set up scene graph listener with change detection
    const cleanupListener = setupSceneGraphListener(
      scene,
      (updatedScene) => {
        const updatedGraph = buildSceneGraph(updatedScene)
        updateSceneGraph(updatedGraph)
      },
      (obj: Object3D) => {
        // This filter function allows us to exclude certain objects from change detection
        return !obj.userData.isHiddenFromInspector
      }
    )

    return () => {
      cleanupListener()
    }
  }, [scene, camera, gl, setScene, setCamera, setRenderer, updateSceneGraph])

  return (
    <>
      {/* The wrapped scene content */}
      <group name='ThreeInspector' {...props}>
        {children}
      </group>

      {/* The inspector UI will render here when isOpen is true */}
      {isOpen && (
        <>
          <InspectorUI />
          <FreeLookControls />
        </>
      )}
    </>
  )
}
