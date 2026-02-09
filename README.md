KITARA — Secure Experience Platform

KITARA é uma plataforma de experiência premium construída com foco absoluto em segurança, governança e arquitetura limpa.

Não é apenas um dashboard.
Não é apenas um sistema de ingressos.
Não é apenas autenticação com MFA.

KITARA é uma plataforma arquitetada para operar sob regras rígidas de segurança e integridade, onde a interface nunca acessa dados diretamente e toda operação passa por camadas controladas de RPC e Edge Functions.

🎯 Objetivo da Plataforma

KITARA foi projetado para:

Oferecer uma experiência premium e exclusiva

Operar com MFA obrigatório e auditoria completa

Garantir governança total sobre usuários, acessos e eventos

Trabalhar com venda de ingressos, cupons e convites de forma segura

Permitir crescimento do produto sem comprometer a arquitetura

A prioridade máxima do projeto é:

Segurança > Arquitetura > UX > Features

🛡️ Princípio Central: Segurança Máxima

A segurança do KITARA não é um recurso.
Ela é a base do projeto.

Regras invioláveis do frontend

É PROIBIDO usar supabase.from() no frontend

Todo acesso a dados acontece exclusivamente via:

src/lib/api.ts

RPC (Postgres Functions)

Edge Functions

MFA é obrigatório

Logs de segurança são auditáveis

Nenhuma informação sensível é manipulada na UI

Se algum desenvolvedor quebrar essa regra, está quebrando a arquitetura do projeto.

🧱 Arquitetura do Projeto
src/
 ├─ components/
 │   ├─ dashboard/        → Tabs do painel (orquestradores)
 │   ├─ auth/             → Fluxo MFA + Stepper
 │   ├─ security/         → Configurações e verificação 2FA
 │   └─ ui/               → shadcn/ui
 │
 ├─ hooks/                → Camada de estado e regras
 ├─ lib/
 │   ├─ api.ts            → ÚNICO ponto de acesso a dados
 │   └─ security.ts       → Regras de segurança
 │
 ├─ pages/
 │   ├─ Index.tsx         → Landing
 │   ├─ Auth.tsx          → Fluxo de autenticação
 │   └─ Dashboard.tsx     → Orquestração do painel

🧭 Filosofia de Componentes

Componentes grandes foram quebrados em módulos

Nenhum arquivo crítico ultrapassa 200 linhas

Dashboard tabs são orquestradores, não lógicas de negócio

UI é desacoplada da regra de negócio

🔐 Fluxo de Autenticação

Fluxo visual com AuthStepper:

invite → signup → mfa_setup → mfa_verify


Com transições suaves, consistência visual e MFA obrigatório.

🎟️ Sistema de Ingressos e Cupons

Ingressos carregados via RPC

Aplicação de cupom Elixir validado via RPC

Criação de pedido com confirmação de compra

Estoque atualizado em tempo real

Nenhuma regra de preço no frontend

🛠️ Stack Tecnológica

React + TypeScript

Vite

Tailwind + shadcn/ui

Supabase (RPC / Edge Functions)

MFA baseado em TOTP

Arquitetura zero-acesso-direto a banco

🎨 Identidade Visual

KITARA possui identidade visual própria e imutável:

Tema Dark Luxury

Tipografia Cinzel + Inter

Glassmorphism

Animações suaves globais

Essa identidade não deve ser alterada.

📜 Regras de Desenvolvimento (MANDATÓRIO)

Nunca usar supabase.from() no frontend

Nunca misturar regra de negócio com UI

Nunca remover MFA

Nunca alterar identidade visual

Toda nova feature deve respeitar a arquitetura existente

🚀 Como rodar localmente
npm install
npm run dev


Build:

npm run build

📌 Estado Atual do Projeto

O projeto passou por um refactor arquitetural completo:

AdminTab modularizado

SecurityTab conectado à arquitetura real

Auth com stepper e UX profissional

Products com skeleton e confirmação

Landing com features e footer

Animações globais padronizadas

🧠 Próxima Fase do Projeto

A próxima etapa é conectar toda a UI já refatorada com:

Logs reais de segurança

Métricas reais

Governança real via RPC

Sem alterar a UI, apenas fortalecendo a camada de dados.

🏁 Conclusão

KITARA não é um projeto comum.

É uma plataforma pensada para:

Crescer sem perder controle
Escalar sem virar bagunça
Evoluir sem comprometer segurança
