import React, { useRef, useEffect } from 'react'
import { Object3D } from 'three'
import { getPanelsForObject } from './registry'
import { useInspectorStore } from '../../../store'

interface ObjectDetailsPanelProps {
  object: Object3D | null
}

/**
 * Main component for showing object details that dynamically renders
 * panels based on the object type and registered panel components
 */
export function ObjectDetailsPanel({ object }: ObjectDetailsPanelProps) {
  if (!object) {
    return <div className='placeholder-content'>Select an object to view details</div>
  }

  // Get the panel components that should be rendered for this object type
  const panelComponents = getPanelsForObject(object)

  return (
    <div className='object-details'>
      {panelComponents.map((PanelComponent, index) => (
        <PanelComponent key={index} object={object} />
      ))}
    </div>
  )
}

/**
 * Container component that connects to the store
 */
export function ObjectDetailsPanelContainer() {
  const { selectedObject } = useInspectorStore()
  const containerRef = useRef<HTMLDivElement>(null)

  // Prevent wheel events from propagating to the canvas
  useEffect(() => {
    const container = containerRef.current

    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation()
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <div ref={containerRef}>
      <ObjectDetailsPanel object={selectedObject} />
    </div>
  )
}
