import React, { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useInspectorStore } from '../../store'

/**
 * Component that takes over the rendering loop when free look mode is active
 * This is a separate component because useFrame cannot be called conditionally
 */
export function RenderLoopTakeover() {
  const { scene, frameloop, invalidate } = useThree()
  const { isFreeLookActive, freeLookCamera } = useInspectorStore()

  // Handle rendering with the free look camera
  useFrame((state, delta) => {
    // Only override rendering when free look is active and we have a camera
    if (isFreeLookActive && freeLookCamera) {
      // Use the free look camera for rendering this frame
      state.gl.render(state.scene, freeLookCamera)

      // In 'demand' mode, we need to continuously request new frames
      // while free look is active to ensure smooth camera movement
      if (frameloop === 'demand' && isFreeLookActive) {
        invalidate()
      }
    }
  }, 1)

  useEffect(() => {
    let active = true
    scene.userData.isRenderedByInspector = true

    if (frameloop === 'demand') {
      const customLoop = () => {
        if (!active) return
        invalidate()
        requestAnimationFrame(customLoop)
      }
      customLoop()
    }

    return () => {
      active = false
      scene.userData.isRenderedByInspector = false
    }
  }, [scene, frameloop])

  // This is a "controller" component that doesn't render anything
  return null
}
