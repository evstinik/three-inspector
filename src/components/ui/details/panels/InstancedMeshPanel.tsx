import React from 'react'
import { Object3D, InstancedMesh, Matrix4, Vector3, Quaternion } from 'three'
import { BasePanel, PropertyRow } from './BasePanel'
import { registerDetailPanel, is } from '../registry'

interface InstancedMeshPanelProps {
  object: Object3D
}

/**
 * Panel showing InstancedMesh specific properties
 */
export function InstancedMeshPanel({ object }: InstancedMeshPanelProps) {
  const instancedMesh = object as InstancedMesh

  // Return null if not an instanced mesh
  if (!(object instanceof InstancedMesh)) return null

  // Get instance count
  const count = instancedMesh.count

  // Extract instance information for the first few instances
  const maxInstancesToShow = 5
  const instances = []

  const matrix = new Matrix4()
  const position = new Vector3()
  const quaternion = new Quaternion()
  const scale = new Vector3()

  for (let i = 0; i < Math.min(count, maxInstancesToShow); i++) {
    instancedMesh.getMatrixAt(i, matrix)
    matrix.decompose(position, quaternion, scale)

    instances.push({
      index: i,
      position: [position.x.toFixed(2), position.y.toFixed(2), position.z.toFixed(2)],
      scale: [scale.x.toFixed(2), scale.y.toFixed(2), scale.z.toFixed(2)]
    })
  }

  return (
    <BasePanel title='Instanced Mesh' object={object}>
      <PropertyRow label='Count' value={count} />
      <PropertyRow
        label='Buffer Usage'
        value={instancedMesh.instanceMatrix.usage === 35048 ? 'Dynamic' : 'Static'}
      />

      {/* Display instance details */}
      {instances.length > 0 && (
        <>
          <div className='detail-sub-header'>Instance Details:</div>
          {instances.map((instance) => (
            <div key={instance.index} className='instance-detail'>
              <PropertyRow
                label={`#${instance.index}`}
                value={`Pos: (${instance.position.join(', ')}), Scale: (${instance.scale.join(', ')})`}
              />
            </div>
          ))}
          {count > maxInstancesToShow && (
            <div className='detail-footer'>... and {count - maxInstancesToShow} more instances</div>
          )}
        </>
      )}
    </BasePanel>
  )
}

// Register this panel to the registry
registerDetailPanel({
  component: InstancedMeshPanel,
  shouldShow: is.instancedMesh,
  order: 25
})
