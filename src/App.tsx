import { useCallback, useState } from 'react'
import { AlertTriangle, BookOpen, Boxes, Eye, FileSearch, ListTree, Menu, RotateCcw, Waypoints } from 'lucide-react'
import { Explorer } from './components/Explorer'
import { DetailPanel } from './components/DetailPanel'
import { Navigator2D } from './components/Navigator2D'
import { ProtocolView } from './components/ProtocolView'
import { SourcesMethodView } from './components/SourcesMethodView'
import { ThreeDView } from './components/ThreeDView'
import { useReducedMotion } from './hooks/use-reduced-motion'
import { useAtlas } from './model/useAtlas'
import { EMPTY_SELECTION, getSelectedItem, getSelectedSubarea, selectionForItem, selectionForPosition, selectionForSubarea, type AtlasSelection } from './model/navigation'
import type { StructuralPositionId } from './model/atlas'
import './App.css'

type ExperienceSection = 'protocol' | 'map' | '3d' | 'sources'

export default function App() {
  const state = useAtlas()
  const reducedMotion = useReducedMotion()
  const [selection, setSelection] = useState<AtlasSelection>(EMPTY_SELECTION)
  const [section, setSection] = useState<ExperienceSection>('protocol')
  const [sovereignty, setSovereignty] = useState(false)
  const [showIntersections, setShowIntersections] = useState(false)
  const [explorerOpen, setExplorerOpen] = useState(false)
  const [sceneNotice, setSceneNotice] = useState<string | null>(null)

  const reportSceneFailure = useCallback((message: string) => {
    setSceneNotice(message)
    setSection('map')
  }, [])

  if (state.status === 'loading') {
    return <main className="state-page"><div className="loading-mark" aria-hidden="true"><span /><span /><span /></div><h1>Atlas de Gestão de TI</h1><p>Carregando e validando o modelo 0.2.1 e o pacote editorial…</p></main>
  }

  if (state.status === 'error') {
    return (
      <main className="state-page error-page" role="alert">
        <AlertTriangle size={32} />
        <span className="overline">Validação bloqueante</span>
        <h1>Não foi possível carregar o Atlas</h1>
        <p>O modelo estrutural ou o pacote editorial foi recusado. Nenhum conteúdo parcial será exibido.</p>
        <code>{state.error}</code>
        <button type="button" onClick={() => window.location.reload()}>Tentar novamente</button>
      </main>
    )
  }

  const atlas = state.atlas
  const position = atlas.posicoes.find((entry) => entry.id === selection.positionId)
  const subarea = getSelectedSubarea(atlas, selection)
  const item = getSelectedItem(atlas, selection)

  function selectPosition(id: StructuralPositionId) {
    setSelection(selectionForPosition(id))
    setExplorerOpen(false)
  }
  function selectSubarea(id: string) {
    setSelection(selectionForSubarea(atlas, id))
    setExplorerOpen(false)
  }
  function selectItem(id: string) {
    setSelection(selectionForItem(atlas, id))
    setExplorerOpen(false)
  }
  function openItemInMap(id: string) {
    setSelection(selectionForItem(atlas, id))
    setSection('map')
    setExplorerOpen(false)
  }

  return (
    <div className="atlas-app">
      <header className="topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><div><strong>Atlas</strong><span>Gestão de TI em camadas</span></div></div>
        <div className="header-actions">
          <span className="version-label">modelo {atlas.meta.versao_modelo}</span>
          <nav className="view-switch primary-nav" aria-label="Áreas do Atlas">
            <button type="button" className={section === 'protocol' ? 'is-active' : ''} onClick={() => setSection('protocol')} aria-pressed={section === 'protocol'}><BookOpen size={16} /> Protocolo</button>
            <button type="button" className={section === 'map' ? 'is-active' : ''} onClick={() => setSection('map')} aria-pressed={section === 'map'}><ListTree size={16} /> Mapa 2D</button>
            <button type="button" className={section === '3d' ? 'is-active' : ''} onClick={() => { setSceneNotice(null); setSection('3d') }} aria-pressed={section === '3d'}><Boxes size={16} /> Atlas 3D</button>
            <button type="button" className={section === 'sources' ? 'is-active' : ''} onClick={() => setSection('sources')} aria-pressed={section === 'sources'}><FileSearch size={16} /> Fontes e método</button>
          </nav>
          <button type="button" className="icon-button mobile-menu" onClick={() => setExplorerOpen(true)} aria-label="Abrir explorador"><Menu size={20} /></button>
        </div>
      </header>

      {section === 'protocol' && <ProtocolView atlas={atlas} onOpenInMap={openItemInMap} />}

      {section === 'sources' && <SourcesMethodView atlas={atlas} />}

      {section === 'map' && (
        <>
          {sceneNotice && <div className="scene-notice" role="status"><AlertTriangle size={16} />{sceneNotice}</div>}
          <main className="atlas-layout">
            <Explorer atlas={atlas} selection={selection} open={explorerOpen} onClose={() => setExplorerOpen(false)} onSelectPosition={selectPosition} onSelectSubarea={selectSubarea} />
            <section className="workspace">
              <nav className="breadcrumb" aria-label="Caminho da seleção">
                <button type="button" onClick={() => setSelection(EMPTY_SELECTION)}>Sistema</button>
                {position && <><span>/</span><button type="button" onClick={() => selectPosition(position.id as StructuralPositionId)}>{position.nome}</button></>}
                {subarea && <><span>/</span><button type="button" onClick={() => selectSubarea(subarea.id)}>{subarea.nome}</button></>}
                {item && <><span>/</span><span aria-current="page">{item.nome}</span></>}
              </nav>
              <div className="visual-stage map-stage">
                <Navigator2D atlas={atlas} selection={selection} showIntersections={showIntersections} onSelectPosition={selectPosition} onSelectSubarea={selectSubarea} onSelectItem={selectItem} />
              </div>
              <div className="toolbar" aria-label="Controles do mapa">
                <button type="button" className={sovereignty ? 'is-active' : ''} onClick={() => setSovereignty((value) => !value)} aria-pressed={sovereignty}><Eye size={17} /> Soberania <span>{sovereignty ? 'ativa' : 'desativada'}</span></button>
                <button type="button" className={showIntersections ? 'is-active' : ''} onClick={() => setShowIntersections((value) => !value)} aria-pressed={showIntersections}><Waypoints size={17} /> Interseções <span>{showIntersections ? 'visíveis' : 'sob demanda'}</span></button>
                <button type="button" onClick={() => setSelection(EMPTY_SELECTION)}><RotateCcw size={17} /> Vista inicial</button>
              </div>
            </section>
            <DetailPanel atlas={atlas} selection={selection} sovereignty={sovereignty} showIntersections={showIntersections} onToggleIntersections={() => setShowIntersections(true)} onSelectPosition={selectPosition} onSelectSubarea={selectSubarea} onSelectItem={selectItem} />
          </main>
        </>
      )}

      {section === '3d' && (
        <main className="atlas-layout single-view">
          <section className="workspace three-d-workspace">
            <nav className="breadcrumb" aria-label="Caminho da seleção">
              <button type="button" onClick={() => setSelection(EMPTY_SELECTION)}>Sistema</button>
              {position && <><span>/</span><button type="button" onClick={() => selectPosition(position.id as StructuralPositionId)}>{position.nome}</button></>}
              {subarea && <><span>/</span><button type="button" onClick={() => selectSubarea(subarea.id)}>{subarea.nome}</button></>}
              {item && <><span>/</span><span aria-current="page">{item.nome}</span></>}
            </nav>
            <div className="visual-stage">
              <ThreeDView
                atlas={atlas}
                selection={selection}
                sovereignty={sovereignty}
                showIntersections={showIntersections}
                reducedMotion={reducedMotion}
                onSelectPosition={selectPosition}
                onSelectSubarea={selectSubarea}
                onSelectItem={selectItem}
                onUse2D={() => setSection('map')}
                onFailure={reportSceneFailure}
              />
            </div>
            <div className="toolbar" aria-label="Controles da visualização 3D">
              <button type="button" className={sovereignty ? 'is-active' : ''} onClick={() => setSovereignty((value) => !value)} aria-pressed={sovereignty}><Eye size={17} /> Soberania <span>{sovereignty ? 'ativa' : 'desativada'}</span></button>
              <button type="button" className={showIntersections ? 'is-active' : ''} onClick={() => setShowIntersections((value) => !value)} aria-pressed={showIntersections}><Waypoints size={17} /> Interseções <span>{showIntersections ? 'visíveis' : 'sob demanda'}</span></button>
              <button type="button" onClick={() => setSelection(EMPTY_SELECTION)}><RotateCcw size={17} /> Vista inicial</button>
            </div>
          </section>
        </main>
      )}
    </div>
  )
}
