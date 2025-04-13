import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { FreeLookControls } from './FreeLookControls'
import { Vector3, Camera, PerspectiveCamera, Object3D } from 'three'
import { useInspectorStore } from '../../store'

/**
 * React hook for integrating FreeLookControls with React Three Fiber
 * @returns Object with controls and focus method
 */
export function useFreeLookControls() {
  const { camera, gl, invalidate, controls: existingControls, scene } = useThree()
  const { isOpen, selectedObject, activateFreeLook, setFreeLookCamera, isFreeLookActive } =
    useInspectorStore()

  // Create a ref to store the controls instance
  const controlsRef = useRef<FreeLookControls | null>(null)

  // Setup controls when the inspector is open
  useEffect(() => {
    if (!isOpen) return

    // Store reference to any existing R3F controls
    let originalControlsEnabled = false
    if (existingControls) {
      console.log('Found existing R3F controls, will disable while in free look mode')
      originalControlsEnabled = (existingControls as any).enabled !== false
    }

    // Create new controls with the app camera as reference (but won't modify it)
    // Pass the scene so camera rig can be added to it
    const controls = new FreeLookControls(camera, gl.domElement, scene)
    controlsRef.current = controls

    // Store the free look camera in the inspector store
    setFreeLookCamera(controls.getCamera())

    // Connect controls to DOM events
    controls.connect()

    // Add context menu prevention (right-click)
    const onContextMenu = (e: Event) => e.preventDefault()
    gl.domElement.addEventListener('contextmenu', onContextMenu)

    // Add event listener for freelook activation/deactivation
    const handleFreeLookToggle = (event: Event) => {
      const customEvent = event as CustomEvent
      const isActive = customEvent.detail.active

      // Update free look state in the store
      activateFreeLook(isActive)

      // Toggle original controls when freelook is toggled
      if (existingControls && typeof (existingControls as any).enabled === 'boolean') {
        ;(existingControls as any).enabled = !isActive && originalControlsEnabled
        console.log(
          `FreeLook ${isActive ? 'active' : 'inactive'}, original controls ${(existingControls as any).enabled ? 'enabled' : 'disabled'}`
        )
      }

      // When activating, sync with app camera position and orientation
      if (isActive && controlsRef.current) {
        controlsRef.current.syncWithAppCamera()
      }

      // Force a re-render when controls change
      invalidate()
    }

    // Add event listener for focus request
    const handleFocusRequest = () => {
      if (selectedObject && controlsRef.current) {
        focusOnObject(selectedObject)
      }
    }

    gl.domElement.addEventListener('freelook:activated', handleFreeLookToggle)
    gl.domElement.addEventListener('freelook:focus', handleFocusRequest)

    return () => {
      // Cleanup
      if (controlsRef.current) {
        controlsRef.current.disconnect()
      }

      // Reset the free look state
      activateFreeLook(false)
      setFreeLookCamera(null)

      // Re-enable original controls if they exist
      if (existingControls && typeof (existingControls as any).enabled === 'boolean') {
        ;(existingControls as any).enabled = originalControlsEnabled
      }

      // Remove event listeners
      gl.domElement.removeEventListener('contextmenu', onContextMenu)
      gl.domElement.removeEventListener('freelook:activated', handleFreeLookToggle)
      gl.domElement.removeEventListener('freelook:focus', handleFocusRequest)
    }
  }, [
    camera,
    gl.domElement,
    isOpen,
    invalidate,
    existingControls,
    activateFreeLook,
    setFreeLookCamera,
    scene
  ])

  // Update controls on each frame - independent of rendering which is now handled by RenderLoopTakeover
  useFrame((state, delta) => {
    if (!controlsRef.current || !isOpen) return

    // Always update controls if they exist, inspector is open, and free look is active
    if (isFreeLookActive) {
      controlsRef.current.update(delta)
    }
  })

  /**
   * Focus the camera on a specific object
   */
  const focusOnObject = (object: Object3D | null) => {
    if (!object || !controlsRef.current) return

    // Get world position of the object
    const position = new Vector3()
    object.getWorldPosition(position)

    // Calculate appropriate distance based on object's bounding sphere or size
    let distance = 10 // Default distance

    // If the object has a bounding sphere, use its radius to calculate distance
    if ((object as any).geometry && (object as any).geometry.boundingSphere) {
      const radius = (object as any).geometry.boundingSphere.radius
      distance = radius * 2.5 // Adjust this multiplier as needed
    }

    // Focus the camera on the object
    controlsRef.current.focusOnObject(position, distance)

    // Force a re-render
    invalidate()
  }

  return {
    controls: controlsRef.current,
    focusOnObject
  }
}
