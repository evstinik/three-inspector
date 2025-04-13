import React from 'react'
import { Object3D, Camera, PerspectiveCamera, OrthographicCamera } from 'three'
import { BasePanel, PropertyRow } from './BasePanel'
import { registerDetailPanel, is } from '../registry'

interface CameraPanelProps {
  object: Object3D
}

/**
 * Panel showing camera properties for different types of cameras
 */
export function CameraPanel({ object }: CameraPanelProps) {
  const camera = object as Camera

  return (
    <BasePanel title='Camera' object={object}>
      {'near' in camera && typeof camera.near === 'number' && (
        <PropertyRow label='Near' value={camera.near.toFixed(2)} />
      )}
      {'far' in camera && typeof camera.far === 'number' && (
        <PropertyRow label='Far' value={camera.far.toFixed(2)} />
      )}

      {/* PerspectiveCamera specific properties */}
      {camera.type === 'PerspectiveCamera' && (
        <>
          <PropertyRow label='FOV' value={`${(camera as PerspectiveCamera).fov.toFixed(1)}°`} />
          <PropertyRow
            label='Aspect ratio'
            value={(camera as PerspectiveCamera).aspect.toFixed(3)}
          />
          <PropertyRow
            label='Focal Length'
            value={(camera as PerspectiveCamera).getFocalLength().toFixed(2)}
          />
        </>
      )}

      {/* OrthographicCamera specific properties */}
      {camera.type === 'OrthographicCamera' && (
        <>
          <PropertyRow label='Left' value={(camera as OrthographicCamera).left.toFixed(2)} />
          <PropertyRow label='Right' value={(camera as OrthographicCamera).right.toFixed(2)} />
          <PropertyRow label='Top' value={(camera as OrthographicCamera).top.toFixed(2)} />
          <PropertyRow label='Bottom' value={(camera as OrthographicCamera).bottom.toFixed(2)} />
          <PropertyRow label='Zoom' value={(camera as OrthographicCamera).zoom.toFixed(2)} />
        </>
      )}
    </BasePanel>
  )
}

// Register this panel to the registry
registerDetailPanel({
  component: CameraPanel,
  shouldShow: is.camera,
  order: 20
})
