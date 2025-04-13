import React from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useInspectorStore } from '../../store'

/**
 * Component that takes over the rendering loop when free look mode is active
 * This is a separate component because useFrame cannot be called conditionally
 */
export function RenderLoopTakeover() {
  const { scene } = useThree()
  const { isFreeLookActive, freeLookCamera } = useInspectorStore()

  // Handle rendering with the free look camera
  useFrame((state, delta) => {
    // Only override rendering when free look is active and we have a camera
    if (isFreeLookActive && freeLookCamera) {
      // Use the free look camera for rendering this frame
      state.gl.render(state.scene, freeLookCamera)

      // Prevent the default render
      scene.userData.isRenderedByInspector = true
    } else {
      scene.userData.isRenderedByInspector = false
    }
  }, 1)

  // This is a "controller" component that doesn't render anything
  return null
}
