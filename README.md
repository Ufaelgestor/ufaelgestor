# Ufaelgestor — site institucional

Site estático (landing page) hospedado via GitHub Pages, domínio `www.ufaelgestor.com.br`.
O conteúdo principal vive em `index.html` — **o site continua sendo HTML/CSS/JS puro,
servido como está, sem etapa de build**. O pipeline npm abaixo existe só para
desenvolvimento e CI (lint, testes, observabilidade opcional).

Ver `CLAUDE.md` para o fluxo de trabalho do repositório (Issue → Branch → PR → Deploy).

## Setup

```bash
npm install
```

## Scripts

| Script                | O que faz                                                              |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm run lint`          | Lint + checagem de formatação (Biome)                                   |
| `npm run lint:fix`      | Aplica correções automáticas do Biome                                   |
| `npm run knip`          | Detecta arquivos/exports não usados                                     |
| `npm run arch`          | Checa as regras de arquitetura (dependency-cruiser — "Arch-contract")   |
| `npm test`              | Testes unitários e de integração (Vitest)                               |
| `npm run coverage`      | Testes com relatório de cobertura (lcov, para o Codecov)                |
| `npm run mutation`      | Mutation testing (Stryker) — roda separado do CI de PR, é mais lento    |
| `npm run test:e2e`      | Testes end-to-end (Playwright) — sobe o site local em `http://127.0.0.1:4173` |
| `npm run serve`         | Serve o site estático localmente, sem rodar os testes                   |

Os hooks do Husky (`npm install` os ativa via `prepare`) rodam Biome no `pre-commit` e
Commitlint (Conventional Commits) no `commit-msg`.

## Observabilidade (opcional, desativada por padrão)

O site não tem servidor, então a configuração fica em um bloco `window.__OBSERVABILITY_CONFIG__`
no próprio `index.html` (esses valores — DSN do Sentry, endpoint OTLP — são públicos de
cliente, não são segredos). Deixe em branco para manter tudo desativado (nenhuma chamada de
rede extra, nenhum erro no console):

```html
<script>
  window.__OBSERVABILITY_CONFIG__ = {
    sentryDsn: '',       // Sentry (error tracking) — crie um projeto em sentry.io e cole o DSN aqui
    environment: 'production',
    otelExporterUrl: ''  // OpenTelemetry Web (tracing) — endpoint OTLP do seu collector
  };
</script>
```

Por que Sentry (e não Sentry + Datadog + New Relic juntos)? Os três resolvem o mesmo
problema (error tracking / RUM de navegador) — rodar os três ao mesmo tempo seria
redundante e pesaria a página à toa. OpenTelemetry Web é complementar (tracing de
performance), não concorrente.

Para o Codecov funcionar no CI, adicione o token do projeto (codecov.io) como o secret
`CODECOV_TOKEN` nas configurações do repositório no GitHub.

## Estrutura

```
index.html            # o site (HTML + Tailwind CDN)
src/motion.js          # loader, progresso, scroll-reveal, skeleton de imagem (módulo puro/testável)
src/observability.js   # Sentry (gated, no-op sem DSN)
src/otel.js             # OpenTelemetry Web (gated, no-op sem endpoint)
src/main.js             # bootstrap único carregado pelo index.html
tests/unit/             # Vitest (unitário + integração via jsdom)
tests/e2e/               # Playwright
```
