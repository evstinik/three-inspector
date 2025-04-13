import React from 'react'
import { Object3D, Mesh, InstancedMesh } from 'three'
import { BasePanel, PropertyRow } from './BasePanel'
import { registerDetailPanel, is } from '../registry'

interface MeshPanelProps {
  object: Object3D
}

/**
 * Panel showing mesh-specific properties
 */
export function MeshPanel({ object }: MeshPanelProps) {
  const mesh = object as Mesh

  return (
    <BasePanel title='Mesh' object={object}>
      <PropertyRow label='Cast Shadow' value={mesh.castShadow ? 'Yes' : 'No'} />
      <PropertyRow label='Receive Shadow' value={mesh.receiveShadow ? 'Yes' : 'No'} />
      <PropertyRow label='Frustum Culled' value={mesh.frustumCulled ? 'Yes' : 'No'} />

      {/* InstancedMesh specific properties */}
      {object.type === 'InstancedMesh' && (
        <PropertyRow label='Instance Count' value={(object as InstancedMesh).count} />
      )}
    </BasePanel>
  )
}

// Register this panel to the registry
registerDetailPanel({
  component: MeshPanel,
  shouldShow: (obj) => is.mesh(obj) || is.instancedMesh(obj),
  order: 15
})
