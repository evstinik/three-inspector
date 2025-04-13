import React from 'react'
import { Object3D, Vector3 } from 'three'
import { BasePanel, PropertyRow } from './BasePanel'
import { registerDetailPanel } from '../registry'

interface TransformPanelProps {
  object: Object3D
}

/**
 * Panel showing transform properties (position, rotation, scale)
 */
export function TransformPanel({ object }: TransformPanelProps) {
  // Calculate world position
  const worldPos = new Vector3()
  object.getWorldPosition(worldPos)

  // Convert rotation from radians to degrees
  const rotationDegX = ((object.rotation.x * 180) / Math.PI).toFixed(2)
  const rotationDegY = ((object.rotation.y * 180) / Math.PI).toFixed(2)
  const rotationDegZ = ((object.rotation.z * 180) / Math.PI).toFixed(2)

  return (
    <>
      <BasePanel title='Local Transform' object={object}>
        <PropertyRow
          label='Position'
          value={`X: ${object.position.x.toFixed(3)}, Y: ${object.position.y.toFixed(3)}, Z: ${object.position.z.toFixed(3)}`}
        />
        <PropertyRow
          label='Rotation'
          value={`X: ${rotationDegX}°, Y: ${rotationDegY}°, Z: ${rotationDegZ}°`}
        />
        <PropertyRow
          label='Scale'
          value={`X: ${object.scale.x.toFixed(3)}, Y: ${object.scale.y.toFixed(3)}, Z: ${object.scale.z.toFixed(3)}`}
        />
      </BasePanel>

      <BasePanel title='World Transform' object={object}>
        <PropertyRow
          label='Position'
          value={`X: ${worldPos.x.toFixed(3)}, Y: ${worldPos.y.toFixed(3)}, Z: ${worldPos.z.toFixed(3)}`}
        />
      </BasePanel>
    </>
  )
}

// Register this panel to the registry
registerDetailPanel({
  component: TransformPanel,
  shouldShow: () => true, // Show for all objects
  order: 10 // Place after basic object info
})
