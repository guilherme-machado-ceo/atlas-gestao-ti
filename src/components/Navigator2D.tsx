import { ArrowRight, ListTree, Waypoints } from 'lucide-react'
import type { AtlasModel, StructuralPositionId } from '../model/atlas'
import { getSelectedItem, getSelectedSubarea, type AtlasSelection } from '../model/navigation'

interface Navigator2DProps {
  atlas: AtlasModel
  selection: AtlasSelection
  showIntersections: boolean
  onSelectPosition: (id: StructuralPositionId) => void
  onSelectSubarea: (id: string) => void
  onSelectItem: (id: string) => void
}

export function Navigator2D({ atlas, selection, showIntersections, onSelectPosition, onSelectSubarea, onSelectItem }: Navigator2DProps) {
  const position = atlas.posicoes.find((entry) => entry.id === selection.positionId)
  const subarea = getSelectedSubarea(atlas, selection)
  const item = getSelectedItem(atlas, selection)
  const intersections = atlas.relacoes.filter((relation) => relation.tipo === 'intersecta')

  function endpoint(id: string) {
    const structuralPosition = atlas.posicoes.find((entry) => entry.id === id && entry.id !== 'sob')
    const endpointSubarea = atlas.subareas.find((entry) => entry.id === id)
    return {
      name: structuralPosition?.nome ?? endpointSubarea?.nome ?? id,
      select: () => {
        if (structuralPosition) onSelectPosition(structuralPosition.id as StructuralPositionId)
        else if (endpointSubarea) onSelectSubarea(endpointSubarea.id)
      },
    }
  }

  return (
    <section className="navigator-2d" aria-label="Lista navegável do Atlas">
      <div className="navigator-heading"><ListTree size={20} /><div><span className="overline">Alternativa 2D</span><h2>{item ? 'Item selecionado' : subarea ? 'Itens da subárea' : position ? 'Subáreas da posição' : 'Posições do sistema'}</h2></div></div>
      {!position && (
        <div className="navigator-grid">
          {atlas.posicoes.filter((entry) => entry.id !== 'sob').map((entry) => (
            <button type="button" key={entry.id} onClick={() => onSelectPosition(entry.id as StructuralPositionId)}>
              <span className={`position-mark mark-${entry.id}`} />
              <strong>{entry.nome}</strong>
              <p>{entry.descricao}</p>
              <small>{atlas.subareas.filter((sub) => sub.posicao === entry.id).length} subáreas <ArrowRight size={14} /></small>
            </button>
          ))}
        </div>
      )}
      {position && !subarea && (
        <div className="navigator-list">
          {atlas.subareas.filter((entry) => entry.posicao === position.id).map((entry) => (
            <button type="button" key={entry.id} onClick={() => onSelectSubarea(entry.id)}>
              <span><strong>{entry.nome}</strong><small>{entry.categoria} · {entry.categoria_status}</small></span>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
      )}
      {subarea && !item && (
        <div className="navigator-list">
          {atlas.itens.filter((entry) => entry.subarea === subarea.id).map((entry) => (
            <button type="button" key={entry.id} onClick={() => onSelectItem(entry.id)}>
              <span><strong>{entry.nome}</strong><small>{entry.categoria} · {entry.categoria_status}</small></span>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
      )}
      {item && (
        <div className="navigator-item-summary">
          <span className={`position-mark mark-${item.posicao_principal}`} />
          <h3>{item.nome}</h3>
          <p>{item.extenso ?? item.nota ?? 'Registro da taxonomia autoral.'}</p>
          <p>O detalhe completo, as fontes e as interseções estão no painel lateral.</p>
        </div>
      )}
      {showIntersections && (
        <section className="intersection-list" aria-labelledby="intersections-2d-title">
          <div className="section-heading"><Waypoints size={17} /><h3 id="intersections-2d-title">Relações de interseção</h3><span>{intersections.length}</span></div>
          <p>As mesmas relações estruturais exibidas na cena, em formato textual.</p>
          <ol>
            {intersections.map((relation) => {
              const origin = endpoint(relation.origem)
              const destination = endpoint(relation.destino)
              return (
                <li key={relation.id}>
                  <div className="intersection-endpoints">
                    <button type="button" onClick={origin.select}>{origin.name}</button>
                    <span aria-hidden="true">↔</span>
                    <button type="button" onClick={destination.select}>{destination.name}</button>
                  </div>
                  <p>{relation.descricao}</p>
                </li>
              )
            })}
          </ol>
        </section>
      )}
    </section>
  )
}
