import { useMemo, useState } from 'react'
import { ArrowUpRight, BookOpen, Search, ShieldCheck } from 'lucide-react'
import type { AtlasModel, Item, Subarea } from '../model/atlas'
import {
  COVERAGE_LABELS,
  EDITORIAL_BLOCKS,
  EDITORIAL_MANIFEST,
  ITEM_COVERAGE,
  SUBAREA_COVERAGE,
  getEditorialBlock,
  type CoverageMark,
  type EditorialBlock,
} from '../editorial/security-sample'

interface ProtocolViewProps {
  atlas: AtlasModel
  onOpenInMap: (itemId: string) => void
}

type ItemCoverage = CoverageMark | 'T'

function markForItem(item: Item): ItemCoverage {
  return ITEM_COVERAGE[item.id as keyof typeof ITEM_COVERAGE] ?? 'T'
}

function CoverageBadge({ mark }: { mark: ItemCoverage }) {
  return <span className={`coverage-badge coverage-${mark.toLowerCase()}`}>{COVERAGE_LABELS[mark]}</span>
}

function SourceNote({ block }: { block: EditorialBlock }) {
  const sourceName = EDITORIAL_MANIFEST.sources[0].title
  return (
    <p className="editorial-source">
      <BookOpen size={14} aria-hidden="true" />
      <span>
        {block.sources.map((source, index) => (
          <span key={`${source.section}-${source.lines[0]}`}>
            {index > 0 ? ' · ' : ''}{sourceName}, v.04 — {source.section}, linhas {source.lines[0]}–{source.lines[1]}
          </span>
        ))}
      </span>
    </p>
  )
}

function EditorialBody({ block }: { block: EditorialBlock }) {
  return (
    <div className="editorial-body">
      <p>{block.summary}</p>
      {block.sections?.map((section) => (
        <section className="editorial-subsection" key={section.heading}>
          <h4>{section.heading}</h4>
          <p>{section.text}</p>
        </section>
      ))}
      {block.notes?.map((note) => <p className="editorial-note" key={note}>{note}</p>)}
      <SourceNote block={block} />
    </div>
  )
}

function ItemDisclosure({ item, subarea, onOpenInMap }: {
  item: Item
  subarea: Subarea
  onOpenInMap: (id: string) => void
}) {
  const mark = markForItem(item)
  const block = getEditorialBlock('item', item.id)
  const subareaBlock = getEditorialBlock('subarea', subarea.id)

  return (
    <details className="protocol-item">
      <summary>
        <span className="protocol-item-title">{item.nome}</span>
        <CoverageBadge mark={mark} />
      </summary>
      <div className="protocol-item-content">
        {item.extenso && <p className="taxonomy-definition">{item.extenso}</p>}
        {item.nota && <p className="taxonomy-definition">{item.nota}</p>}
        {block ? (
          <EditorialBody block={block} />
        ) : mark === 'L' ? (
          <p className="coverage-explanation">Lacuna documental no Protocolo v.04. O item permanece acessível na taxonomia, sem verbete explicativo nesta amostra.</p>
        ) : (
          <p className="coverage-explanation">A fonte sustenta a síntese da subárea, mas esta amostra não atribui a este item um verbete independente.</p>
        )}
        {subareaBlock && mark !== 'L' && !block && (
          <p className="fine-print">Consulte a síntese editorial da subárea: {subareaBlock.title}.</p>
        )}
        <button className="open-map-link" type="button" onClick={() => onOpenInMap(item.id)}>
          Abrir no Mapa 2D <ArrowUpRight size={14} />
        </button>
      </div>
    </details>
  )
}

function SearchResults({ atlas, query, onOpenInMap }: {
  atlas: AtlasModel
  query: string
  onOpenInMap: (id: string) => void
}) {
  const normalized = normalize(query)
  const results = useMemo(() => atlas.itens.map((item) => {
    const subarea = atlas.subareas.find((entry) => entry.id === item.subarea)
    const editorial = getEditorialBlock('item', item.id)
    const subareaEditorial = subarea ? getEditorialBlock('subarea', subarea.id) : undefined
    const text = [
      item.nome,
      item.extenso ?? '',
      item.nota ?? '',
      item.fonte_termo,
      subarea?.nome ?? '',
      editorial?.title ?? '',
      editorial?.summary ?? '',
      ...(editorial?.sections?.map((section) => `${section.heading} ${section.text}`) ?? []),
      subareaEditorial?.summary ?? '',
      ...(EDITORIAL_BLOCKS.filter((block) => block.target.kind === 'subarea' && block.target.id === item.subarea)
        .flatMap((block) => [...(block.searchTerms ?? []), block.summary])),
    ].join(' ')
    return { item, subarea, editorial, text, mark: markForItem(item) }
  }).filter((entry) => normalize(entry.text).includes(normalized))
    .sort((a, b) => {
      const sampleA = a.mark === 'T' ? 1 : 0
      const sampleB = b.mark === 'T' ? 1 : 0
      return sampleA - sampleB || a.item.nome.localeCompare(b.item.nome, 'pt-BR')
    }), [atlas, normalized])

  if (results.length === 0) {
    return <div className="search-empty" role="status">Nenhum item da taxonomia corresponde a “{query}”.</div>
  }

  return (
    <div className="search-results" aria-live="polite">
      <div className="search-results-heading">
        <strong>{results.length}</strong> {results.length === 1 ? 'resultado' : 'resultados'} em {atlas.itens.length} itens
      </div>
      {results.map(({ item, subarea, editorial, mark }) => (
        <article className="search-result" key={item.id}>
          <div>
            <strong>{item.nome}</strong>
            <span>{subarea?.nome ?? 'Subárea não encontrada'}</span>
            {item.extenso && <span className="search-result-definition">{item.extenso}</span>}
            {item.nota && <span className="search-result-definition">{item.nota}</span>}
          </div>
          <CoverageBadge mark={mark} />
          {editorial && <p>{editorial.summary}</p>}
          {!editorial && mark === 'T' && <p>Item da taxonomia; fora da amostra editorial de Segurança por Design.</p>}
          {!editorial && mark === 'L' && <p>O Protocolo v.04 não oferece detalhamento conceitual suficiente.</p>}
          <button type="button" onClick={() => onOpenInMap(item.id)}>Abrir item no Mapa 2D <ArrowUpRight size={14} /></button>
        </article>
      ))}
    </div>
  )
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim()
}

export function ProtocolView({ atlas, onOpenInMap }: ProtocolViewProps) {
  const [query, setQuery] = useState('')
  const security = atlas.posicoes.find((position) => position.id === 'seg')
  const subareas = atlas.subareas.filter((subarea) => subarea.posicao === 'seg')
  const securityItems = atlas.itens.filter((item) => item.posicao_principal === 'seg')
  const coverageCounts = {
    D: Object.values(ITEM_COVERAGE).filter((mark) => mark === 'D').length,
    P: Object.values(ITEM_COVERAGE).filter((mark) => mark === 'P').length,
    L: Object.values(ITEM_COVERAGE).filter((mark) => mark === 'L').length,
  }
  const isSearching = query.trim().length > 0

  return (
    <main className="protocol-page">
      <div className="protocol-shell">
        <header className="protocol-heading">
          <div>
            <span className="overline">Atlas de Gestão de TI · leitura principal</span>
            <h1>Protocolo Geral de Tecnologia</h1>
            <p>Camada editorial experimental · amostra vertical de Segurança por Design</p>
          </div>
          <span className="sample-mark"><ShieldCheck size={15} /> Amostra v.0.1.0</span>
        </header>

        <div className="protocol-search">
          <Search size={18} aria-hidden="true" />
          <label className="sr-only" htmlFor="protocol-search">Buscar nas posições, subáreas, itens e texto editorial</label>
          <input
            id="protocol-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar conceito, subárea ou item (ex.: PQC, CIEM, LGPD)…"
          />
          {query && <button type="button" onClick={() => setQuery('')}>Limpar</button>}
        </div>

        {isSearching ? (
          <SearchResults atlas={atlas} query={query} onOpenInMap={onOpenInMap} />
        ) : (
          <>
            <section className="protocol-thesis" aria-labelledby="protocol-thesis-title">
              <span className="overline">Princípio fundador</span>
              <h2 id="protocol-thesis-title">Segurança governa. Dados atravessa. Os domínios implementam.</h2>
              <p>{security?.descricao ?? 'Segurança é o envelope que governa os domínios tecnológicos.'} A camada de Dados atravessa os domínios; Quântico, Analógico-Físico e Digital permanecem como pilares. Contexto Organizacional fica fora do envelope. Soberania Digital opera como lente, não como geometria.</p>
              {getEditorialBlock('posicao', 'seg') && (
                <div className="thesis-editorial">
                  <EditorialBody block={getEditorialBlock('posicao', 'seg')!} />
                </div>
              )}
              <div className="protocol-thesis-meta">
                <span>Modelo estrutural {atlas.meta.versao_modelo}</span>
                <span>{atlas.subareas.length} subáreas</span>
                <span>{atlas.itens.length} itens taxonômicos pesquisáveis</span>
              </div>
            </section>

            <div className="protocol-content-grid">
              <section className="protocol-main-column" aria-labelledby="security-sample-title">
                <div className="protocol-section-heading">
                  <div>
                    <span className="overline">Amostra vertical · posição seg</span>
                    <h2 id="security-sample-title">Segurança por Design</h2>
                    <p>{subareas.length} subáreas · {securityItems.length} itens. A cobertura documental é indicada item a item.</p>
                  </div>
                </div>

                <div className="coverage-legend" aria-label="Legenda da cobertura documental">
                  <span><i className="coverage-dot coverage-d" /> Direta</span>
                  <span><i className="coverage-dot coverage-p" /> Parcial</span>
                  <span><i className="coverage-dot coverage-l" /> Lacuna</span>
                </div>

                <div className="protocol-accordion-list">
                  {subareas.map((subarea) => {
                    const block = getEditorialBlock('subarea', subarea.id)
                    const mark = SUBAREA_COVERAGE[subarea.id as keyof typeof SUBAREA_COVERAGE] ?? 'L'
                    const items = atlas.itens.filter((item) => item.subarea === subarea.id)
                    return (
                      <details className="protocol-subarea" key={subarea.id} open={subarea.id === 'transicao-criptografica'}>
                        <summary>
                          <span className="protocol-subarea-name">{subarea.nome}</span>
                          <span className="protocol-subarea-meta">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
                          <CoverageBadge mark={mark} />
                        </summary>
                        <div className="protocol-subarea-content">
                          {block ? <EditorialBody block={block} /> : (
                            <p className="coverage-explanation">Lacuna documental no Protocolo v.04. O agrupamento permanece disponível na taxonomia, sem texto explicativo criado por inferência.</p>
                          )}
                          {items.length > 0 && (
                            <div className="protocol-items">
                              <h3>Itens da taxonomia</h3>
                              {items.map((item) => <ItemDisclosure key={item.id} item={item} subarea={subarea} onOpenInMap={onOpenInMap} />)}
                            </div>
                          )}
                        </div>
                      </details>
                    )
                  })}
                </div>

                <section className="protocol-relations" aria-labelledby="sample-relations-title">
                  <div className="protocol-section-heading">
                    <div>
                      <span className="overline">Correspondência com o modelo</span>
                      <h2 id="sample-relations-title">Relações estruturais da amostra</h2>
                    </div>
                  </div>
                  {EDITORIAL_BLOCKS.filter((block) => block.target.kind === 'relacao').map((block) => {
                    const relation = atlas.relacoes.find((entry) => entry.id === block.target.id)
                    return relation ? (
                      <article className="relation-card" key={relation.id}>
                        <span className="relation-id">{relation.id}</span>
                        <div><strong>{block.title}</strong><p>{block.summary}</p><SourceNote block={block} /></div>
                      </article>
                    ) : null
                  })}
                </section>
              </section>

              <aside className="protocol-sidebar">
                <section className="protocol-side-card">
                  <span className="overline">Cobertura editorial · Segurança</span>
                  <div className="coverage-stat-grid">
                    <div><strong>{coverageCounts.D}</strong><span>Diretos</span></div>
                    <div><strong>{coverageCounts.P}</strong><span>Parciais</span></div>
                    <div><strong>{coverageCounts.L}</strong><span>Lacunas</span></div>
                  </div>
                  <p>Os vinte itens continuam acessíveis. A marca indica apenas quanto o Protocolo v.04 oferece de base documental para cada item.</p>
                  <button type="button" className="side-text-button" onClick={() => setQuery('')}>Ver amostra completa</button>
                </section>
                <section className="protocol-side-card">
                  <span className="overline">Princípio geométrico</span>
                  <h3>Quatro relações que não devem ser confundidas</h3>
                  <ul className="principle-callouts">
                    <li><strong>Governa</strong><span>Segurança rege o núcleo.</span></li>
                    <li><strong>Contém</strong><span>Contenção lógica, não física.</span></li>
                    <li><strong>Atravessa</strong><span>Dados circula entre pilares.</span></li>
                    <li><strong>Aplica-se-a</strong><span>Soberania é lente transversal.</span></li>
                  </ul>
                  <p className="relation-ref-list">Relações governa e contém: r01–r05.</p>
                </section>
                <section className="protocol-side-card protocol-attribution">
                  <span className="overline">Fonte desta amostra</span>
                  <h3>{EDITORIAL_MANIFEST.sources[0].title}</h3>
                  <p>v.04 · 28/05/2026 · CC BY 4.0</p>
                  <p className="fine-print">Atribuição: Guilherme Gonçalves Machado · Hubstry Deep Tech / Instituto PCIH³.</p>
                  <button type="button" className="side-text-button" onClick={() => document.getElementById('protocol-method-hint')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>Ver método e proveniência</button>
                </section>
              </aside>
            </div>
          </>
        )}
        <footer id="protocol-method-hint" className="protocol-footer">
          <span>Proveniência: documento, versão, seção e linhas.</span>
          <span>Afirmações temporais e regulatórias não foram verificadas independentemente.</span>
        </footer>
      </div>
    </main>
  )
}
