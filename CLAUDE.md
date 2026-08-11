# CLAUDE.md

Instruções de processo para qualquer agente de IA (Claude, ou qualquer outro modelo/ferramenta) que trabalhe neste repositório.

## Sobre o projeto

Site institucional estático (landing page) da Ufaelgestor — hospedado via GitHub Pages, domínio `www.ufaelgestor.com.br` (ver `CNAME`). O conteúdo principal vive em `index.html`.

## Padrão de trabalho: Issues + Pull Requests

Este repositório segue um fluxo obrigatório de **Issue → Branch → Pull Request → Deploy** para toda mudança no código, independente do tamanho.

### 1. Toda tarefa começa com uma Issue

Antes de iniciar qualquer trabalho, crie uma Issue no GitHub descrevendo a tarefa. Toda tarefa se enquadra em um destes tipos:

- **Correção (bug fix)** — algo que está quebrado ou incorreto.
- **Melhoria (enhancement)** — ajuste ou otimização de algo que já existe.
- **Nova função (feature)** — funcionalidade ou conteúdo novo.

A Issue deve conter:
- Título claro e objetivo.
- Descrição do problema/necessidade e o critério de aceite.
- Label indicando o tipo (`bug`, `enhancement`, `feature`/`documentation`, conforme aplicável).

Não pule esta etapa mesmo em tarefas pequenas — toda mudança precisa ser rastreável por uma Issue.

### 2. Desenvolva em branch dedicada

Crie uma branch a partir da branch principal (`main`) para cada tarefa/Issue. Não commite diretamente na `main`.

### 3. Abra um Pull Request

Ao concluir o trabalho, abra um Pull Request da branch de trabalho para a `main`.

**Regra obrigatória:** a descrição do PR deve mencionar/referenciar a Issue correspondente, usando palavras-chave de fechamento automático do GitHub sempre que o PR resolver completamente a Issue:

```
Closes #<numero-da-issue>
```

(ou `Fixes #<numero>` / `Resolves #<numero>`). Se o PR for apenas parte do trabalho da Issue, referencie sem fechar: `Refs #<numero>`.

### 4. Deploys são geridos via Pull Request

O deploy do site acontece através do merge do Pull Request na branch `main`. Ou seja:
- Não há deploy manual fora do fluxo de PR.
- O merge do PR é o gatilho de publicação — revise o conteúdo antes de aprovar/mesclar.
- Cada PR deve, na medida do possível, corresponder a uma unidade de deploy coerente (uma Issue resolvida = um PR = um deploy).

### 5. Boas práticas adicionais

- Commits com mensagens claras e descritivas, focadas no "porquê" da mudança.
- Não crie Pull Requests sem que exista uma Issue associada.
- Não force push nem reescreva histórico da `main`.
- Ao fechar uma Issue via PR, confirme que o critério de aceite foi atendido antes de mesclar.

Este padrão vale para qualquer agente (independente do modelo/ferramenta usada) e para colaboradores humanos.
