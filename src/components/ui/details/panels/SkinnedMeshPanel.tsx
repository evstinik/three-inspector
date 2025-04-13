import React from 'react'
import { Object3D, SkinnedMesh, Bone } from 'three'
import { BasePanel, PropertyRow } from './BasePanel'
import { registerDetailPanel } from '../registry'

interface SkinnedMeshPanelProps {
  object: Object3D
}

/**
 * Example specialized panel for SkinnedMesh objects
 */
export function SkinnedMeshPanel({ object }: SkinnedMeshPanelProps) {
  const skinnedMesh = object as SkinnedMesh

  // Show only for skinned meshes
  if (!(object instanceof SkinnedMesh)) return null

  // Get information about bones
  const boneCount = skinnedMesh.skeleton?.bones?.length || 0
  const rootBone = skinnedMesh.skeleton?.bones[0]

  return (
    <BasePanel title='Skinned Mesh' object={object}>
      <PropertyRow label='Bone Count' value={boneCount} />

      {rootBone && (
        <PropertyRow label='Root Bone' value={rootBone.name || rootBone.uuid.substring(0, 8)} />
      )}

      <PropertyRow label='Bind Mode' value={skinnedMesh.bindMode} />

      {boneCount > 0 && (
        <>
          <div className='detail-sub-header'>Bone Hierarchy:</div>
          <div className='bone-hierarchy'>
            {renderBoneHierarchy(skinnedMesh.skeleton?.bones[0], 0)}
          </div>
        </>
      )}
    </BasePanel>
  )
}

/**
 * Helper function to render a hierarchical view of bones
 */
function renderBoneHierarchy(bone: Bone | undefined, depth: number): React.ReactNode {
  if (!bone) return null

  const indent = '  '.repeat(depth)

  return (
    <div key={bone.uuid} className='bone-item'>
      <div className='detail-row'>
        <span className='detail-value'>
          {indent}└ {bone.name || `Bone_${bone.uuid.substring(0, 6)}`}
        </span>
      </div>
      {bone.children.map((child) => renderBoneHierarchy(child as Bone, depth + 1))}
    </div>
  )
}

// Register this panel in the registry
registerDetailPanel({
  component: SkinnedMeshPanel,
  shouldShow: (obj) => obj instanceof SkinnedMesh,
  order: 25 // Show after general mesh info but before material
})
