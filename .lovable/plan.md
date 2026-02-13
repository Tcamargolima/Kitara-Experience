

# Refinamento Premium do Design KITARA

Elevacao do design para padrao "Top Tier" mantendo 100% da identidade visual (Cinzel, paleta #050505/#00FF9D/#C5A059).

## Regra de Ouro

- Fonte Cinzel: INTOCAVEL
- Paleta de cores: INTOCAVEL
- Video de fundo: MANTIDO
- Foco: layout, espacamento, tamanhos, acabamentos, hierarquia

---

## 1. Landing Page Cinematica (Index.tsx)

### Reestruturacao do Layout

O layout atual centraliza tudo verticalmente. A proposta e reorganizar para um layout VIP com mais respiro:

- **Video**: Mover para background full-screen com overlay escuro (`bg-black/60`) em vez de inline com bordas arredondadas. O video ocupa 100% da viewport como fundo cinematico.
- **Conteudo sobre o video**: Logo no topo com `pt-12`, titulo + subtitulo + CTA na parte inferior com `pb-20`, centro livre para respirar.
- **Remover decoracoes excessivas**: Sparkles e Zap icons flutuantes removidos em favor de um design mais limpo e sofisticado.
- **Badge "Members Only"**: Mantido no topo, com blur mais intenso.

### Tipografia Hero

- Titulo "KITARA": Manter `font-cinzel`, ajustar para `text-6xl md:text-8xl` com `font-bold tracking-tight` (mais impactante que o atual `font-light tracking-[-0.04em]`).
- Subtitulo: `text-white/80` para contraste suave sobre o overlay.
- Linha decorativa dourada abaixo do titulo mantida.

### CTA Principal

- Manter `rounded-full` e glassmorphism (`backdrop-blur-md`).
- Adicionar degrade sutil das cores da marca (secondary para primary).
- Transicao `transition-all duration-300` no hover.

### Features Section

- Aumentar padding dos cards para `p-8`.
- Aumentar gap do grid para `gap-8`.
- Cards com `rounded-3xl` e `border-white/10`.
- Icones com containers maiores (`w-12 h-12`).

### Footer

- Padding mais generoso (`py-16`).

---

## 2. Tela de Autenticacao (Auth.tsx)

- Card de login/signup com `rounded-3xl` e padding `p-8`.
- Espacamento interno dos forms aumentado (`space-y-6`).
- Logo com mais respiro (`mb-10`).
- Inputs com `rounded-xl` e bordas mais sutis (`border-white/10`).

---

## 3. Dashboard (DashboardLayout.tsx + tabs)

### Header/Navegacao

- Glassmorphism na barra: `backdrop-blur-md` + `bg-background/80`.
- Padding mais generoso (`py-5 px-6`).
- Logo ligeiramente maior.

### Tabs

- `rounded-2xl` nos containers de tabs.
- Mais padding nos triggers.

### Cards globais

- Padding `p-6` a `p-8`.
- `rounded-2xl` ou `rounded-3xl`.
- Bordas `border-white/10` em vez de dourado pesado.
- Sombras removidas em favor de bordas sutis.

---

## 4. CSS Global (index.css)

### Ajustes nas classes kitara-*

- `.kitara-card`: `rounded-2xl`, border `border-white/10`, remover box-shadow pesado.
- `.kitara-button`: Adicionar `transition-all duration-300`, hover com `scale-[1.02]` sutil.
- `.kitara-header`: `backdrop-blur-md`, `bg-background/80`.
- `.kitara-input`: `rounded-xl`.
- `.kitara-tabs`: `rounded-2xl`, padding `p-1.5`.

### Novo utilitario

- `.kitara-glass`: `backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl` para reutilizacao.

---

## Arquivos a Modificar

1. **`src/index.css`** -- Refinar classes kitara-* (bordas, raios, sombras, transicoes)
2. **`src/pages/Index.tsx`** -- Reestruturar hero com video fullscreen + overlay, ajustar tipografia e espacamentos
3. **`src/pages/Auth.tsx`** -- Aumentar espacamentos e refinar acabamentos
4. **`src/components/auth/LoginStep.tsx`** -- Padding e bordas premium nos cards/inputs
5. **`src/components/auth/InviteCodeStep.tsx`** -- Mesmo refinamento
6. **`src/components/auth/SignUpStep.tsx`** -- Mesmo refinamento
7. **`src/components/auth/MFASetupStep.tsx`** -- Mesmo refinamento
8. **`src/components/auth/MFAVerifyStep.tsx`** -- Mesmo refinamento
9. **`src/components/auth/AuthStepper.tsx`** -- Espacamento mais generoso
10. **`src/components/layout/DashboardLayout.tsx`** -- Header glassmorphism, padding generoso
11. **`src/pages/Dashboard.tsx`** -- Tabs com acabamento refinado
12. **`src/components/dashboard/ProductsTab.tsx`** -- Cards com mais respiro
13. **`src/components/dashboard/SecurityTab.tsx`** -- Cards com mais respiro

## Principios Aplicados

- "Menos e mais": whitespace generoso transmite luxo
- Bordas sutis (`border-white/10`) em vez de sombras pesadas
- Cantos organicos (`rounded-2xl`, `rounded-3xl`)
- Transicoes suaves em todos os interativos (`transition-all duration-300`)
- Hierarquia tipografica via tamanho e opacidade, nao via mudanca de fonte
- Glassmorphism na navegacao com `backdrop-blur-md`

