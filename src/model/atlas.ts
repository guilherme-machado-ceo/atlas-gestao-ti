export const POSITION_IDS = ["seg", "dad", "qua", "af", "dig", "ctx", "sob"] as const;
export type PositionId = (typeof POSITION_IDS)[number];
export type StructuralPositionId = Exclude<PositionId, "sob">;
export const STRUCTURAL_POSITION_IDS = ["seg", "dad", "qua", "af", "dig", "ctx"] as const;
export const PILLAR_IDS = ["qua", "af", "dig"] as const;
export type PillarId = (typeof PILLAR_IDS)[number];

export const POSITION_TYPES = ["envelope", "camada transversal de valor", "pilar de domínio", "eixo externo", "lente transversal"] as const;
export type PositionType = (typeof POSITION_TYPES)[number];

export const CATEGORY_GROUPS = ["Conhecimento e referência", "Obrigação e requisito", "Atividade e capacidade", "Arquitetura e técnica", "Mercado e contratação", "Gestão e medida", "Residual"] as const;
export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

export const CATEGORIES = ["domínio", "corpo de conhecimento", "framework", "método", "modelo de maturidade", "norma", "regulação", "prática", "capacidade organizacional", "estrutura organizacional", "estilo arquitetural", "interface", "padrão técnico", "formato", "modelo de armazenamento de dados", "tecnologia", "produto", "provedor", "categoria de software", "modelo de serviço", "modelo de implantação", "indicador", "conceito financeiro", "canal digital", "indeterminada"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_STATUSES = ["documentada", "decidida"] as const;
export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export const RELATION_TYPES = ["governa", "contem", "atravessa", "age-sobre", "aplica-se-a", "implica", "intersecta"] as const;
export type RelationType = (typeof RELATION_TYPES)[number];
export type ReferenceId = string;

export interface VersionHistory {
  versao: string;
  data: string;
  mudanca: string;
}

export interface RelationReconciliation {
  versao: string;
  relacao: string;
  acao: string;
  fonte: ReferenceId;
}

export interface AtlasMeta {
  nome: string;
  versao_modelo: string;
  data: string;
  historico: VersionHistory[];
  autor: string;
  gerado_de: string;
  precedencia: string[];
  status_categoria: Record<CategoryStatus, string>;
  regra_fonte: string;
  regra_soberania: string;
  reconciliacao: RelationReconciliation[];
  regra_subarea: string;
  restricoes: string[];
}

export interface LegendCategory { nome: Category; definicao: string }
export interface LegendGroup { grupo: CategoryGroup; categorias: LegendCategory[] }

export interface Reference {
  id: ReferenceId;
  titulo: string;
  autor: string;
  instituicao: string;
  versao: string;
  ano: number;
  arquivos?: string[];
  url: string | null;
  acesso?: string;
  licenca?: string;
  natureza?: string;
}

export interface Position {
  id: PositionId;
  nome: string;
  tipo: PositionType;
  descritor: string;
  descricao: string;
  fonte: ReferenceId;
  no_protocolo: boolean;
}

export interface Intersection {
  posicao: StructuralPositionId;
  fonte: ReferenceId;
}

export interface Classification {
  categoria: Category;
  categoria_status: CategoryStatus;
  categoria_fonte: ReferenceId;
}

export interface SourceLocation {
  slide: number;
  cartao: string;
  tambem_em?: string;
}

export interface Subarea extends Classification {
  id: string;
  nome: string;
  posicao: StructuralPositionId;
  detalhe: string | null;
  intersecoes: Intersection[];
  fonte: ReferenceId;
  fonte_local?: SourceLocation;
}

export interface SovereigntyHighlight {
  motivo: string;
  fonte: ReferenceId;
}

export interface Item extends Classification {
  id: string;
  nome: string;
  extenso: string | null;
  subarea: string;
  posicao_principal: StructuralPositionId;
  intersecoes: Intersection[];
  nota?: string;
  fonte: ReferenceId;
  fonte_termo: string;
  fonte_local?: SourceLocation;
  fonte_complementar?: ReferenceId;
  destaque_soberania?: SovereigntyHighlight;
}

export interface Relation {
  id: string;
  tipo: RelationType;
  origem: string;
  destino: string;
  descricao: string;
  fonte: ReferenceId;
  enfase?: string;
  enfase_fonte?: ReferenceId;
}

export interface SovereigntyDimension { id: string; nome: string }
export interface SovereigntyTheme { id: string; nome: string; detalhe: string }
export interface SovereigntyVector { id: string; nome: string }

export interface Sovereignty {
  dimensoes: SovereigntyDimension[];
  dimensoes_fonte: ReferenceId;
  dimensoes_status: "decisão do autor, revogável";
  temas: SovereigntyTheme[];
  temas_fonte: ReferenceId;
  temas_status: "temas de exploração, não taxonomia";
  vetores: SovereigntyVector[];
  vetores_fonte: ReferenceId;
  vetores_status: "recorte complementar";
}

export interface AtlasModel {
  meta: AtlasMeta;
  legenda: LegendGroup[];
  referencias: Reference[];
  posicoes: Position[];
  subareas: Subarea[];
  itens: Item[];
  relacoes: Relation[];
  soberania: Sovereignty;
}

export class AtlasValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AtlasValidationError";
  }
}

type UnknownObject = Record<string, unknown>;
function fail(path: string, message: string): never { throw new AtlasValidationError(`${path}: ${message}`) }
function asObject(value: unknown, path: string): UnknownObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "objeto esperado");
  return value as UnknownObject;
}
function asArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(path, "array esperado");
  return value;
}
function asText(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) fail(path, "texto não vazio esperado");
  return value;
}
function asNullableText(value: unknown, path: string): string | null {
  if (value === undefined) fail(path, "campo obrigatório ausente; use null quando não houver conteúdo");
  if (value === null) return null;
  return asText(value, path);
}
function asOptionalText(value: unknown, path: string): void {
  if (value !== undefined) asText(value, path);
}
function asBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") fail(path, "booleano esperado");
  return value;
}
function asInteger(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) fail(path, "número inteiro esperado");
  return value;
}
function asChoice<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) fail(path, `valor fora do vocabulário: ${String(value)}`);
  return value as T;
}
function asTextArray(value: unknown, path: string): void {
  asArray(value, path).forEach((entry, index) => asText(entry, `${path}[${index}]`));
}

export function validateAtlasModel(input: unknown): AtlasModel {
  const root = asObject(input, "$");
  const registeredIds = new Map<string, string>();
  const referenceIds = new Set<ReferenceId>();

  function registerId(value: UnknownObject, path: string): string {
    const id = asText(value.id, `${path}.id`);
    if (registeredIds.has(id)) fail(`${path}.id`, `ID duplicado; já usado em ${registeredIds.get(id)}`);
    registeredIds.set(id, path);
    return id;
  }

  function asReference(value: unknown, path: string): ReferenceId {
    const id = asText(value, path);
    if (!referenceIds.has(id)) fail(path, `referência inexistente: ${id}`);
    return id;
  }

  function validateSourceLocation(
    value: UnknownObject,
    path: string,
    source: ReferenceId,
  ): void {
    if (source === "ref-carrossel-20261117" && value.fonte_local === undefined) {
      fail(`${path}.fonte_local`, "localizador obrigatório para a fonte do carrossel");
    }
    if (value.fonte_local === undefined) return;

    const locationPath = `${path}.fonte_local`;
    const location = asObject(value.fonte_local, locationPath);
    const slide = asInteger(location.slide, `${locationPath}.slide`);
    if (slide < 1) fail(`${locationPath}.slide`, "slide deve ser um número positivo");
    asText(location.cartao, `${locationPath}.cartao`);
    asOptionalText(location.tambem_em, `${locationPath}.tambem_em`);
  }

  function validateClassification(value: UnknownObject, path: string): void {
    asChoice(value.categoria, CATEGORIES, `${path}.categoria`);
    asChoice(value.categoria_status, CATEGORY_STATUSES, `${path}.categoria_status`);
    asReference(value.categoria_fonte, `${path}.categoria_fonte`);
  }

  function validateIntersections(value: UnknownObject, path: string, principalPosition: StructuralPositionId): void {
    const seen = new Set<StructuralPositionId>();
    asArray(value.intersecoes, `${path}.intersecoes`).forEach((entry, index) => {
      const intersectionPath = `${path}.intersecoes[${index}]`;
      const intersection = asObject(entry, intersectionPath);
      const position = asChoice(intersection.posicao, STRUCTURAL_POSITION_IDS, `${intersectionPath}.posicao`);
      asReference(intersection.fonte, `${intersectionPath}.fonte`);
      if (position === principalPosition) fail(`${intersectionPath}.posicao`, "interseção não pode repetir a posição principal");
      if (seen.has(position)) fail(`${intersectionPath}.posicao`, `interseção duplicada com ${position}`);
      seen.add(position);
    });
  }

  const meta = asObject(root.meta, "meta");
  for (const field of ["nome", "versao_modelo", "data", "autor", "gerado_de", "regra_fonte", "regra_soberania", "regra_subarea"]) {
    asText(meta[field], `meta.${field}`);
  }
  asTextArray(meta.precedencia, "meta.precedencia");
  asTextArray(meta.restricoes, "meta.restricoes");
  asArray(meta.historico, "meta.historico").forEach((entry, index) => {
    const path = `meta.historico[${index}]`;
    const history = asObject(entry, path);
    asText(history.versao, `${path}.versao`);
    asText(history.data, `${path}.data`);
    asText(history.mudanca, `${path}.mudanca`);
  });
  const statuses = asObject(meta.status_categoria, "meta.status_categoria");
  asText(statuses.documentada, "meta.status_categoria.documentada");
  asText(statuses.decidida, "meta.status_categoria.decidida");

  const legendCategories = new Set<Category>();
  asArray(root.legenda, "legenda").forEach((entry, groupIndex) => {
    const groupPath = `legenda[${groupIndex}]`;
    const group = asObject(entry, groupPath);
    asChoice(group.grupo, CATEGORY_GROUPS, `${groupPath}.grupo`);
    asArray(group.categorias, `${groupPath}.categorias`).forEach((categoryEntry, categoryIndex) => {
      const categoryPath = `${groupPath}.categorias[${categoryIndex}]`;
      const category = asObject(categoryEntry, categoryPath);
      const name = asChoice(category.nome, CATEGORIES, `${categoryPath}.nome`);
      asText(category.definicao, `${categoryPath}.definicao`);
      if (legendCategories.has(name)) fail(`${categoryPath}.nome`, `categoria duplicada: ${name}`);
      legendCategories.add(name);
    });
  });
  for (const category of CATEGORIES) if (!legendCategories.has(category)) fail("legenda", `categoria ausente: ${category}`);

  asArray(root.referencias, "referencias").forEach((entry, index) => {
    const path = `referencias[${index}]`;
    const reference = asObject(entry, path);
    const id = registerId(reference, path);
    referenceIds.add(id);
    for (const field of ["titulo", "autor", "instituicao", "versao"]) asText(reference[field], `${path}.${field}`);
    asInteger(reference.ano, `${path}.ano`);
    asNullableText(reference.url, `${path}.url`);
    asOptionalText(reference.acesso, `${path}.acesso`);
    asOptionalText(reference.licenca, `${path}.licenca`);
    asOptionalText(reference.natureza, `${path}.natureza`);
    if (reference.arquivos !== undefined) asTextArray(reference.arquivos, `${path}.arquivos`);
  });

  asArray(meta.reconciliacao, "meta.reconciliacao").forEach((entry, index) => {
    const path = `meta.reconciliacao[${index}]`;
    const reconciliation = asObject(entry, path);
    asText(reconciliation.versao, `${path}.versao`);
    asText(reconciliation.relacao, `${path}.relacao`);
    asText(reconciliation.acao, `${path}.acao`);
    asReference(reconciliation.fonte, `${path}.fonte`);
  });

  const positionIds = new Set<PositionId>();
  const expectedPositionTypes: Record<PositionId, PositionType> = {
    seg: "envelope", dad: "camada transversal de valor", qua: "pilar de domínio",
    af: "pilar de domínio", dig: "pilar de domínio", ctx: "eixo externo", sob: "lente transversal",
  };
  asArray(root.posicoes, "posicoes").forEach((entry, index) => {
    const path = `posicoes[${index}]`;
    const position = asObject(entry, path);
    const id = asChoice(registerId(position, path), POSITION_IDS, `${path}.id`);
    asText(position.nome, `${path}.nome`);
    const type = asChoice(position.tipo, POSITION_TYPES, `${path}.tipo`);
    if (type !== expectedPositionTypes[id]) fail(`${path}.tipo`, `${id} deve ser ${expectedPositionTypes[id]}`);
    asText(position.descritor, `${path}.descritor`);
    asText(position.descricao, `${path}.descricao`);
    asReference(position.fonte, `${path}.fonte`);
    asBoolean(position.no_protocolo, `${path}.no_protocolo`);
    positionIds.add(id);
  });
  for (const id of POSITION_IDS) if (!positionIds.has(id)) fail("posicoes", `posição ausente: ${id}`);

  const subareaPositions = new Map<string, StructuralPositionId>();
  asArray(root.subareas, "subareas").forEach((entry, index) => {
    const path = `subareas[${index}]`;
    const subarea = asObject(entry, path);
    const id = registerId(subarea, path);
    asText(subarea.nome, `${path}.nome`);
    const position = asChoice(subarea.posicao, STRUCTURAL_POSITION_IDS, `${path}.posicao`);
    asNullableText(subarea.detalhe, `${path}.detalhe`);
    validateClassification(subarea, path);
    validateIntersections(subarea, path, position);
    const source = asReference(subarea.fonte, `${path}.fonte`);
    validateSourceLocation(subarea, path, source);
    subareaPositions.set(id, position);
  });

  asArray(root.itens, "itens").forEach((entry, index) => {
    const path = `itens[${index}]`;
    const item = asObject(entry, path);
    registerId(item, path);
    asText(item.nome, `${path}.nome`);
    asNullableText(item.extenso, `${path}.extenso`);
    asOptionalText(item.nota, `${path}.nota`);
    const subareaId = asText(item.subarea, `${path}.subarea`);
    const principalPosition = asChoice(item.posicao_principal, STRUCTURAL_POSITION_IDS, `${path}.posicao_principal`);
    validateClassification(item, path);
    validateIntersections(item, path, principalPosition);
    const source = asReference(item.fonte, `${path}.fonte`);
    validateSourceLocation(item, path, source);
    asText(item.fonte_termo, `${path}.fonte_termo`);
    if (item.fonte_complementar !== undefined) asReference(item.fonte_complementar, `${path}.fonte_complementar`);
    if (item.destaque_soberania !== undefined) {
      const highlightPath = `${path}.destaque_soberania`;
      const highlight = asObject(item.destaque_soberania, highlightPath);
      asText(highlight.motivo, `${highlightPath}.motivo`);
      asReference(highlight.fonte, `${highlightPath}.fonte`);
    }
    const subareaPosition = subareaPositions.get(subareaId);
    if (!subareaPosition) fail(`${path}.subarea`, `subárea inexistente: ${subareaId}`);
    if (principalPosition !== subareaPosition) fail(`${path}.posicao_principal`, "deve coincidir com a posição da subárea");
  });

  const undirectedIntersections = new Set<string>();
  const governedPositions = ["dad", "qua", "af", "dig"];
  const contextTargets = ["seg", "dad", "qua", "af", "dig"];
  asArray(root.relacoes, "relacoes").forEach((entry, index) => {
    const path = `relacoes[${index}]`;
    const relation = asObject(entry, path);
    registerId(relation, path);
    const type = asChoice(relation.tipo, RELATION_TYPES, `${path}.tipo`);
    const origin = asText(relation.origem, `${path}.origem`);
    const target = asText(relation.destino, `${path}.destino`);
    asText(relation.descricao, `${path}.descricao`);
    asReference(relation.fonte, `${path}.fonte`);

    const hasEmphasis = relation.enfase !== undefined;
    const hasEmphasisSource = relation.enfase_fonte !== undefined;
    if (hasEmphasis !== hasEmphasisSource) fail(path, "enfase e enfase_fonte devem aparecer juntos");
    if (hasEmphasis && type !== "aplica-se-a") fail(path, "enfase só é permitida em aplica-se-a");
    if (hasEmphasis) {
      asText(relation.enfase, `${path}.enfase`);
      asReference(relation.enfase_fonte, `${path}.enfase_fonte`);
    }

    for (const [field, endpoint] of [["origem", origin], ["destino", target]] as const) {
      if (!positionIds.has(endpoint as PositionId) && !subareaPositions.has(endpoint)) {
        fail(`${path}.${field}`, `endpoint inexistente ou de tipo não permitido: ${endpoint}`);
      }
    }
    if (origin === target) fail(path, "relação reflexiva não permitida");
    if (type !== "aplica-se-a" && (origin === "sob" || target === "sob")) {
      fail(path, "Soberania só se relaciona por aplica-se-a");
    }

    switch (type) {
      case "contem": {
        const valid = (origin === "seg" && target === "dad") || (origin === "dad" && PILLAR_IDS.includes(target as PillarId));
        if (!valid) fail(path, "direção inválida para contem");
        break;
      }
      case "governa":
        if (origin !== "seg" || !governedPositions.includes(target)) fail(path, "governa deve partir de seg para o núcleo");
        break;
      case "atravessa":
        if (origin !== "dad" || !PILLAR_IDS.includes(target as PillarId)) fail(path, "atravessa deve partir de dad para um pilar");
        break;
      case "age-sobre":
        if (origin !== "ctx" || !contextTargets.includes(target)) fail(path, "direção inválida para age-sobre");
        break;
      case "aplica-se-a":
        if (origin !== "sob" || !positionIds.has(target as PositionId) || target === "sob") {
          fail(path, "aplica-se-a deve ligar sob a uma posição estrutural");
        }
        break;
      case "implica":
        if (origin !== "qua" || subareaPositions.get(target) !== "seg") fail(path, "implica deve partir de qua para uma subárea do envelope");
        break;
      case "intersecta": {
        const key = [origin, target].sort().join("↔");
        if (undirectedIntersections.has(key)) fail(path, `interseção simétrica duplicada: ${key}`);
        undirectedIntersections.add(key);
        break;
      }
    }
  });

  const sovereignty = asObject(root.soberania, "soberania");
  function validateSovereigntyEntries(field: "dimensoes" | "temas" | "vetores", requireDetail: boolean): void {
    asArray(sovereignty[field], `soberania.${field}`).forEach((entry, index) => {
      const path = `soberania.${field}[${index}]`;
      const record = asObject(entry, path);
      registerId(record, path);
      asText(record.nome, `${path}.nome`);
      if (requireDetail) asText(record.detalhe, `${path}.detalhe`);
    });
  }
  validateSovereigntyEntries("dimensoes", false);
  validateSovereigntyEntries("temas", true);
  validateSovereigntyEntries("vetores", false);
  asReference(sovereignty.dimensoes_fonte, "soberania.dimensoes_fonte");
  asReference(sovereignty.temas_fonte, "soberania.temas_fonte");
  asReference(sovereignty.vetores_fonte, "soberania.vetores_fonte");
  if (sovereignty.dimensoes_status !== "decisão do autor, revogável") fail("soberania.dimensoes_status", "status inválido");
  if (sovereignty.temas_status !== "temas de exploração, não taxonomia") fail("soberania.temas_status", "status inválido");
  if (sovereignty.vetores_status !== "recorte complementar") fail("soberania.vetores_status", "status inválido");

  return input as AtlasModel;
}
