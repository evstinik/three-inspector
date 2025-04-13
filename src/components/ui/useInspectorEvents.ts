import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useInspectorStore } from '../../store'
import { Object3D } from 'three'

/**
 * Hook that sets up custom events for inspector actions
 * These events can be used by external code to interact with the inspector
 */
export function useInspectorEvents() {
  const { gl } = useThree()
  const { isOpen, open, close, selectObject, focusObject, scene, refreshSceneGraph } =
    useInspectorStore()

  useEffect(() => {
    if (!gl.domElement) return

    // Define event handlers
    const handleInspectorToggle = () => {
      useInspectorStore.getState().toggle()
    }

    const handleObjectSelect = (event: CustomEvent<{ object: Object3D }>) => {
      selectObject(event.detail.object)
    }

    const handleObjectFocus = (event: CustomEvent<{ object: Object3D }>) => {
      focusObject(event.detail.object)
    }

    const handleSceneGraphRefresh = () => {
      refreshSceneGraph()
    }

    // Add event listeners
    gl.domElement.addEventListener('toggleInspector', handleInspectorToggle)
    gl.domElement.addEventListener('objectSelected', handleObjectSelect as EventListener)
    gl.domElement.addEventListener('objectFocused', handleObjectFocus as EventListener)
    gl.domElement.addEventListener('refreshSceneGraph', handleSceneGraphRefresh)

    // Dispatch events when inspector opens/closes
    const dispatchInspectorStateChange = () => {
      if (isOpen) {
        const openEvent = new CustomEvent('inspectorOpened')
        gl.domElement.dispatchEvent(openEvent)
      } else {
        const closeEvent = new CustomEvent('inspectorClosed')
        gl.domElement.dispatchEvent(closeEvent)
      }
    }

    // Subscribe to changes in the inspector open state
    const unsubscribeFromOpenState = useInspectorStore.subscribe(
      (state) => state.isOpen,
      () => dispatchInspectorStateChange()
    )

    // Subscribe to changes in the selected object
    const unsubscribeFromSelectedObject = useInspectorStore.subscribe(
      (state) => state.selectedObject,
      (selectedObject) => {
        if (selectedObject) {
          const event = new CustomEvent('objectSelected', {
            detail: { object: selectedObject }
          })
          gl.domElement.dispatchEvent(event)
        }
      }
    )

    // Subscribe to changes in the scene graph
    const unsubscribeFromSceneGraph = useInspectorStore.subscribe(
      (state) => state.sceneGraph,
      () => {
        if (scene) {
          const event = new CustomEvent('sceneGraphChanged', {
            detail: { scene }
          })
          gl.domElement.dispatchEvent(event)
        }
      }
    )

    // Cleanup event listeners when component unmounts
    return () => {
      gl.domElement.removeEventListener('toggleInspector', handleInspectorToggle)
      gl.domElement.removeEventListener('objectSelected', handleObjectSelect as EventListener)
      gl.domElement.removeEventListener('objectFocused', handleObjectFocus as EventListener)
      gl.domElement.removeEventListener('refreshSceneGraph', handleSceneGraphRefresh)

      unsubscribeFromOpenState()
      unsubscribeFromSelectedObject()
      unsubscribeFromSceneGraph()
    }
  }, [gl.domElement, isOpen, open, close, selectObject, focusObject, scene, refreshSceneGraph])
}
