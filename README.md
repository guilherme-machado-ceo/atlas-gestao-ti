# Atlas de Gestão de TI em camadas

Aplicação estática interativa do método autoral de **Guilherme Gonçalves Machado**. A arquitetura é apresentada em 3D, com uma alternativa 2D que usa exatamente o mesmo modelo e estado de seleção.

## Executar localmente

Requisitos: Node.js 22 ou superior e npm.

```bash
npm ci
npm run dev
```

O servidor de desenvolvimento usa a porta 3000.

## Compilar e verificar

```bash
npm run lint
npm run build
npm run test:e2e
```

Os testes usam o Chromium do sistema quando ele está em `/usr/bin/chromium`. Em outros ambientes, instale o navegador do Playwright com `npx playwright install chromium` ou defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

O build estático é gerado em `dist/`. Para servir esse build localmente:

```bash
npm run preview
```

## Fonte única e validação bloqueante

O arquivo `public/data/atlas-modelo-v021-20261120.json` é a única fonte de conteúdo. Ele não deve ser editado pela aplicação.

Todo carregamento passa por `validateAtlasModel`, em `src/model/atlas.ts`. Se o JSON estiver ausente, for inválido ou violar integridade referencial, a interface mostra o erro e não renderiza conteúdo parcial.

O modelo 0.2.1 contém 7 posições, 41 subáreas, 101 itens e 33 relações. Soberania Digital é uma lente, não uma posição estrutural nem uma massa geométrica. A categoria de uma subárea não é herdada pelos itens.

## Arquitetura

- `src/model/`: contrato, validação, carregamento e navegação compartilhada.
- `src/scene/`: cena Three.js com React Three Fiber e Drei, geometria determinística e loop de 8 segundos.
- `src/components/Explorer.tsx`: navegação hierárquica e drawer móvel.
- `src/components/DetailPanel.tsx`: detalhes, proveniência, interseções e lente de Soberania.
- `src/components/Navigator2D.tsx`: alternativa textual com as mesmas posições, subáreas, itens e relações de interseção.
- `src/App.tsx`: estado compartilhado entre cena, lista e painel.

Não há servidor, banco de dados, autenticação ou persistência remota. A PWA usa atualização imediata e não aplica cache-first a documentos HTML ou navegação.

## Acessibilidade e dispositivos móveis

A aplicação respeita `prefers-reduced-motion`, não depende de hover, oferece controles por toque e teclado, foco visível, drawer com Escape e contenção de foco, e alternativa 2D integral.

Para captura determinística, use `?capture=1&t=0`. O hook `window.__seek(t)` permite selecionar outro instante; `window.__SCENE_READY__` sinaliza o primeiro frame e `window.__ATLAS_STATS__` expõe estatísticas do renderizador.

## GitHub Pages e domínio

O workflow `.github/workflows/deploy.yml` compila e publica `dist/` no GitHub Pages a cada push em `main`, ou por execução manual.

O arquivo `public/CNAME` define `atlas.hubstry.dev`. Para concluir a ativação do domínio:

1. No repositório, abra **Settings → Pages** e selecione **GitHub Actions** como fonte.
2. Execute o workflow após o push para `main`.
3. No provedor de DNS de `hubstry.dev`, crie o registro CNAME de `atlas` para `Hubstry-DeepTech.github.io`.
4. Aguarde a propagação e a emissão do certificado pelo GitHub; depois, mantenha **Enforce HTTPS** ativado.

A configuração do repositório e do workflow não substitui a criação do registro DNS nem significa que o domínio já esteja no ar.

## Escopo desta versão

Ficam fora empresas, fornecedores, funções profissionais, filtro por categoria, checklists, estudos de caso e ofertas comerciais. O mapa original e sua reclassificação interna não são usados.
