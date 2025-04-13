import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useInspectorStore } from '../../store'

/**
 * Custom hook to handle inspector events
 * Dispatches events when the inspector opens or closes
 */
export function useInspectorEvents() {
  const { gl } = useThree()
  const { isOpen } = useInspectorStore()
  const prevIsOpenRef = useRef(isOpen)

  useEffect(() => {
    // Skip if state hasn't changed
    if (prevIsOpenRef.current === isOpen) return

    // Get the canvas element
    const canvas = gl.domElement

    // Dispatch the appropriate event
    if (isOpen) {
      // Dispatch inspector opened event
      const openEvent = new CustomEvent('inspectorOpened', {
        detail: { timestamp: Date.now() }
      })
      canvas.dispatchEvent(openEvent)
      console.log('Inspector opened')
    } else {
      // Dispatch inspector closed event
      const closeEvent = new CustomEvent('inspectorClosed', {
        detail: { timestamp: Date.now() }
      })
      canvas.dispatchEvent(closeEvent)
      console.log('Inspector closed')
    }

    // Update ref for the next render
    prevIsOpenRef.current = isOpen
  }, [isOpen, gl])

  return null
}
