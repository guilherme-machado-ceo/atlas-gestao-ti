import { BookOpenCheck, FileText, Fingerprint, Scale } from 'lucide-react'
import type { AtlasModel } from '../model/atlas'
import { EDITORIAL_MANIFEST, ITEM_COVERAGE, SUBAREA_COVERAGE } from '../editorial/security-sample'

interface SourcesMethodViewProps {
  atlas: AtlasModel
}

export function SourcesMethodView({ atlas }: SourcesMethodViewProps) {
  const direct = Object.values(ITEM_COVERAGE).filter((mark) => mark === 'D').length
  const partial = Object.values(ITEM_COVERAGE).filter((mark) => mark === 'P').length
  const gaps = Object.values(ITEM_COVERAGE).filter((mark) => mark === 'L').length
  const source = EDITORIAL_MANIFEST.sources[0]

  return (
    <main className="sources-page">
      <div className="sources-shell">
        <header className="sources-heading">
          <span className="overline">Transparência editorial</span>
          <h1>Fontes e método</h1>
          <p>Identidade documental, proveniência, integridade estrutural e limites de cobertura da amostra.</p>
        </header>

        <section className="source-record">
          <div className="source-record-icon"><FileText size={22} /></div>
          <div>
            <span className="overline">Fonte autoral primária</span>
            <h2>{source.title}</h2>
            <p>Versão {source.version} · {source.date} · formato Markdown</p>
            <dl className="source-metadata">
              <div><dt>Autor</dt><dd>{source.author}</dd></div>
              <div><dt>Afiliação</dt><dd>{source.affiliation}</dd></div>
              <div><dt>Licença</dt><dd><a href="https://creativecommons.org/licenses/by/4.0/deed.pt-br" target="_blank" rel="noreferrer">{source.license}</a></dd></div>
              <div><dt>SHA-256</dt><dd><code>{source.sha256}</code></dd></div>
              <div><dt>Localizadores</dt><dd>{source.locatorPolicy}</dd></div>
            </dl>
            <p className="attribution-note">Atribuição: “Hubstry Protocolo de Tecnologia Geral, v.04”, de Guilherme Gonçalves Machado, Hubstry Deep Tech / Instituto PCIH³, licença CC BY 4.0. As sínteses são adaptações editoriais identificadas e vinculadas às seções e linhas da fonte.</p>
          </div>
        </section>

        <section className="source-record">
          <div className="source-record-icon"><Fingerprint size={22} /></div>
          <div>
            <span className="overline">Modelo estrutural preservado</span>
            <h2>Atlas {atlas.meta.versao_modelo}</h2>
            <p>O pacote editorial é separado do JSON estrutural. Não altera posições, subáreas, itens, relações, categorias, geometria ou herança taxonômica.</p>
            <dl className="source-metadata">
              <div><dt>SHA-256 esperado</dt><dd><code>{EDITORIAL_MANIFEST.compatibility.modelSha256}</code></dd></div>
              <div><dt>Posições</dt><dd>{atlas.posicoes.length}</dd></div>
              <div><dt>Subáreas</dt><dd>{atlas.subareas.length}</dd></div>
              <div><dt>Itens</dt><dd>{atlas.itens.length}</dd></div>
              <div><dt>Relações</dt><dd>{atlas.relacoes.length}</dd></div>
            </dl>
            <p className="method-note">O carregador valida primeiro o JSON com validateAtlasModel; depois confere a versão e o SHA-256 do JSON e valida o pacote editorial e seus alvos.</p>
          </div>
        </section>

        <section className="coverage-method">
          <div className="source-record-icon"><BookOpenCheck size={22} /></div>
          <div>
            <span className="overline">Cobertura do recorte aprovado</span>
            <h2>Segurança por Design</h2>
            <p>Nove subáreas e vinte itens são mantidos integralmente acessíveis na amostra. A classificação indica a força do suporte documental no v.04, não a importância do item.</p>
            <div className="coverage-total-grid">
              <div><strong>{direct}</strong><span>Direta</span></div>
              <div><strong>{partial}</strong><span>Parcial</span></div>
              <div><strong>{gaps}</strong><span>Lacuna</span></div>
            </div>
            <p className="fine-print">A amostra de Segurança contém 7 itens de cobertura direta, 7 parcial e 6 lacunas. A matriz geral do Atlas registra 15 diretos, 24 parciais e 62 lacunas no conjunto de 101 itens.</p>
            <ul className="subarea-coverage-list">
              {atlas.subareas.filter((subarea) => subarea.posicao === 'seg').map((subarea) => (
                <li key={subarea.id}>
                  <span>{subarea.nome}</span>
                  <span className={`coverage-badge coverage-${(SUBAREA_COVERAGE[subarea.id as keyof typeof SUBAREA_COVERAGE] ?? 'L').toLowerCase()}`}>
                    {SUBAREA_COVERAGE[subarea.id as keyof typeof SUBAREA_COVERAGE] === 'D' ? 'Direta' : SUBAREA_COVERAGE[subarea.id as keyof typeof SUBAREA_COVERAGE] === 'P' ? 'Parcial' : 'Lacuna'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="method-record">
          <div className="source-record-icon"><Scale size={22} /></div>
          <div>
            <span className="overline">Regra editorial e independência da verificação</span>
            <h2>Como ler os blocos</h2>
            <dl className="editorial-types">
              <div><dt>Transcrição</dt><dd>Trecho literal delimitado, com localizador documental.</dd></div>
              <div><dt>Síntese editorial</dt><dd>Condensação fiel à fonte, sem acrescentar tese não documentada.</dd></div>
              <div><dt>Relação estrutural</dt><dd>Explicação vinculada ao ID de relação já existente no JSON.</dd></div>
            </dl>
            <ul className="method-limits">
              <li>“Direta” significa que o protocolo define ou explica o conceito; não significa verificação factual independente.</li>
              <li>Afirmações temporais, regulatórias, históricas ou de mercado não são apresentadas como atualizadas sem verificação própria.</li>
              <li>Empresas, fornecedores, produtos, ferramentas comerciais, estudos de caso, incidentes comerciais, ofertas B2G, checklists e percursos profissionais foram excluídos.</li>
              <li>O protocolo-fonte é Markdown, não PDF. Por isso não são apresentados números de página.</li>
              <li>A divergência “protocolo de 7 camadas” versus seis controles numerados e uma saída está explicitada na amostra; nenhuma camada foi inventada.</li>
              <li>Vinte e seis das 33 relações têm correspondência documental direta no v.04; as sete relações restantes são decisões estruturais do modelo.</li>
              <li>As sete relações classificadas na matriz como exclusivamente estruturais (r12–r16, r22 e r33) permanecem no modelo sem serem atribuídas ao texto do v.04.</li>
              <li>Soberania Digital é uma lente. Os vetores modificam a leitura, não a geometria do Atlas.</li>
            </ul>
          </div>
        </section>

        <footer className="sources-footer">
          Pacote editorial {EDITORIAL_MANIFEST.version} · {EDITORIAL_MANIFEST.packageId} · compatível com Atlas {EDITORIAL_MANIFEST.compatibility.modelVersion}
        </footer>
      </div>
    </main>
  )
}
