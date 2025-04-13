import { useHotkeys } from '@mantine/hooks'
import { useInspectorStore } from './inspectorStore'

/**
 * Custom hook for inspector keyboard shortcuts
 * Uses Mantine's useHotkeys utility
 */
export function useInspectorHotkeys() {
  const { toggle, isOpen } = useInspectorStore()

  // Use Mantine's useHotkeys hook for keyboard shortcuts
  useHotkeys([
    // Toggle inspector with Ctrl+I / Cmd+I
    ['mod+I', () => toggle()],

    // Focus on selected object with F key (when inspector is open)
    [
      'f',
      () => {
        if (isOpen) {
          // This will be implemented as part of the camera control system later
          console.log('Focus on selected object triggered')
        }
      }
    ]
  ])
}
