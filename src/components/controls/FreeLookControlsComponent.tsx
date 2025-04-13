import React, { useEffect } from 'react'
import { useFreeLookControls } from './useFreeLookControls'
import { useInspectorStore } from '../../store'
import { useHotkeys } from '@mantine/hooks'
import { RenderLoopTakeover } from './RenderLoopTakeover'

/**
 * Component that adds free look camera controls to the inspector
 * - Hold right mouse button to activate free look mode
 * - WASD for horizontal movement
 * - Q/E for vertical movement
 * - Mouse for looking around
 * - Shift to move faster
 * - F to focus on the selected object
 */
export function FreeLookControls() {
  const { selectedObject, isFreeLookActive } = useInspectorStore()
  const { focusOnObject } = useFreeLookControls()

  // Add F key hotkey for focusing on selected object
  useHotkeys([
    [
      'f',
      () => {
        if (selectedObject) {
          focusOnObject(selectedObject)
        }
      }
    ]
  ])

  return (
    // Conditionally render the RenderLoopTakeover component when free look is active
    isFreeLookActive ? <RenderLoopTakeover /> : null
  )
}
