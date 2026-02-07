

# Refatoracao Completa: UI / Componentes / UX / Dashboard / Tickets / Flows

## Resumo

Refatoracao profunda focada em melhorar a experiencia do usuario, modularizar componentes grandes, polir a identidade visual KITARA e otimizar os fluxos de autenticacao e compra.

---

## 1. Quebrar o AdminTab (454 linhas) em subcomponentes

O `AdminTab.tsx` concentra stats, 3 dialogs de criacao e 2 sub-tabs -- tudo em um unico arquivo de 454 linhas.

- **Extrair `AdminStatsGrid`** -- grid de 4 cards de metricas (usuarios, pedidos, receita, ingressos)
- **Extrair `CreateTicketDialog`** -- dialog de criacao de ingresso com formulario
- **Extrair `CreateCouponDialog`** -- dialog de criacao de cupom Elixir
- **Extrair `CreateInviteDialog`** -- dialog de geracao de convite com exibicao do codigo gerado
- **AdminTab reduzido** -- orquestra os subcomponentes, chama `fetchData` e passa dados

## 2. Melhorar a SecurityTab (327 linhas)

- **Remover dados mock** -- substituir por chamadas RPC reais (ou placeholders claros com mensagem "dados reais em breve")
- **Condicionar abas admin-only** -- as abas "Gerenciar Usuarios" e "Logs de Seguranca" so devem aparecer para admins; clientes veem apenas "Minhas Configuracoes"
- **Extrair `SecurityStatsGrid`** -- os 3 cards de metricas no topo

## 3. Melhorar a Landing Page (Index.tsx)

- **Adicionar secao de features** -- o comentario na linha 175 indica `{/* Features Showcase ... (segue igual, sem alteracoes) */}` mas o conteudo foi cortado; garantir que exista uma secao de features completa com 3-4 cards (Seguranca, Exclusividade, Experiencia Premium, Suporte)
- **Melhorar responsividade** -- ajustar tamanhos de tipografia para telas menores
- **Adicionar footer minimalista** -- com copyright e link para suporte

## 4. Polir o fluxo de Auth

- **Adicionar transicoes suaves** -- ao trocar entre steps (invite -> signup -> mfa_setup -> mfa_verify), usar animacao de fade/slide
- **Melhorar feedback visual** -- indicador de progresso (stepper) mostrando em qual etapa o usuario esta (1. Convite, 2. Cadastro, 3. MFA, 4. Verificacao)
- **Botao de voltar consistente** -- em todas as etapas exceto a primeira

## 5. Melhorar ProductsTab e TicketCard

- **Estado vazio mais atraente** -- ilustracao ou animacao ao inves de apenas icone + texto
- **Skeleton loading** -- mostrar cards skeleton enquanto carrega, ao inves de spinner generico
- **Feedback de compra melhorado** -- dialog de confirmacao antes de comprar, com resumo do pedido

## 6. Melhorias globais de UX

- **Adicionar animacoes de entrada** -- fade-in nos cards e secoes ao carregar
- **Scroll-to-top** -- ao trocar de aba no dashboard
- **Melhorar responsividade das tabs** -- em mobile, usar scroll horizontal ou dropdown
- **Loading states consistentes** -- padronizar skeleton vs spinner em toda a app

---

## Detalhes Tecnicos

### Novos arquivos a criar:
- `src/components/dashboard/AdminStatsGrid.tsx`
- `src/components/dashboard/CreateTicketDialog.tsx`
- `src/components/dashboard/CreateCouponDialog.tsx`
- `src/components/dashboard/CreateInviteDialog.tsx`
- `src/components/dashboard/SecurityStatsGrid.tsx`
- `src/components/auth/AuthStepper.tsx` (indicador de progresso)
- `src/components/common/SkeletonCard.tsx`

### Arquivos a modificar:
- `src/components/dashboard/AdminTab.tsx` -- reduzir para orquestrador
- `src/components/dashboard/SecurityTab.tsx` -- condicionar abas por role, remover mock
- `src/components/dashboard/ProductsTab.tsx` -- skeleton loading, dialog de confirmacao
- `src/pages/Auth.tsx` -- adicionar AuthStepper e transicoes
- `src/pages/Index.tsx` -- completar features, footer
- `src/index.css` -- animacoes utilitarias (fade-in, slide-up)

### Regras mantidas:
- Zero `supabase.from()` -- tudo via RPC/Edge Functions
- Identidade visual KITARA inalterada (cores, fontes, glassmorphism)
- Seguranca MFA obrigatoria preservada
- Todas as chamadas de dados via `src/lib/api.ts`

