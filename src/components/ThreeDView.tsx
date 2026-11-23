import { lazy, Suspense, Component, useEffect, useRef, useState, type ReactNode } from 'react'
import { Boxes } from 'lucide-react'
import type { AtlasModel, StructuralPositionId } from '../model/atlas'
import type { AtlasSelection } from '../model/navigation'

const AtlasScene = lazy(() => import('../scene/AtlasScene'))

interface ThreeDViewProps {
  atlas: AtlasModel
  selection: AtlasSelection
  sovereignty: boolean
  showIntersections: boolean
  reducedMotion: boolean
  onSelectPosition: (id: StructuralPositionId) => void
  onSelectSubarea: (id: string) => void
  onSelectItem: (id: string) => void
  onUse2D: () => void
  onFailure: (message: string) => void
}

class SceneBoundary extends Component<{ children: ReactNode; onFailure: (message: string) => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onFailure('A cena 3D falhou durante a inicialização. O conteúdo permanece disponível no Mapa 2D.')
  }

  render() {
    if (this.state.failed) {
      return <div className="scene-fallback" role="alert"><Boxes size={28} /><p>Não foi possível iniciar o renderizador 3D.</p><button type="button" onClick={this.props.onFailure.bind(null, 'A cena 3D não pôde ser iniciada. O Mapa 2D foi mantido como alternativa.')}>Usar Mapa 2D</button></div>
    }
    return this.props.children
  }
}

function webgl2Available(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

export function ThreeDView(props: ThreeDViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [webglReady, setWebglReady] = useState(false)
  const didFail = useRef(false)

  useEffect(() => {
    let active = true
    let observedCanvas: HTMLCanvasElement | null = null
    let observer: MutationObserver | null = null
    let timeout = 0

    const fail = (message: string) => {
      if (!active || didFail.current) return
      didFail.current = true
      props.onFailure(message)
    }

    if (!webgl2Available()) {
      fail('WebGL 2 não está disponível neste navegador. O Atlas abriu o Mapa 2D; o conteúdo editorial não depende de GPU.')
      return () => { active = false }
    }

    setWebglReady(true)

    const onContextLost = (event: Event) => {
      event.preventDefault()
      fail('O contexto WebGL foi perdido durante a renderização. O Atlas voltou ao Mapa 2D sem interromper a leitura.')
    }

    const attachContextListener = () => {
      const canvas = containerRef.current?.querySelector('canvas') ?? null
      if (canvas && canvas !== observedCanvas) {
        observedCanvas?.removeEventListener('webglcontextlost', onContextLost)
        observedCanvas = canvas
        observedCanvas.addEventListener('webglcontextlost', onContextLost, { once: true })
      }
    }

    observer = new MutationObserver(attachContextListener)
    if (containerRef.current) observer.observe(containerRef.current, { childList: true, subtree: true })
    attachContextListener()

    timeout = window.setTimeout(() => {
      if (!window.__SCENE_READY__) {
        fail('A cena 3D não iniciou dentro do limite de tempo. O Atlas voltou ao Mapa 2D.')
      }
    }, 12000)

    return () => {
      active = false
      window.clearTimeout(timeout)
      observer?.disconnect()
      observedCanvas?.removeEventListener('webglcontextlost', onContextLost)
    }
  }, [props.onFailure])

  return (
    <div ref={containerRef} className="three-d-page">
      {!webglReady ? (
        <div className="scene-fallback" role="status">
          <p>Verificando suporte a WebGL 2…</p>
        </div>
      ) : (
        <SceneBoundary onFailure={props.onFailure}>
          <Suspense fallback={<div className="scene-fallback" role="status"><p>Carregando o módulo de visualização 3D…</p></div>}>
            <AtlasScene
              atlas={props.atlas}
              selection={props.selection}
              sovereignty={props.sovereignty}
              showIntersections={props.showIntersections}
              reducedMotion={props.reducedMotion}
              onSelectPosition={props.onSelectPosition}
              onSelectSubarea={props.onSelectSubarea}
              onSelectItem={props.onSelectItem}
              onUse2D={props.onUse2D}
            />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  )
}
