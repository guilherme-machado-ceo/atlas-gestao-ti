import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import { CatmullRomCurve3, Vector3, type Mesh } from 'three'
import { DURATION } from './geometry'

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5)
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

interface DataFlowsProps {
  reducedMotion: boolean
  seekTime: MutableRefObject<number | null>
  dimmed: boolean
}

export function DataFlows({ reducedMotion, seekTime, dimmed }: DataFlowsProps) {
  const particleRefs = useRef<Mesh[]>([])
  const curves = useMemo(() => [0, 1, 2].map((lane) => new CatmullRomCurve3([
    new Vector3(-4.2, 1.65 + lane * 0.65, -0.55 + lane * 0.45),
    new Vector3(-2.8, 1.9 + lane * 0.45, 0.25 - lane * 0.25),
    new Vector3(0, 1.7 + lane * 0.7, 0.55 - lane * 0.4),
    new Vector3(2.8, 1.95 + lane * 0.5, 0.2 - lane * 0.25),
    new Vector3(4.2, 1.75 + lane * 0.6, -0.45 + lane * 0.4),
  ])), [])
  const offsets = useMemo(() => {
    const random = mulberry32(20261120)
    return curves.flatMap(() => Array.from({ length: 4 }, () => random()))
  }, [curves])

  useFrame(({ clock }) => {
    const requestedTime = seekTime.current
    const time = requestedTime ?? (reducedMotion ? 0 : clock.elapsedTime)
    const phase = (time % DURATION) / DURATION
    let particle = 0
    curves.forEach((curve) => {
      for (let index = 0; index < 4; index += 1) {
        const mesh = particleRefs.current[particle]
        if (mesh) {
          const progress = (phase + offsets[particle]) % 1
          mesh.position.copy(curve.getPointAt(progress))
        }
        particle += 1
      }
    })
  })

  return (
    <group name="Dados — rede de fluxos">
      {curves.map((curve, index) => (
        <Line
          key={index}
          points={curve.getPoints(72)}
          color="#72d6b4"
          lineWidth={1.25}
          transparent
          opacity={dimmed ? 0.16 : 0.68}
        />
      ))}
      {curves.flatMap((_, curveIndex) => Array.from({ length: 4 }, (_, particleIndex) => {
        const index = curveIndex * 4 + particleIndex
        return (
          <mesh
            key={index}
            ref={(mesh) => { if (mesh) particleRefs.current[index] = mesh }}
            scale={dimmed ? 0.045 : 0.065}
          >
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial
              color="#b9f5df"
              emissive="#72d6b4"
              emissiveIntensity={dimmed ? 0.1 : 0.7}
              transparent
              opacity={dimmed ? 0.2 : 0.95}
            />
          </mesh>
        )
      }))}
    </group>
  )
}
