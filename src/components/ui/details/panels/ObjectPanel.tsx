import React from 'react'
import { Object3D } from 'three'
import { BasePanel, PropertyRow } from './BasePanel'
import { registerDetailPanel } from '../registry'

interface ObjectPanelProps {
  object: Object3D
}

/**
 * Panel showing basic Object3D properties that all objects have
 */
export function ObjectPanel({ object }: ObjectPanelProps) {
  return (
    <BasePanel title='Object' object={object}>
      <PropertyRow label='Name' value={object.name || '<unnamed>'} />
      <PropertyRow label='Type' value={object.type} />
      <PropertyRow label='UUID' value={object.uuid} />
      <PropertyRow label='Visible' value={object.visible ? 'Yes' : 'No'} />
      <PropertyRow label='Renderorder' value={object.renderOrder} />
      <PropertyRow label='Children' value={object.children.length} />
    </BasePanel>
  )
}

// Register this panel to the registry
registerDetailPanel({
  component: ObjectPanel,
  shouldShow: () => true, // Show for all objects
  order: 0 // Place at the top
})
