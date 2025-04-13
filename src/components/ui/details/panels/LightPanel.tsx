import React from 'react'
import { Object3D, Light, SpotLight, PointLight, DirectionalLight, Color } from 'three'
import { BasePanel, PropertyRow } from './BasePanel'
import { registerDetailPanel, is } from '../registry'

interface LightPanelProps {
  object: Object3D
}

/**
 * Helper to convert a Three.js Color to a hex string
 */
function colorToHex(color: Color): string {
  return `#${color.getHexString()}`
}

/**
 * Panel showing light details for different types of lights
 */
export function LightPanel({ object }: LightPanelProps) {
  const light = object as Light

  return (
    <BasePanel title='Light' object={object}>
      <PropertyRow label='Color' value={colorToHex(light.color)} />
      <PropertyRow label='Intensity' value={light.intensity.toFixed(2)} />

      {/* SpotLight specific properties */}
      {light.type === 'SpotLight' && (
        <>
          <PropertyRow
            label='Angle'
            value={`${(((light as SpotLight).angle * 180) / Math.PI).toFixed(1)}°`}
          />
          <PropertyRow label='Penumbra' value={(light as SpotLight).penumbra.toFixed(2)} />
          <PropertyRow label='Distance' value={(light as SpotLight).distance || 'Infinite'} />
        </>
      )}

      {/* PointLight specific properties */}
      {light.type === 'PointLight' && (
        <PropertyRow label='Distance' value={(light as PointLight).distance || 'Infinite'} />
      )}

      {/* DirectionalLight specific properties */}
      {light.type === 'DirectionalLight' && (
        <PropertyRow
          label='Target'
          value={(light as DirectionalLight).target?.name || 'Default target'}
        />
      )}

      {/* Common shadow properties for lights that support shadows */}
      {'castShadow' in light && (
        <>
          <PropertyRow label='Cast Shadow' value={light.castShadow ? 'Yes' : 'No'} />
          {light.castShadow && light.shadow && (
            <>
              <PropertyRow
                label='Shadow Map Size'
                value={`${light.shadow.mapSize.width}x${light.shadow.mapSize.height}`}
              />
              <PropertyRow label='Shadow Bias' value={light.shadow.bias.toExponential(2)} />
            </>
          )}
        </>
      )}
    </BasePanel>
  )
}

// Register this panel to the registry
registerDetailPanel({
  component: LightPanel,
  shouldShow: is.light,
  order: 20
})
