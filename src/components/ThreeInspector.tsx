import React from 'react'
import { useFrame } from '@react-three/fiber'

export interface ThreeInspectorProps {
  children?: React.ReactNode
}

export function ThreeInspector({ children, ...props }: ThreeInspectorProps) {
  useFrame(() => {})

  return (
    <group name='ThreeInspector' {...props}>
      {children}
    </group>
  )
}
