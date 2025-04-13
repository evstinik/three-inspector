import React from 'react'
import { Object3D, Mesh } from 'three'
import { BasePanel, PropertyRow } from './BasePanel'
import { registerDetailPanel, is } from '../registry'

interface GeometryPanelProps {
  object: Object3D
}

/**
 * Panel showing geometry details for objects that have a geometry property
 */
export function GeometryPanel({ object }: GeometryPanelProps) {
  // We need to cast the object to access the geometry property
  const mesh = object as Mesh
  const geometry = mesh.geometry

  if (!geometry) return null

  // Get information about the geometry
  const vertexCount = geometry.attributes?.position ? geometry.attributes.position.count : 'unknown'

  const indexCount = geometry.index ? geometry.index.count : 'none'

  return (
    <BasePanel title='Geometry' object={object}>
      <PropertyRow label='Type' value={geometry.type} />
      <PropertyRow label='Vertices' value={vertexCount} />
      <PropertyRow label='Indices' value={indexCount} />
      {geometry.boundingSphere && (
        <PropertyRow
          label='Bounding Sphere'
          value={`Radius: ${geometry.boundingSphere.radius.toFixed(2)}`}
        />
      )}
      <PropertyRow
        label='Attributes'
        value={geometry.attributes ? Object.keys(geometry.attributes).join(', ') : 'none'}
      />
    </BasePanel>
  )
}

// Register this panel to the registry
registerDetailPanel({
  component: GeometryPanel,
  shouldShow: (obj) => is.mesh(obj) || is.instancedMesh(obj), // Only for meshes that have geometry
  order: 20
})
