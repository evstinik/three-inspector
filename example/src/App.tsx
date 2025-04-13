import { Environment, OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Mesh } from 'three'
import { ThreeInspector } from 'three-inspector'

function Box() {
  const ref = useRef<Mesh>(null)

  const time = useRef(0)
  useFrame((_, delta) => {
    time.current += delta
    ref.current?.rotateY(delta)
    ref.current?.position.setY(0.1 + 0.03 * Math.sin(2 * time.current))
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial color='orange' />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box />

      <group name='some-group'>
        <group name='inner-element'>
          <mesh name='mesh-inside' position={[-0.5, 0, -0.5]}>
            <meshStandardMaterial color='blue' />
            <boxGeometry args={[0.1, 0.1, 0.1]} />
          </mesh>
        </group>
      </group>

      <PerspectiveCamera position={[0.75, 0.5, 1]} makeDefault />
      <Environment preset='warehouse' background={false} />
      <OrbitControls zoomSpeed={2} screenSpacePanning={false} makeDefault enableDamping={false} />
      <Grid
        infiniteGrid
        fadeDistance={100}
        fadeStrength={10}
        cellSize={0.1}
        sectionSize={1}
        cellColor={0x888888}
        sectionColor={0x666666}
        position-y={-0.001}
      />
    </>
  )
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <Scene />
        <ThreeInspector />
      </Canvas>
    </div>
  )
}
