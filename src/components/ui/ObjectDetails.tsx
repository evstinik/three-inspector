import React from 'react'
import { Object3D, Vector3, Euler, Material, BufferGeometry } from 'three'
import { useInspectorStore } from '../../store'

interface ObjectDetailsProps {
  object: Object3D | null
}

/**
 * Component for displaying details of a selected Three.js object
 */
export function ObjectDetails({ object }: ObjectDetailsProps) {
  if (!object) {
    return <div className='placeholder-content'>Select an object to view details</div>
  }

  // Get material count if available
  const getMaterialInfo = () => {
    // @ts-ignore - accessing property that might not exist
    const material = object.material
    if (!material) return null

    if (Array.isArray(material)) {
      return `${material.length} materials`
    } else if (material instanceof Material) {
      return material.type
    }
    return 'Unknown material'
  }

  // Get geometry info if available
  const getGeometryInfo = () => {
    // @ts-ignore - accessing property that might not exist
    const geometry = object.geometry
    if (!geometry) return null

    if (geometry instanceof BufferGeometry) {
      const vertexCount = geometry.attributes.position
        ? geometry.attributes.position.count
        : 'unknown'
      return `${geometry.type} (${vertexCount} vertices)`
    }
    return geometry.type
  }

  return (
    <div className='object-details'>
      {/* Basic object information */}
      <h3>Object</h3>
      <div className='detail-row'>
        <span className='detail-label'>Name:</span>
        <span className='detail-value'>{object.name || '<unnamed>'}</span>
      </div>
      <div className='detail-row'>
        <span className='detail-label'>Type:</span>
        <span className='detail-value'>{object.type}</span>
      </div>
      <div className='detail-row'>
        <span className='detail-label'>UUID:</span>
        <span className='detail-value'>{object.uuid}</span>
      </div>
      <div className='detail-row'>
        <span className='detail-label'>Visible:</span>
        <span className='detail-value'>{object.visible ? 'Yes' : 'No'}</span>
      </div>

      {/* Geometry information if available */}
      {getGeometryInfo() && (
        <>
          <h3>Geometry</h3>
          <div className='detail-row'>
            <span className='detail-label'>Type:</span>
            <span className='detail-value'>{getGeometryInfo()}</span>
          </div>
        </>
      )}

      {/* Material information if available */}
      {getMaterialInfo() && (
        <>
          <h3>Material</h3>
          <div className='detail-row'>
            <span className='detail-label'>Type:</span>
            <span className='detail-value'>{getMaterialInfo()}</span>
          </div>
        </>
      )}

      {/* Transform information */}
      <h3>Position</h3>
      <div className='detail-row'>
        <span className='detail-label'>X:</span>
        <span className='detail-value'>{object.position.x.toFixed(3)}</span>
      </div>
      <div className='detail-row'>
        <span className='detail-label'>Y:</span>
        <span className='detail-value'>{object.position.y.toFixed(3)}</span>
      </div>
      <div className='detail-row'>
        <span className='detail-label'>Z:</span>
        <span className='detail-value'>{object.position.z.toFixed(3)}</span>
      </div>

      {/* Rotation (in degrees) */}
      <h3>Rotation (degrees)</h3>
      <div className='detail-row'>
        <span className='detail-label'>X:</span>
        <span className='detail-value'>{((object.rotation.x * 180) / Math.PI).toFixed(2)}°</span>
      </div>
      <div className='detail-row'>
        <span className='detail-label'>Y:</span>
        <span className='detail-value'>{((object.rotation.y * 180) / Math.PI).toFixed(2)}°</span>
      </div>
      <div className='detail-row'>
        <span className='detail-label'>Z:</span>
        <span className='detail-value'>{((object.rotation.z * 180) / Math.PI).toFixed(2)}°</span>
      </div>

      {/* Scale */}
      <h3>Scale</h3>
      <div className='detail-row'>
        <span className='detail-label'>X:</span>
        <span className='detail-value'>{object.scale.x.toFixed(3)}</span>
      </div>
      <div className='detail-row'>
        <span className='detail-label'>Y:</span>
        <span className='detail-value'>{object.scale.y.toFixed(3)}</span>
      </div>
      <div className='detail-row'>
        <span className='detail-label'>Z:</span>
        <span className='detail-value'>{object.scale.z.toFixed(3)}</span>
      </div>

      {/* World transform information */}
      <h3>World Position</h3>
      {(() => {
        const worldPos = new Vector3()
        object.getWorldPosition(worldPos)

        return (
          <>
            <div className='detail-row'>
              <span className='detail-label'>X:</span>
              <span className='detail-value'>{worldPos.x.toFixed(3)}</span>
            </div>
            <div className='detail-row'>
              <span className='detail-label'>Y:</span>
              <span className='detail-value'>{worldPos.y.toFixed(3)}</span>
            </div>
            <div className='detail-row'>
              <span className='detail-label'>Z:</span>
              <span className='detail-value'>{worldPos.z.toFixed(3)}</span>
            </div>
          </>
        )
      })()}
    </div>
  )
}

/**
 * Container component that connects to the store
 */
export function ObjectDetailsContainer() {
  const { selectedObject } = useInspectorStore()

  return <ObjectDetails object={selectedObject} />
}
