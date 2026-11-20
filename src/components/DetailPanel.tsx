import { ArrowRight, BookOpen, Layers3 } from 'lucide-react'
import type { AtlasModel, ReferenceId, StructuralPositionId } from '../model/atlas'
import { getSelectedItem, getSelectedSubarea, positionName, type AtlasSelection } from '../model/navigation'

interface DetailPanelProps {
  atlas: AtlasModel
  selection: AtlasSelection
  sovereignty: boolean
  showIntersections: boolean
  onToggleIntersections: () => void
  onSelectPosition: (id: StructuralPositionId) => void
  onSelectSubarea: (id: string) => void
  onSelectItem: (id: string) => void
}

function ReferenceText({ atlas, id }: { atlas: AtlasModel; id: ReferenceId }) {
  const reference = atlas.referencias.find((entry) => entry.id === id)
  return <span>{reference?.titulo ?? id}</span>
}

function SovereigntyLens({ atlas }: { atlas: AtlasModel }) {
  return (
    <section className="lens-panel" aria-labelledby="lens-title">
      <div className="section-heading"><span className="lens-dot" /><h3 id="lens-title">Lente de Soberania ativa</h3></div>
      <p>Uma leitura de controle sobre todas as posições, sem criar uma camada física.</p>
      <div className="lens-group"><strong>Dimensões</strong><div className="chip-list">{atlas.soberania.dimensoes.map((entry) => <span key={entry.id}>{entry.nome}</span>)}</div></div>
      <div className="lens-group"><strong>Vetores</strong><div className="chip-list">{atlas.soberania.vetores.map((entry) => <span key={entry.id}>{entry.nome}</span>)}</div></div>
      <div className="lens-group"><strong>Temas de exploração</strong>{atlas.soberania.temas.map((entry) => <details key={entry.id}><summary>{entry.nome}</summary><p>{entry.detalhe}</p></details>)}</div>
    </section>
  )
}

export function DetailPanel(props: DetailPanelProps) {
  const { atlas, selection, sovereignty, showIntersections } = props
  const position = atlas.posicoes.find((entry) => entry.id === selection.positionId)
  const subarea = getSelectedSubarea(atlas, selection)
  const item = getSelectedItem(atlas, selection)

  return (
    <aside className="detail-panel" aria-label="Detalhes da seleção">
      {!position && (
        <div className="detail-content">
          <span className="overline">Visão do sistema</span>
          <h2>Uma arquitetura de contenção e atravessamento</h2>
          <p className="lead">Explore as relações do método antes de descer aos 101 itens da taxonomia.</p>
          <div className="metric-row"><div><strong>{atlas.subareas.length}</strong><span>subáreas</span></div><div><strong>{atlas.itens.length}</strong><span>itens</span></div><div><strong>{atlas.relacoes.length}</strong><span>relações</span></div></div>
          <ol className="principle-list">
            <li><span>01</span>Segurança contém Dados e governa o núcleo tecnológico.</li>
            <li><span>02</span>Dados contém logicamente e atravessa os três pilares.</li>
            <li><span>03</span>Contexto Organizacional permanece fora do envelope.</li>
            <li><span>04</span>Soberania funciona somente como lente.</li>
          </ol>
          <p className="instruction"><Layers3 size={17} /> Selecione uma posição na cena ou no explorador.</p>
        </div>
      )}

      {position && !item && (
        <div className="detail-content">
          <span className="overline">{position.descritor}</span>
          <h2>{position.nome}</h2>
          <p className="lead">{position.descricao}</p>
          <dl className="meta-list">
            <div><dt>Fonte</dt><dd><ReferenceText atlas={atlas} id={position.fonte} /></dd></div>
            <div><dt>Protocolo original</dt><dd>{position.no_protocolo ? 'Presente' : 'Extensão autoral externa'}</dd></div>
          </dl>
          {subarea ? (
            <section className="subarea-detail">
              <span className="overline">Subárea selecionada</span>
              <h3>{subarea.nome}</h3>
              {subarea.detalhe && <p>{subarea.detalhe}</p>}
              <div className="classification-line"><span>{subarea.categoria}</span><span className={`status status-${subarea.categoria_status}`}>{subarea.categoria_status}</span></div>
              <p className="fine-print">A categoria da subárea descreve a natureza predominante do agrupamento e não é herdada pelos itens.</p>
              {subarea.fonte_local && <p className="source-location"><BookOpen size={15} /> Slide {subarea.fonte_local.slide} · {subarea.fonte_local.cartao}</p>}
              <h4>Itens desta subárea</h4>
              <ul className="item-list">
                {atlas.itens.filter((entry) => entry.subarea === subarea.id).map((entry) => (
                  <li key={entry.id}><button type="button" onClick={() => props.onSelectItem(entry.id)}><span>{entry.nome}<small>{entry.categoria}</small></span><ArrowRight size={15} /></button></li>
                ))}
              </ul>
            </section>
          ) : (
            <section>
              <h3>Subáreas</h3>
              <ul className="subarea-cards">
                {atlas.subareas.filter((entry) => entry.posicao === position.id).map((entry) => (
                  <li key={entry.id}><button type="button" onClick={() => props.onSelectSubarea(entry.id)}>{entry.nome}<span>{atlas.itens.filter((itemEntry) => itemEntry.subarea === entry.id).length} itens</span></button></li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {item && (
        <div className="detail-content">
          <span className="overline">Item da taxonomia</span>
          <h2>{item.nome}</h2>
          {item.extenso && <p className="lead">{item.extenso}</p>}
          <div className="classification-line"><span>{item.categoria}</span><span className={`status status-${item.categoria_status}`}>{item.categoria_status}</span></div>
          <dl className="meta-list">
            <div><dt>Posição principal</dt><dd><button type="button" className="text-link" onClick={() => props.onSelectPosition(item.posicao_principal)}>{positionName(atlas, item.posicao_principal)}</button></dd></div>
            <div><dt>Subárea</dt><dd><button type="button" className="text-link" onClick={() => props.onSelectSubarea(item.subarea)}>{getSelectedSubarea(atlas, selection)?.nome}</button></dd></div>
            <div><dt>Fonte do item</dt><dd><ReferenceText atlas={atlas} id={item.fonte} /></dd></div>
            <div><dt>Termo original</dt><dd>“{item.fonte_termo}”</dd></div>
            {item.fonte_local && <div><dt>Localizador</dt><dd>Slide {item.fonte_local.slide}, cartão {item.fonte_local.cartao}; {item.fonte_local.tambem_em}</dd></div>}
            <div><dt>Fonte da classificação</dt><dd><ReferenceText atlas={atlas} id={item.categoria_fonte} /></dd></div>
            {item.fonte_complementar && <div><dt>Fonte complementar</dt><dd><ReferenceText atlas={atlas} id={item.fonte_complementar} /></dd></div>}
          </dl>
          {item.nota && <div className="note"><strong>Nota</strong><p>{item.nota}</p></div>}
          {item.destaque_soberania && <div className="sovereignty-highlight"><strong>Destaque na lente de Soberania</strong><p>{item.destaque_soberania.motivo}</p></div>}
          <section className="intersection-section">
            <div className="section-heading"><h3>Interseções</h3><span>{item.intersecoes.length}</span></div>
            {showIntersections ? (
              item.intersecoes.length ? <div className="chip-list">{item.intersecoes.map((intersection) => <button type="button" key={intersection.posicao} onClick={() => props.onSelectPosition(intersection.posicao)}>{positionName(atlas, intersection.posicao)}</button>)}</div> : <p>Nenhuma interseção secundária registrada.</p>
            ) : <button type="button" className="secondary-action" onClick={props.onToggleIntersections}>Mostrar interseções</button>}
          </section>
        </div>
      )}
      {sovereignty && <SovereigntyLens atlas={atlas} />}
      <footer className="model-footer">Modelo {atlas.meta.versao_modelo} · {atlas.meta.data}</footer>
    </aside>
  )
}
