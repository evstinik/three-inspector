import React from 'react'
import { describe, it, expect } from 'vitest'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import { ThreeInspector } from '../src/components/ThreeInspector'

describe('ThreeInspector', () => {
  it('renders', async () => {
    const renderer = await ReactThreeTestRenderer.create(<ThreeInspector />)

    expect(renderer.scene.children[0].instance.name).toBe('ThreeInspector')
  })
})
