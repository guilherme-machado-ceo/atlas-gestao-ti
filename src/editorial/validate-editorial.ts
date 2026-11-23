import type { AtlasModel } from '../model/atlas'
import {
  EDITORIAL_BLOCKS,
  EDITORIAL_MANIFEST,
  ITEM_COVERAGE,
  SUBAREA_COVERAGE,
} from './security-sample'

const EXPECTED_MODEL_VERSION = '0.2.1'
const EXPECTED_MODEL_SHA256 = 'b061fceda14c9e455d548695a1f536665bd622983f4af4f446215f8f786068fb'
const VALID_EDITORIAL_TYPES = new Set(['transcricao', 'sintese_editorial', 'relacao_estrutural'])
const VALID_TARGET_TYPES = new Set(['posicao', 'subarea', 'item', 'relacao', 'lente', 'sistema'])

export class EditorialValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EditorialValidationError'
  }
}

function reject(message: string): never {
  throw new EditorialValidationError(message)
}

export function validateEditorialPackage(atlas: AtlasModel, actualModelSha256: string): void {
  const manifest = EDITORIAL_MANIFEST

  if (manifest.schema !== 'atlas-editorial/v1') reject('schema editorial desconhecido')
  if (manifest.compatibility.modelVersion !== EXPECTED_MODEL_VERSION) reject('versão de modelo incompatível no manifesto')
  if (manifest.compatibility.modelSha256 !== EXPECTED_MODEL_SHA256) reject('hash de modelo divergente no manifesto')
  if (atlas.meta.versao_modelo !== EXPECTED_MODEL_VERSION) reject('versão estrutural incompatível com o pacote editorial')
  if (actualModelSha256 !== EXPECTED_MODEL_SHA256) reject('SHA-256 do modelo estrutural não corresponde ao pacote editorial')
  if (manifest.sources.length !== 1) reject('a amostra deve declarar exatamente uma fonte documental primária')

  const source = manifest.sources[0]
  if (source.id !== 'protocolo-v04' || source.format !== 'markdown') reject('identidade ou formato da fonte documental inválido')
  if (source.sha256.length !== 64 || source.license !== 'CC BY 4.0') reject('hash ou licença da fonte documental ausente ou inválido')
  if (source.lineCount !== 1571 || !source.locatorPolicy.includes('intervalo de linhas')) reject('política de localizadores da fonte inválida')

  const securityPosition = atlas.posicoes.find((position) => position.id === 'seg')
  if (!securityPosition) reject('posição estrutural seg não encontrada')
  const securitySubareas = atlas.subareas.filter((subarea) => subarea.posicao === 'seg')
  const securityItems = atlas.itens.filter((item) => item.posicao_principal === 'seg')
  if (atlas.posicoes.length !== 7 || atlas.subareas.length !== 41 || atlas.itens.length !== 101 || atlas.relacoes.length !== 33) {
    reject('a cardinalidade do modelo estrutural 0.2.1 foi alterada')
  }
  if (securitySubareas.length !== 9 || securityItems.length !== 20) reject('o recorte de Segurança por Design diverge da matriz aprovada')

  const subareaIds = new Set(securitySubareas.map((subarea) => subarea.id))
  const itemIds = new Set(securityItems.map((item) => item.id))
  const relationIds = new Set(atlas.relacoes.map((relation) => relation.id))
  const coverageSubareaIds = Object.keys(SUBAREA_COVERAGE)
  const coverageItemIds = Object.keys(ITEM_COVERAGE)

  if (coverageSubareaIds.length !== 9 || coverageSubareaIds.some((id) => !subareaIds.has(id))) {
    reject('a matriz de cobertura deve corresponder às nove subáreas de Segurança')
  }
  if (coverageItemIds.length !== 20 || coverageItemIds.some((id) => !itemIds.has(id))) {
    reject('a matriz de cobertura deve corresponder aos vinte itens de Segurança')
  }
  const itemMarks = Object.values(ITEM_COVERAGE)
  const markCounts = {
    D: itemMarks.filter((mark) => mark === 'D').length,
    P: itemMarks.filter((mark) => mark === 'P').length,
    L: itemMarks.filter((mark) => mark === 'L').length,
  }
  if (markCounts.D !== 7 || markCounts.P !== 7 || markCounts.L !== 6) {
    reject('a cobertura dos vinte itens deve permanecer em 7 diretos, 7 parciais e 6 lacunas')
  }

  const blockIds = new Set<string>()
  const targetIds = new Set<string>()

  for (const block of EDITORIAL_BLOCKS) {
    if (!block.id.trim() || blockIds.has(block.id)) reject(`ID editorial ausente ou duplicado: ${block.id}`)
    blockIds.add(block.id)

    if (!VALID_EDITORIAL_TYPES.has(block.type)) reject(`tipo editorial desconhecido em ${block.id}`)
    if (!VALID_TARGET_TYPES.has(block.target.kind)) reject(`tipo de alvo desconhecido em ${block.id}`)
    const targetKey = `${block.target.kind}:${block.target.id}`
    if (targetIds.has(targetKey)) reject(`alvo editorial duplicado: ${targetKey}`)
    targetIds.add(targetKey)

    const targetExists = (() => {
      switch (block.target.kind) {
        case 'posicao': return atlas.posicoes.some((position) => position.id === block.target.id)
        case 'subarea': return atlas.subareas.some((subarea) => subarea.id === block.target.id)
        case 'item': return atlas.itens.some((item) => item.id === block.target.id)
        case 'relacao': return relationIds.has(block.target.id)
        case 'lente': return block.target.id === 'sob'
        case 'sistema': return block.target.id === 'atlas'
      }
    })()
    if (!targetExists) reject(`alvo editorial inexistente: ${targetKey}`)
    if (!block.title.trim() || !block.summary.trim()) reject(`título ou resumo ausente em ${block.id}`)
    if (block.sources.length === 0) reject(`bloco sem proveniência: ${block.id}`)

    for (const locator of block.sources) {
      if (locator.source !== source.id) reject(`fonte documental não declarada em ${block.id}`)
      const [start, end] = locator.lines
      if (!locator.section.trim() || !Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > source.lineCount) {
        reject(`localizador de linhas inválido em ${block.id}`)
      }
    }

    for (const relationId of block.relationIds ?? []) {
      if (!relationIds.has(relationId)) reject(`relação estrutural inexistente em ${block.id}: ${relationId}`)
    }
  }

  for (const relationId of ['r01', 'r02', 'r03', 'r04', 'r05', 'r17', 'r23', 'r24', 'r25', 'r26', 'r30']) {
    if (!relationIds.has(relationId)) reject(`relação obrigatória da amostra ausente: ${relationId}`)
  }
}
