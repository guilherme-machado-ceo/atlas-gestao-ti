import { ContactShadows, Edges, Html, Line, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Component, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import { DoubleSide, Vector3, type PerspectiveCamera } from 'three'
import type { AtlasModel, PillarId, StructuralPositionId } from '../model/atlas'
import type { AtlasSelection } from '../model/navigation'
import { DataFlows } from './DataFlows'
import { DURATION, POSITION_COLORS, PILLAR_X, itemPoint, positionAnchor, positionFocus, relationPoint, subareaPoint } from './geometry'

interface AtlasSceneProps {
  atlas: AtlasModel
  selection: AtlasSelection
  sovereignty: boolean
  showIntersections: boolean
  reducedMotion: boolean
  onSelectPosition: (id: StructuralPositionId) => void
  onSelectSubarea: (id: string) => void
  onSelectItem: (id: string) => void
  onUse2D: () => void
}

interface SceneContentProps extends Omit<AtlasSceneProps, 'onUse2D' | 'reducedMotion'> {
  reducedMotion: boolean
  seekTime: MutableRefObject<number | null>
  invalidateRef: MutableRefObject<(() => void) | null>
  onReady: () => void
}

function RenderController({ invalidateRef }: { invalidateRef: MutableRefObject<(() => void) | null> }) {
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    invalidateRef.current = invalidate
    return () => { invalidateRef.current = null }
  }, [invalidate, invalidateRef])
  return null
}

function updateCameraProjection(camera: PerspectiveCamera, sceneHeight: number) {
  camera.fov = sceneHeight < 300 ? 30 : 40
  camera.updateProjectionMatrix()
}

function CameraRig({ selection }: { selection: AtlasSelection }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const sceneHeight = useThree((state) => state.size.height)
  const invalidate = useThree((state) => state.invalidate)
  const controls = useThree((state) => state.controls) as { target: Vector3; update: () => void } | null

  useEffect(() => {
    const focus = positionFocus(selection.positionId)
    camera.position.set(...focus.camera)
    updateCameraProjection(camera, sceneHeight)
    camera.lookAt(...focus.target)
    if (controls) {
      controls.target.set(...focus.target)
      controls.update()
    }
    invalidate()
  }, [camera, controls, invalidate, sceneHeight, selection.positionId])

  return null
}

function RuntimeProbe({ onReady }: { onReady: () => void }) {
  const gl = useThree((state) => state.gl)
  const frames = useRef(0)
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    frames.current += 1
    elapsed.current += delta
    if (frames.current === 1) {
      window.__SCENE_READY__ = true
      onReady()
    }
    if (elapsed.current >= 1) {
      window.__ATLAS_STATS__ = {
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        fps: Math.round(frames.current / elapsed.current),
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
      }
      frames.current = 0
      elapsed.current = 0
    }
  })

  useEffect(() => () => { window.__SCENE_READY__ = false }, [])
  return null
}

function SceneLabel({ position, label, labelId, active, onClick }: {
  position: [number, number, number]
  label: string
  labelId?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Html position={position} center zIndexRange={[20, 0]}>
      <button type="button" className={`scene-label${labelId ? ` scene-label-${labelId}` : ''}${active ? ' is-active' : ''}`} onClick={onClick}>
        {label}
      </button>
    </Html>
  )
}

function Pillar({ id, selected, dimmed, sovereignty, onSelect }: {
  id: PillarId
  selected: boolean
  dimmed: boolean
  sovereignty: boolean
  onSelect: (id: StructuralPositionId) => void
}) {
  const [hovered, setHovered] = useState(false)
  const opacity = dimmed ? 0.13 : selected ? 0.92 : 0.76
  return (
    <group>
      <mesh
        position={[PILLAR_X[id], 1.9, 0]}
        onClick={(event) => { event.stopPropagation(); onSelect(id) }}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
      >
        <boxGeometry args={[1.65, 3.8, 2.2]} />
        <meshStandardMaterial
          color={POSITION_COLORS[id]}
          roughness={0.52}
          metalness={0.08}
          transparent
          opacity={hovered && !dimmed ? Math.min(1, opacity + 0.12) : opacity}
          depthWrite={!dimmed}
          emissive={sovereignty && (id === 'af' || id === 'dig') ? POSITION_COLORS[id] : '#000000'}
          emissiveIntensity={sovereignty ? 0.12 : 0}
        />
        <Edges color={POSITION_COLORS[id]} opacity={dimmed ? 0.15 : 0.8} transparent />
      </mesh>
      <SceneLabel position={[PILLAR_X[id], 4.15, 0]} labelId={id} label={id === 'af' ? 'Analógico-Físico' : id === 'dig' ? 'Digital' : 'Quântico'} active={selected} onClick={() => onSelect(id)} />
    </group>
  )
}

function SecurityEnvelope({ selected, dimmed, onSelect }: {
  selected: boolean
  dimmed: boolean
  onSelect: (id: StructuralPositionId) => void
}) {
  return (
    <group>
      <mesh position={[0, 2.7, 0]} onClick={(event) => { event.stopPropagation(); onSelect('seg') }}>
        <boxGeometry args={[9.4, 5.4, 5.6]} />
        <meshStandardMaterial
          color="#e7b66a"
          transparent
          opacity={dimmed ? 0.012 : selected ? 0.065 : 0.038}
          depthWrite={false}
          side={DoubleSide}
          roughness={0.8}
        />
        <Edges color="#e7b66a" opacity={dimmed ? 0.12 : 0.65} transparent />
      </mesh>
    </group>
  )
}

function ContextAxis({ atlas, selected, dimmed, onSelect }: {
  atlas: AtlasModel
  selected: boolean
  dimmed: boolean
  onSelect: (id: StructuralPositionId) => void
}) {
  const groups = atlas.subareas.filter((entry) => entry.posicao === 'ctx')
  return (
    <group name="Contexto Organizacional — eixo externo">
      <mesh position={[0, 0.35, 4.5]} onClick={(event) => { event.stopPropagation(); onSelect('ctx') }}>
        <boxGeometry args={[8.2, 0.16, 0.22]} />
        <meshStandardMaterial color="#d6a8b8" transparent opacity={dimmed ? 0.12 : 0.75} />
      </mesh>
      {groups.map((group, index) => {
        const x = (index - (groups.length - 1) / 2) * 1.02
        return (
          <mesh key={group.id} position={[x, 0.7, 4.5]} onClick={(event) => { event.stopPropagation(); onSelect('ctx') }}>
            <cylinderGeometry args={[0.09, 0.09, 0.58, 12]} />
            <meshStandardMaterial color="#d6a8b8" transparent opacity={dimmed ? 0.12 : 0.72} />
          </mesh>
        )
      })}
      <SceneLabel position={[0, 1.45, 4.5]} labelId="ctx" label="Contexto Organizacional" active={selected} onClick={() => onSelect('ctx')} />
    </group>
  )
}

function SubareaNodes({ atlas, selection, onSelect }: {
  atlas: AtlasModel
  selection: AtlasSelection
  onSelect: (id: string) => void
}) {
  if (!selection.positionId) return null
  const subareas = atlas.subareas.filter((entry) => entry.posicao === selection.positionId)
  return (
    <group name="Subáreas da posição selecionada">
      {subareas.map((subarea) => {
        const point = subareaPoint(atlas, subarea.id)
        const selected = selection.subareaId === subarea.id
        return (
          <group key={subarea.id}>
            <mesh position={point} onClick={(event) => { event.stopPropagation(); onSelect(subarea.id) }}>
              <octahedronGeometry args={[selected ? 0.16 : 0.11, 0]} />
              <meshStandardMaterial
                color={POSITION_COLORS[subarea.posicao]}
                emissive={POSITION_COLORS[subarea.posicao]}
                emissiveIntensity={selected ? 0.65 : 0.18}
              />
            </mesh>
            {selected && <SceneLabel position={[point[0], point[1] + 0.38, point[2]]} label={subarea.nome} active onClick={() => onSelect(subarea.id)} />}
          </group>
        )
      })}
    </group>
  )
}

function ItemNodes({ atlas, selection, sovereignty, onSelect }: {
  atlas: AtlasModel
  selection: AtlasSelection
  sovereignty: boolean
  onSelect: (id: string) => void
}) {
  if (!selection.subareaId) return null
  const items = atlas.itens.filter((entry) => entry.subarea === selection.subareaId)
  return (
    <group name="Itens da subárea selecionada">
      {items.map((item) => {
        const point = itemPoint(atlas, item.id)
        const selected = selection.itemId === item.id
        const highlighted = sovereignty && Boolean(item.destaque_soberania)
        return (
          <group key={item.id}>
            <mesh position={point} onClick={(event) => { event.stopPropagation(); onSelect(item.id) }}>
              <icosahedronGeometry args={[selected ? 0.14 : highlighted ? 0.11 : 0.075, 1]} />
              <meshStandardMaterial
                color={highlighted ? '#f2d38b' : '#edf3ef'}
                emissive={highlighted ? '#e7b66a' : '#edf3ef'}
                emissiveIntensity={selected ? 0.9 : highlighted ? 0.6 : 0.12}
              />
            </mesh>
            {selected && <SceneLabel position={[point[0], point[1] + 0.34, point[2]]} label={item.nome} active onClick={() => onSelect(item.id)} />}
          </group>
        )
      })}
    </group>
  )
}

function IntersectionLines({ atlas, selection }: { atlas: AtlasModel; selection: AtlasSelection }) {
  const relations = atlas.relacoes.filter((relation) => relation.tipo === 'intersecta')
  const selectedItem = atlas.itens.find((item) => item.id === selection.itemId)
  return (
    <group name="Interseções sob demanda">
      {relations.map((relation) => (
        <Line
          key={relation.id}
          points={[relationPoint(atlas, relation.origem), relationPoint(atlas, relation.destino)]}
          color="#e9eef2"
          lineWidth={0.7}
          dashed
          dashSize={0.16}
          gapSize={0.12}
          transparent
          opacity={0.38}
        />
      ))}
      {selectedItem?.intersecoes.map((intersection) => (
        <Line
          key={`${selectedItem.id}-${intersection.posicao}`}
          points={[itemPoint(atlas, selectedItem.id), positionAnchor(intersection.posicao)]}
          color="#f2d38b"
          lineWidth={1.2}
          dashed
          dashSize={0.18}
          gapSize={0.1}
          transparent
          opacity={0.85}
        />
      ))}
    </group>
  )
}

function SceneContent(props: SceneContentProps) {
  const { atlas, selection, sovereignty, showIntersections, reducedMotion, seekTime, onReady } = props
  const selected = selection.positionId
  const dataDimmed = Boolean(selected && !['dad', 'qua', 'af', 'dig'].includes(selected))

  return (
    <>
      <color attach="background" args={['#0b1216']} />
      <fog attach="fog" args={['#0b1216', 18, 38]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[5, 10, 8]} intensity={1.65} color="#f3eee2" />
      <CameraRig selection={selection} />
      <RuntimeProbe onReady={onReady} />
      <RenderController invalidateRef={props.invalidateRef} />
      {/* Inicializa o primeiro portal HTML antes dos rótulos visíveis. */}
      <Html style={{ display: 'none' }}><span /></Html>
      <SecurityEnvelope selected={selected === 'seg'} dimmed={Boolean(selected && selected !== 'seg')} onSelect={props.onSelectPosition} />
      <DataFlows reducedMotion={reducedMotion} seekTime={seekTime} dimmed={dataDimmed} />
      {(['qua', 'af', 'dig'] as PillarId[]).map((id) => (
        <Pillar key={id} id={id} selected={selected === id} dimmed={Boolean(selected && selected !== id)} sovereignty={sovereignty} onSelect={props.onSelectPosition} />
      ))}
      <ContextAxis atlas={atlas} selected={selected === 'ctx'} dimmed={Boolean(selected && selected !== 'ctx')} onSelect={props.onSelectPosition} />
      <SubareaNodes atlas={atlas} selection={selection} onSelect={props.onSelectSubarea} />
      <ItemNodes atlas={atlas} selection={selection} sovereignty={sovereignty} onSelect={props.onSelectItem} />
      {showIntersections && <IntersectionLines atlas={atlas} selection={selection} />}
      <SceneLabel position={[0, 2.9, 2.2]} labelId="dad" label="Dados" active={selected === 'dad'} onClick={() => props.onSelectPosition('dad')} />
      <SceneLabel position={[0, 6.15, 2.9]} labelId="seg" label="Segurança por Design" active={selected === 'seg'} onClick={() => props.onSelectPosition('seg')} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0e181d" roughness={0.95} />
      </mesh>
      <ContactShadows position={[0, 0, 0]} opacity={0.36} scale={24} blur={2.4} far={8} />
      <OrbitControls makeDefault enableDamping={false} minDistance={7} maxDistance={27} minPolarAngle={0.35} maxPolarAngle={1.42} enablePan />
    </>
  )
}

class SceneErrorBoundary extends Component<{ children: ReactNode; onUse2D: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <SceneFallback onUse2D={this.props.onUse2D} failed />
    return this.props.children
  }
}

function SceneFallback({ onUse2D, failed = false }: { onUse2D: () => void; failed?: boolean }) {
  return (
    <div className="scene-fallback" role="status">
      <div className="fallback-envelope">
        <span>Quântico</span><span>Analógico-Físico</span><span>Digital</span>
      </div>
      <p>{failed ? 'A visualização 3D não pôde ser iniciada neste dispositivo.' : 'Preparando a arquitetura 3D…'}</p>
      <button type="button" onClick={onUse2D}>Abrir a lista 2D</button>
    </div>
  )
}

export default function AtlasScene(props: AtlasSceneProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const query = useMemo(() => new URLSearchParams(window.location.search), [])
  const capture = query.has('capture')
  const requestedTime = Number(query.get('t'))
  const seekTime = useRef<number | null>(query.has('t') && Number.isFinite(requestedTime) ? requestedTime : null)
  const invalidateRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    window.__seek = (time: number) => {
      if (Number.isFinite(time)) {
        seekTime.current = time
        invalidateRef.current?.()
      }
    }
    return () => { delete window.__seek }
  }, [])

  return (
    <div ref={shellRef} className="scene-shell" role="group" aria-label="Arquitetura 3D interativa">
      <div className="scene-poster" aria-hidden="true"><span /><span /><span /></div>
      <SceneErrorBoundary onUse2D={props.onUse2D}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [11, 8, 15], fov: 40, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          frameloop={capture ? 'demand' : 'always'}
        >
          <SceneContent {...props} reducedMotion={props.reducedMotion || capture} seekTime={seekTime} invalidateRef={invalidateRef} onReady={() => shellRef.current?.classList.add('is-ready')} />
        </Canvas>
      </SceneErrorBoundary>
      <div className="scene-instructions">Arraste para orbitar · use o scroll ou pinça para aproximar</div>
      <span className="scene-duration" hidden>{DURATION}</span>
    </div>
  )
}
