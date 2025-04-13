import React from 'react'
import { Object3D, Mesh, Material, MeshBasicMaterial, MeshStandardMaterial, Color } from 'three'
import { BasePanel, PropertyRow } from './BasePanel'
import { registerDetailPanel, is } from '../registry'

interface MaterialPanelProps {
  object: Object3D
}

/**
 * Helper to convert a Three.js Color to a hex string
 */
function colorToHex(color: Color): string {
  return `#${color.getHexString()}`
}

/**
 * Panel showing material details for objects that have material properties
 */
export function MaterialPanel({ object }: MaterialPanelProps) {
  // We need to cast the object to access the material property
  const mesh = object as Mesh
  const material = mesh.material

  if (!material) return null

  // Handle multiple materials
  if (Array.isArray(material)) {
    return (
      <BasePanel title='Materials' object={object}>
        <PropertyRow label='Count' value={material.length} />
        {material.map((mat, index) => (
          <div key={index} className='sub-detail'>
            <PropertyRow label={`[${index}] Type`} value={mat.type} />
            {renderMaterialProperties(mat, `[${index}] `)}
          </div>
        ))}
      </BasePanel>
    )
  }

  // Handle single material
  return (
    <BasePanel title='Material' object={object}>
      <PropertyRow label='Type' value={material.type} />
      {renderMaterialProperties(material)}
    </BasePanel>
  )
}

/**
 * Helper function to render properties specific to different material types
 */
function renderMaterialProperties(material: Material, prefix = ''): React.ReactNode {
  const props = []

  // Common properties for all materials
  props.push(
    <PropertyRow
      key='visible'
      label={`${prefix}Visible`}
      value={material.visible ? 'Yes' : 'No'}
    />,
    <PropertyRow
      key='transparent'
      label={`${prefix}Transparent`}
      value={material.transparent ? 'Yes' : 'No'}
    />,
    <PropertyRow key='opacity' label={`${prefix}Opacity`} value={material.opacity.toFixed(2)} />
  )

  // Properties specific to MeshBasicMaterial
  if (material.type === 'MeshBasicMaterial') {
    const basicMat = material as MeshBasicMaterial
    props.push(
      <PropertyRow key='color' label={`${prefix}Color`} value={colorToHex(basicMat.color)} />,
      <PropertyRow
        key='wireframe'
        label={`${prefix}Wireframe`}
        value={basicMat.wireframe ? 'Yes' : 'No'}
      />
    )
  }

  // Properties specific to MeshStandardMaterial
  if (material.type === 'MeshStandardMaterial') {
    const stdMat = material as MeshStandardMaterial
    props.push(
      <PropertyRow key='color' label={`${prefix}Color`} value={colorToHex(stdMat.color)} />,
      <PropertyRow
        key='roughness'
        label={`${prefix}Roughness`}
        value={stdMat.roughness.toFixed(2)}
      />,
      <PropertyRow
        key='metalness'
        label={`${prefix}Metalness`}
        value={stdMat.metalness.toFixed(2)}
      />
    )
  }

  return props
}

// Register this panel to the registry
registerDetailPanel({
  component: MaterialPanel,
  shouldShow: (obj) => is.mesh(obj) || is.instancedMesh(obj), // Only for meshes that have material
  order: 30
})
