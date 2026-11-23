export type CoverageMark = 'D' | 'P' | 'L'
export type EditorialKind = 'transcricao' | 'sintese_editorial' | 'relacao_estrutural'
export type EditorialTargetKind = 'posicao' | 'subarea' | 'item' | 'relacao' | 'lente' | 'sistema'

export interface SourceLocator {
  source: string
  section: string
  lines: [number, number]
}

export interface EditorialSection {
  heading: string
  text: string
}

export interface EditorialBlock {
  id: string
  target: { kind: EditorialTargetKind; id: string }
  type: EditorialKind
  title: string
  summary: string
  sections?: EditorialSection[]
  sources: SourceLocator[]
  relationIds?: string[]
  searchTerms?: string[]
  notes?: string[]
}

export const EDITORIAL_MANIFEST = {
  schema: 'atlas-editorial/v1',
  packageId: 'atlas-editorial-seguranca-amostra',
  version: '0.1.0-amostra.1',
  compatibility: {
    modelVersion: '0.2.1',
    modelSha256: 'b061fceda14c9e455d548695a1f536665bd622983f4af4f446215f8f786068fb',
  },
  sources: [
    {
      id: 'protocolo-v04',
      title: 'Hubstry Protocolo de Tecnologia Geral',
      version: 'v.04',
      date: '2026-05-28',
      format: 'markdown',
      sha256: 'a0617bdc31a3801a6a62c488836200df0fc5f73b93f22a0db8cc230152b17e7c',
      license: 'CC BY 4.0',
      author: 'Guilherme Gonçalves Machado',
      affiliation: 'Hubstry Deep Tech / Instituto PCIH³',
      locatorPolicy: 'documento + versão + seção + intervalo de linhas; a fonte é Markdown, não PDF',
      lineCount: 1571,
    },
  ],
} as const

export const SUBAREA_COVERAGE = {
  'normas-legislacao-e-conformidade': 'P',
  'identidade-e-acesso': 'P',
  'arquitetura-zero-trust': 'D',
  'controles-de-protecao': 'L',
  'operacao-de-seguranca': 'P',
  'resiliencia': 'P',
  'risco-seguranca-e-conformidade-de-ia': 'D',
  'terceiros': 'D',
  'transicao-criptografica': 'D',
} as const satisfies Record<string, CoverageMark>

export const ITEM_COVERAGE = {
  'i-iso-iec-27001-2022': 'P',
  'i-lgpd': 'D',
  'i-eca-digital': 'D',
  'i-iam': 'P',
  'i-pam': 'P',
  'i-ciem': 'L',
  'i-firewall': 'L',
  'i-proxy': 'L',
  'i-antimalware': 'L',
  'i-soc': 'L',
  'i-resposta-a-incidentes': 'P',
  'i-backup': 'L',
  'i-continuidade-de-negocios': 'P',
  'i-recuperacao-de-desastres': 'P',
  'i-gestao-de-fornecedores': 'P',
  'i-cadeia-de-suprimentos-de-software': 'D',
  'i-criptografia-pos-quantica': 'D',
  'i-fips-203-204-e-205': 'D',
  'i-agilidade-criptografica': 'D',
  'i-inventario-criptografico': 'D',
} as const satisfies Record<string, CoverageMark>

const securitySource = (section: string, lines: [number, number]): SourceLocator => ({
  source: 'protocolo-v04',
  section,
  lines,
})

export const EDITORIAL_BLOCKS: EditorialBlock[] = [
  {
    id: 'seg-position-thesis',
    target: { kind: 'posicao', id: 'seg' },
    type: 'sintese_editorial',
    title: 'Segurança como envelope de governança',
    summary: 'No modelo do Atlas, Segurança não é um domínio entre iguais: é o envelope de governança que rege o núcleo tecnológico. Dados permanece como camada transversal de valor, e Quântico, Analógico-Físico e Digital permanecem como pilares de domínio. Esta síntese preserva a geometria do modelo 0.2.1.',
    sections: [
      {
        heading: 'Princípio de Segurança por Design',
        text: 'O protocolo compara segurança incorporada desde o projeto a requisitos construtivos previstos desde o início. A amostra retém o princípio e a analogia da casa; exclui a estimativa de custo “10 vezes” e afirmações temporais ou regulatórias que não foram reverificadas.',
      },
      {
        heading: 'Função no Atlas',
        text: 'Segurança governa Dados e os três pilares internos. A posição de Contexto Organizacional permanece externa ao envelope. Soberania Digital atua como lente transversal, sem criar uma nova posição ou geometria.',
      },
    ],
    sources: [
      securitySource('Princípio Fundador e Geometria', [49, 143]),
      securitySource('Segurança por Design — O que é e por que governa tudo', [144, 154]),
    ],
    relationIds: ['r01', 'r02', 'r03', 'r04', 'r05'],
    searchTerms: ['security by design', 'envelope', 'governança transversal', 'segurança desde o design'],
  },
  {
    id: 'seg-subarea-normas',
    target: { kind: 'subarea', id: 'normas-legislacao-e-conformidade' },
    type: 'sintese_editorial',
    title: 'Normas, legislação e conformidade',
    summary: 'O v.04 menciona LGPD e ECA Digital no quadro regulatório associado à segurança e à IA. Nesta amostra, essas menções são tratadas como conteúdo documental do protocolo, não como verificação independente do estado jurídico na data de leitura.',
    sources: [securitySource('Ambiente Regulatório Ativo', [236, 253])],
    searchTerms: ['LGPD', 'ECA Digital', 'conformidade', 'regulação'],
    notes: ['O estado temporal e normativo não foi reverificado independentemente.', 'ISO/IEC 27001:2022 aparece como referência, sem definição conceitual suficiente para um verbete.'],
  },
  {
    id: 'seg-subarea-identity',
    target: { kind: 'subarea', id: 'identidade-e-acesso' },
    type: 'sintese_editorial',
    title: 'Identidade e acesso',
    summary: 'No protocolo para agentes de IA, identidade, permissões e privilégio mínimo aparecem como controles de segurança. O texto também menciona controle granular de acesso a dados. Isso sustenta uma síntese limitada, mas não definições completas de IAM, PAM ou CIEM.',
    sources: [
      securitySource('Protocolo para agentes de IA', [207, 225]),
      securitySource('Privacy by Design', [752, 772]),
    ],
    searchTerms: ['IAM', 'PAM', 'CIEM', 'privilégio mínimo', 'controle de acesso', 'identidade'],
    notes: ['IAM, PAM e CIEM permanecem com cobertura parcial; CIEM não recebe definição editorial no v.04.'],
  },
  {
    id: 'seg-subarea-zero-trust',
    target: { kind: 'subarea', id: 'arquitetura-zero-trust' },
    type: 'sintese_editorial',
    title: 'Arquitetura Zero Trust',
    summary: 'A ocorrência aproveitada na matriz é específica: Zero Trust físico para acesso à infraestrutura crítica. O texto menciona verificação de acesso a data centers e servidores, com controles de identidade, autenticação e registro. A amostra não generaliza esse trecho para uma definição completa de toda arquitetura Zero Trust.',
    sources: [securitySource('Pilar Analógico-Físico — segurança física e continuidade', [695, 702])],
    searchTerms: ['Zero Trust', 'confiança zero', 'acesso físico', 'data center'],
    notes: ['O escopo documental direto aqui é Zero Trust físico; não ampliar para controles não definidos nesta fonte.'],
  },
  {
    id: 'seg-subarea-security-ops',
    target: { kind: 'subarea', id: 'operacao-de-seguranca' },
    type: 'sintese_editorial',
    title: 'Operação de segurança',
    summary: 'O protocolo para agentes inclui registro de decisões e auditabilidade, além de testes contínuos. Esses elementos dão suporte a uma leitura parcial de operação de segurança. O v.04 não desenvolve um modelo de SOC nem um processo completo de resposta a incidentes.',
    sources: [
      securitySource('Protocolo para agentes de IA', [207, 225]),
      securitySource('Pilar Digital — segurança e privacidade', [776, 817]),
    ],
    searchTerms: ['SOC', 'logs', 'auditoria', 'resposta a incidentes', 'testes contínuos'],
    notes: ['SOC permanece como lacuna documental; não inferir um modelo operacional completo.'],
  },
  {
    id: 'seg-subarea-resilience',
    target: { kind: 'subarea', id: 'resiliencia' },
    type: 'sintese_editorial',
    title: 'Resiliência',
    summary: 'A fonte trata de ponto único de falha, redundância geográfica e continuidade de infraestrutura. Isso sustenta apenas uma síntese parcial: o texto não fornece procedimentos de backup ou recuperação de desastres.',
    sources: [securitySource('Pilar Analógico-Físico — segurança física e continuidade', [695, 706])],
    searchTerms: ['resiliência', 'redundância', 'ponto único de falha', 'continuidade'],
    notes: ['Backup e recuperação de desastres não recebem detalhamento conceitual no v.04.'],
  },
  {
    id: 'seg-subarea-ai-safety',
    target: { kind: 'subarea', id: 'risco-seguranca-e-conformidade-de-ia' },
    type: 'sintese_editorial',
    title: 'Risco, segurança e conformidade de IA',
    summary: 'O v.04 apresenta três formulações de AI Safety e organiza cinco categorias de risco: acidental, mau uso, social e sistêmico, alinhamento e controle, e catastrófico e existencial. A amostra preserva a estrutura conceitual, sem reproduzir os incidentes ou exemplos comerciais da fonte.',
    sections: [
      {
        heading: 'Definições citadas no protocolo',
        text: 'O documento apresenta, em ordem cronológica, Yampolskiy & Fox (2013), Rudner & Toner (2021) e Amodei et al. (2016). As três formulações tratam, respectivamente, do controle de máquinas inteligentes, da identificação e redução de comportamentos não intencionais em sistemas de aprendizado de máquina e da prevenção ou mitigação de danos causados por falhas ou comportamentos imprevistos de sistemas de IA.',
      },
      {
        heading: 'Categorias de risco',
        text: 'A taxonomia apresentada no v.04 distingue riscos acidentais, mau uso, efeitos sociais e sistêmicos, problemas de alinhamento e controle, e riscos catastróficos ou existenciais. Os exemplos de incidentes foram excluídos desta amostra.',
      },
      {
        heading: 'Protocolo para agentes: nota de integridade',
        text: 'Embora o título da seção anuncie sete camadas, a tabela enumera seis controles e uma linha de saída (“Ação segura e auditável”). Esta amostra mostra os seis controles documentados e registra a divergência; não cria uma sétima camada.',
      },
    ],
    sources: [
      securitySource('Definições canônicas de AI Safety', [164, 178]),
      securitySource('Cinco categorias de risco de IA', [188, 201]),
      securitySource('Protocolo de agentes de IA', [207, 225]),
    ],
    relationIds: ['r26'],
    searchTerms: ['AI Safety', 'segurança de IA', 'agentes', 'alinhamento', 'controle', 'riscos de IA', 'supervisão humana'],
    notes: ['As referências são apresentadas como citações do v.04; não foram verificadas diretamente nesta etapa.', 'Incidentes, empresas e exemplos comerciais foram excluídos.'],
  },
  {
    id: 'seg-subarea-third-parties',
    target: { kind: 'subarea', id: 'terceiros' },
    type: 'sintese_editorial',
    title: 'Terceiros',
    summary: 'O protocolo aborda dependências e cadeia de suprimentos de hardware e software como superfícies de risco. A amostra retém o princípio de dependência e integridade da cadeia, sem incorporar nomes de fornecedores, produtos, ferramentas ou recomendações comerciais.',
    sources: [
      securitySource('Pilar Digital — cadeia de suprimentos de software', [776, 809]),
      securitySource('Soberania Digital — dependência e substituibilidade', [848, 882]),
    ],
    searchTerms: ['terceiros', 'fornecedores', 'supply chain', 'cadeia de suprimentos', 'dependência'],
    notes: ['Gestão de fornecedores tem cobertura parcial; a cadeia de suprimentos de software tem tratamento direto.'],
  },
  {
    id: 'seg-subarea-crypto-transition',
    target: { kind: 'subarea', id: 'transicao-criptografica' },
    type: 'sintese_editorial',
    title: 'Transição criptográfica',
    summary: 'O protocolo relaciona a evolução da computação quântica à necessidade de preparar a criptografia de chave pública, inventariar algoritmos e permitir sua substituição. No Atlas 0.2.1, a transição permanece dentro da Segurança: o impacto tem origem no domínio Quântico, mas a resposta defensiva pertence ao envelope.',
    sources: [
      securitySource('Pilar Quântico — PQC, CBOM e crypto-agility', [503, 558]),
      securitySource('Mapa de Interseções', [1149, 1159]),
    ],
    relationIds: ['r23', 'r24', 'r30'],
    searchTerms: ['PQC', 'pós-quântica', 'FIPS 203', 'FIPS 204', 'FIPS 205', 'crypto-agility', 'CBOM', 'harvest now decrypt later'],
    notes: ['Não afirmar que toda criptografia será quebrada. O modelo 0.2.1 delimita o impacto à criptografia de chave pública, como RSA e curvas elípticas.'],
  },
  {
    id: 'seg-item-pqc-detail',
    target: { kind: 'item', id: 'i-criptografia-pos-quantica' },
    type: 'sintese_editorial',
    title: 'Criptografia pós-quântica (PQC)',
    summary: 'PQC designa algoritmos matemáticos concebidos para resistir a ataques de computadores quânticos. No Atlas, o item está em Transição criptográfica, dentro da posição Segurança por Design.',
    sections: [
      {
        heading: 'Finalidade',
        text: 'O v.04 descreve a PQC como uma camada defensiva de preparação para a ameaça quântica. A redação do Atlas delimita a preocupação principal à criptografia de chave pública, especialmente RSA e curvas elípticas, em vez de afirmar que toda criptografia será simplesmente quebrada.',
      },
      {
        heading: 'Motivação: harvest now, decrypt later',
        text: 'A fonte descreve o risco de coletar dados cifrados no presente para tentar descriptografá-los no futuro, quando houver capacidade quântica suficiente. A preocupação é particularmente relevante para dados cujo sigilo precisa durar por muitos anos.',
      },
      {
        heading: 'Padrões citados no protocolo',
        text: 'FIPS 203 / ML-KEM é apresentado para encapsulamento de chaves; FIPS 204 / ML-DSA e FIPS 205 / SLH-DSA são apresentados como algoritmos de assinatura digital. O protocolo lista os três como padrões finais publicados pelo NIST em 2024; a situação e eventuais erratas não foram verificadas independentemente nesta amostra.',
      },
      {
        heading: 'Agilidade e inventário',
        text: 'Crypto-agility é o princípio de permitir a substituição de algoritmos criptográficos sem redesenhar toda a arquitetura. CBOM (Cryptography Bill of Materials) é descrito como inventário dos algoritmos criptográficos em uso.',
      },
      {
        heading: 'Posição e relações no Atlas',
        text: 'O item permanece em Segurança por Design → Transição criptográfica. A relação r23 registra que o domínio Quântico implica a necessidade de transição; r24 conecta Segurança e Quântico; r30 conecta Dados e Quântico pela proteção de dados de longo prazo. Origem do impacto e local da resposta são distintos.',
      },
    ],
    sources: [
      securitySource('Pilar Quântico — definição de PQC e padrões FIPS', [517, 529]),
      securitySource('Pilar Quântico — CBOM e crypto-agility', [545, 545]),
      securitySource('Pilar Quântico — harvest now, decrypt later', [549, 555]),
      securitySource('Mapa de Interseções', [1149, 1159]),
    ],
    relationIds: ['r23', 'r24', 'r30'],
    searchTerms: ['PQC', 'criptografia pós-quântica', 'ML-KEM', 'ML-DSA', 'SLH-DSA', 'RSA', 'curvas elípticas', 'harvest now decrypt later'],
    notes: ['A afirmação do v.04 sobre “toda a criptografia” é mais ampla do que a delimitação adotada no modelo 0.2.1; a síntese usa a formulação mais precisa do modelo.', 'Os padrões são apresentados como conteúdo documental do v.04; os documentos primários do NIST não foram consultados nesta etapa.'],
  },
  {
    id: 'seg-relation-r17',
    target: { kind: 'relacao', id: 'r17' },
    type: 'relacao_estrutural',
    title: 'Soberania aplica-se à Segurança',
    summary: 'A relação r17 aplica a lente de Soberania à posição Segurança. A lente orienta perguntas de controle jurídico, operacional e tecnológico; não acrescenta uma camada ou volume à geometria.',
    sources: [
      securitySource('Princípio Fundador e Geometria', [121, 138]),
      securitySource('Soberania Digital — vetores', [862, 871]),
    ],
    relationIds: ['r17'],
    searchTerms: ['Soberania Digital', 'lente', 'controle jurídico', 'controle operacional', 'controle tecnológico'],
  },
  {
    id: 'seg-relation-r23',
    target: { kind: 'relacao', id: 'r23' },
    type: 'relacao_estrutural',
    title: 'Quântico implica transição criptográfica',
    summary: 'r23 separa a origem do impacto (Quântico) do local da resposta (Transição criptográfica, dentro de Segurança). A relação não move o item PQC para uma nova posição nem altera a geometria.',
    sources: [securitySource('Pilar Quântico — PQC', [503, 545])],
    relationIds: ['r23'],
    searchTerms: ['r23', 'implica', 'transição criptográfica'],
  },
  {
    id: 'seg-relation-r24',
    target: { kind: 'relacao', id: 'r24' },
    type: 'relacao_estrutural',
    title: 'Interseção Segurança ↔ Quântico',
    summary: 'A relação r24 registra o ponto de contato entre a ameaça quântica à criptografia de chave pública e a resposta de transição sob o envelope de Segurança.',
    sources: [securitySource('Mapa de Interseções — Segurança e Quântico', [1149, 1149])],
    relationIds: ['r24'],
    searchTerms: ['r24', 'interseção segurança quântico'],
  },
  {
    id: 'seg-relation-r25',
    target: { kind: 'relacao', id: 'r25' },
    type: 'relacao_estrutural',
    title: 'Interseção Segurança ↔ Analógico-Físico',
    summary: 'A relação r25 registra a exposição da infraestrutura física a ataques e sua conexão com segurança física e continuidade.',
    sources: [securitySource('Mapa de Interseções — Segurança e Analógico-Físico', [1150, 1150])],
    relationIds: ['r25'],
    searchTerms: ['r25', 'segurança física', 'infraestrutura'],
  },
  {
    id: 'seg-relation-r26',
    target: { kind: 'relacao', id: 'r26' },
    type: 'relacao_estrutural',
    title: 'Interseção Segurança ↔ Digital',
    summary: 'A relação r26 registra a interseção entre a autonomia de agentes de IA e os requisitos de segurança, supervisão e auditoria.',
    sources: [securitySource('Mapa de Interseções — Segurança e Digital', [1151, 1151])],
    relationIds: ['r26'],
    searchTerms: ['r26', 'agentes de IA', 'supervisão', 'auditoria'],
  },
  {
    id: 'seg-relation-r30',
    target: { kind: 'relacao', id: 'r30' },
    type: 'relacao_estrutural',
    title: 'Interseção Dados ↔ Quântico',
    summary: 'A relação r30 trata da proteção de dados com valor de longo prazo diante do risco de coleta presente e descriptografia futura.',
    sources: [securitySource('Mapa de Interseções — Dados e Quântico', [1155, 1155])],
    relationIds: ['r30'],
    searchTerms: ['r30', 'dados de longo prazo', 'harvest now decrypt later'],
  },
]

export const COVERAGE_LABELS: Record<CoverageMark | 'T', string> = {
  D: 'Direta no v.04',
  P: 'Parcial no v.04',
  L: 'Lacuna documental',
  T: 'Somente taxonômico — fora da amostra',
}

export function getEditorialBlock(kind: EditorialTargetKind, id: string): EditorialBlock | undefined {
  return EDITORIAL_BLOCKS.find((block) => block.target.kind === kind && block.target.id === id)
}
