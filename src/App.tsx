import { lazy, Suspense, useState } from 'react'
import { AlertTriangle, Boxes, Eye, ListTree, Menu, RotateCcw, Waypoints } from 'lucide-react'
import { Explorer } from './components/Explorer'
import { DetailPanel } from './components/DetailPanel'
import { Navigator2D } from './components/Navigator2D'
import { useReducedMotion } from './hooks/use-reduced-motion'
import { useAtlas } from './model/useAtlas'
import { EMPTY_SELECTION, getSelectedItem, getSelectedSubarea, selectionForItem, selectionForPosition, selectionForSubarea, type AtlasSelection, type ViewMode } from './model/navigation'
import type { StructuralPositionId } from './model/atlas'
import './App.css'

const AtlasScene = lazy(() => import('./scene/AtlasScene'))

export default function App() {
  const state = useAtlas()
  const reducedMotion = useReducedMotion()
  const [selection, setSelection] = useState<AtlasSelection>(EMPTY_SELECTION)
  const [viewMode, setViewMode] = useState<ViewMode>('3d')
  const [sovereignty, setSovereignty] = useState(false)
  const [showIntersections, setShowIntersections] = useState(false)
  const [explorerOpen, setExplorerOpen] = useState(false)

  if (state.status === 'loading') {
    return <main className="state-page"><div className="loading-mark" aria-hidden="true"><span /><span /><span /></div><h1>Atlas de Gestão de TI</h1><p>Carregando e validando o modelo 0.2.1…</p></main>
  }

  if (state.status === 'error') {
    return (
      <main className="state-page error-page" role="alert">
        <AlertTriangle size={32} />
        <span className="overline">Validação bloqueante</span>
        <h1>Não foi possível carregar o Atlas</h1>
        <p>O modelo foi recusado e nenhum conteúdo parcial será exibido.</p>
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

  return (
    <div className="atlas-app">
      <header className="topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><div><strong>Atlas</strong><span>Gestão de TI em camadas</span></div></div>
        <div className="header-actions">
          <span className="version-label">modelo {atlas.meta.versao_modelo}</span>
          <div className="view-switch" aria-label="Modo de visualização">
            <button type="button" className={viewMode === '3d' ? 'is-active' : ''} onClick={() => setViewMode('3d')} aria-pressed={viewMode === '3d'}><Boxes size={16} /> 3D</button>
            <button type="button" className={viewMode === '2d' ? 'is-active' : ''} onClick={() => setViewMode('2d')} aria-pressed={viewMode === '2d'}><ListTree size={16} /> Lista 2D</button>
          </div>
          <button type="button" className="icon-button mobile-menu" onClick={() => setExplorerOpen(true)} aria-label="Abrir explorador"><Menu size={20} /></button>
        </div>
      </header>

      <main className="atlas-layout">
        <Explorer atlas={atlas} selection={selection} open={explorerOpen} onClose={() => setExplorerOpen(false)} onSelectPosition={selectPosition} onSelectSubarea={selectSubarea} />
        <section className="workspace">
          <nav className="breadcrumb" aria-label="Caminho da seleção">
            <button type="button" onClick={() => setSelection(EMPTY_SELECTION)}>Sistema</button>
            {position && <><span>/</span><button type="button" onClick={() => selectPosition(position.id as StructuralPositionId)}>{position.nome}</button></>}
            {subarea && <><span>/</span><button type="button" onClick={() => selectSubarea(subarea.id)}>{subarea.nome}</button></>}
            {item && <><span>/</span><span aria-current="page">{item.nome}</span></>}
          </nav>

          <div className="visual-stage">
            {viewMode === '3d' ? (
              <Suspense fallback={<div className="scene-fallback"><p>Preparando a arquitetura 3D…</p></div>}>
                <AtlasScene atlas={atlas} selection={selection} sovereignty={sovereignty} showIntersections={showIntersections} reducedMotion={reducedMotion} onSelectPosition={selectPosition} onSelectSubarea={selectSubarea} onSelectItem={selectItem} onUse2D={() => setViewMode('2d')} />
              </Suspense>
            ) : <Navigator2D atlas={atlas} selection={selection} showIntersections={showIntersections} onSelectPosition={selectPosition} onSelectSubarea={selectSubarea} onSelectItem={selectItem} />}
            <div className="scene-legend" aria-label="Legenda da cena">
              <span><i className="legend-envelope" />Envelope</span>
              <span><i className="legend-flow" />Fluxos de dados</span>
              <span><i className="legend-pillar" />Pilares equivalentes</span>
              <span><i className="legend-axis" />Eixo externo</span>
            </div>
          </div>

          <div className="toolbar" aria-label="Controles da visualização">
            <button type="button" className={sovereignty ? 'is-active' : ''} onClick={() => setSovereignty((value) => !value)} aria-pressed={sovereignty}><Eye size={17} /> Soberania <span>{sovereignty ? 'ativa' : 'desativada'}</span></button>
            <button type="button" className={showIntersections ? 'is-active' : ''} onClick={() => setShowIntersections((value) => !value)} aria-pressed={showIntersections}><Waypoints size={17} /> Interseções <span>{showIntersections ? 'visíveis' : 'sob demanda'}</span></button>
            <button type="button" onClick={() => setSelection(EMPTY_SELECTION)}><RotateCcw size={17} /> Vista inicial</button>
          </div>
        </section>
        <DetailPanel atlas={atlas} selection={selection} sovereignty={sovereignty} showIntersections={showIntersections} onToggleIntersections={() => setShowIntersections(true)} onSelectPosition={selectPosition} onSelectSubarea={selectSubarea} onSelectItem={selectItem} />
      </main>
    </div>
  )
}
