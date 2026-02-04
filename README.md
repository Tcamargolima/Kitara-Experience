KITARA
Exclusive Platform

![Status](https://img.shields.io/badge/status-production%20ready-success) ![Version](https://img.shields.io/badge/version-1.0.0-blue)

---

## 🌟 Visão Geral

MOSKINO é uma plataforma web moderna que transforma a experiência de compra e gestão de ingressos para eventos circenses. Com design vibrante inspirado no universo do circo, oferece uma interface intuitiva tanto para clientes quanto para administradores.

### ✨ Principais Características

- 🎫 **Gestão de Ingressos**: Sistema completo de criação, venda e validação
- 💳 **Assinaturas**: Planos recorrentes com diferentes níveis de acesso
- 🔐 **Segurança Robusta**: 2FA, RLS, logs de auditoria e bloqueio automático
- 👥 **Sistema de Roles**: Admin, Cliente e Pendente com aprovação manual
- 📱 **PWA Completo**: Instalável em iOS, Android e Desktop
- 🎨 **Design Temático**: Interface vibrante e responsiva inspirada no circo
- 🌐 **100% em Português**: Localização completa

---

## 🚀 Quick Start

### ⚠️ IMPORTANTE - Antes de Usar

**Execute a migração SQL no Supabase!** Ver arquivo: [LEIA_PRIMEIRO.md](./LEIA_PRIMEIRO.md)

### Instalação Local

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>

# Navegue até o diretório
cd <YOUR_PROJECT_NAME>

# Instale as dependências
npm install

# Execute a migração SQL no Supabase
# Ver: CREATE_SECURE_ROLES_MIGRATION.sql

# Inicie o servidor de desenvolvimento
npm run dev
```

### Primeiro Acesso

1. Execute a migração SQL no Supabase (**obrigatório**)
2. Crie o primeiro admin:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'seu@email.com'),
  'admin'
);
```
3. Acesse `/auth` e faça login

---

## 📚 Documentação Completa

| Documento | Descrição |
|-----------|-----------|
| **[GUIA_PRODUCAO.md](./GUIA_PRODUCAO.md)** | 🚀 Guia completo de deploy e checklist |
| **[LEIA_PRIMEIRO.md](./LEIA_PRIMEIRO.md)** | ⚠️ **OBRIGATÓRIO** - Setup inicial |
| **[TODAS_MIGRACOES_SQL.md](./TODAS_MIGRACOES_SQL.md)** | 🗄️ Histórico de migrações SQL |
| **[CHANGELOG.md](./CHANGELOG.md)** | 📋 Histórico de versões |

---

## 🏗️ Stack Tecnológico

### Frontend
- React 18.3 + TypeScript
- Tailwind CSS com design system customizado
- Vite (build otimizado)
- React Router (navegação)
- React Query (cache e estado)
- shadcn/ui (componentes)

### Backend
- **Supabase** (backend completo)
  - PostgreSQL
  - Auth (Email + SMS)
  - Edge Functions
  - Realtime
  - Storage

### Segurança
- Row Level Security (RLS)
- 2FA com TOTP
- Sistema de bloqueio automático
- Logs de auditoria
- Criptografia de dados

---

## 🔒 Segurança

✅ RLS em todas as tabelas  
✅ 2FA com backup codes  
✅ Bloqueio após 5 tentativas  
✅ Logs completos de auditoria  
✅ Sistema de roles server-side  
✅ Validação de entrada  
✅ Criptografia de dados sensíveis  

---

## 👥 Sistema de Roles

| Role | Descrição | Permissões |
|------|-----------|------------|
| **Pendente** | Novo usuário | Aguarda aprovação |
| **Cliente** | Usuário aprovado | Compra ingressos, gerencia perfil |
| **Admin** | Administrador | Todas as permissões + gestão de usuários |

---

## 📱 PWA Features

- ✅ Instalável em todos os dispositivos
- ✅ Funciona offline
- ✅ Service Worker otimizado
- ✅ Push notifications (planejado)

### Como Instalar

- **iOS**: Safari → Compartilhar → Adicionar à Tela de Início
- **Android**: Chrome → Menu → Instalar app
- **Desktop**: Chrome/Edge → Ícone de instalação

---

## 🎨 Design System

### Cores

```css
/* Tema Claro */
--primary: #0d7377      /* Teal circense */
--secondary: #edc967    /* Dourado */
--accent: #d95f4c       /* Vermelho circo */
```

### Tipografia

- **Títulos**: Bungee (impactante)
- **Corpo**: Fredoka (amigável)

---

## 🚀 Deploy

### Via Lovable (Recomendado)

1. Abra o projeto no [Lovable](https://lovable.dev/projects/84ff0ded-7025-42ae-a976-8f4263ce788f)
2. Clique em **Share → Publish**
3. Pronto! 🎉

### Manual

```bash
npm run build
# Deploy dist/ para seu host
```

**Ver guia completo:** [GUIA_PRODUCAO.md](./GUIA_PRODUCAO.md)

---

## 📊 Database Schema

### Principais Tabelas

- `profiles` - Perfis de usuários
- `user_roles` - Roles (admin/cliente/pendente)
- `tickets` - Ingressos
- `subscriptions` - Assinaturas
- `access_logs` - Logs de acesso
- `two_factor_settings` - Config 2FA
- `backup_codes` - Códigos de recuperação

---

## 🛠️ Desenvolvimento

### Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run preview  # Preview da build
npm run lint     # Lint
```

### Editar o Projeto

**Use Lovable:**
[Abrir no Lovable](https://lovable.dev/projects/84ff0ded-7025-42ae-a976-8f4263ce788f)

**Use sua IDE:**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

**GitHub Codespaces:**
Code → Codespaces → New codespace

---

## 🧪 Testes

### Testar Autenticação
1. Criar nova conta → Verificar role 'pendente'
2. Admin aprova → Verificar mudança para 'cliente'

### Testar RLS
1. Login como cliente
2. Tentar acessar dados de outro usuário (deve falhar)

### Testar 2FA
1. Ativar 2FA → Logout → Login com código

---

## 🆘 Suporte

### Problemas Comuns

**"requested path is invalid"**  
→ Configure Site URL e Redirect URLs no Supabase Auth

**Usuários não fazem login**  
→ Execute a migração SQL e verifique roles

**PWA não instala**  
→ Verifique HTTPS e valide manifest.json

### Recursos

- 📖 [Docs Lovable](https://docs.lovable.dev)
- 📖 [Docs Supabase](https://supabase.com/docs)
- 💬 [Discord Lovable](https://discord.gg/lovable)

---

## 🎯 Roadmap

### v1.1 (Próximo)
- [ ] QR Code para validação
- [ ] Notificações push
- [ ] Pagamentos (Stripe/PagSeguro)
- [ ] Dashboard analytics

### v1.2 (Futuro)
- [ ] App mobile nativo
- [ ] Sistema de cupons
- [ ] Chat de suporte
- [ ] Integração redes sociais

---

## 📁 Estrutura

```
moskino/
├── src/
│   ├── components/      # Componentes React
│   ├── hooks/          # Hooks customizados
│   ├── pages/          # Páginas
│   └── integrations/   # Supabase client
├── supabase/
│   ├── functions/      # Edge Functions
│   └── config.toml     # Config
├── public/             # Assets estáticos
├── GUIA_PRODUCAO.md    # 🚀 Deploy
├── LEIA_PRIMEIRO.md    # ⚠️ Setup
└── README.md           # Este arquivo
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Projeto proprietário e confidencial.

---

## 🌟 Project Info

**URL**: https://lovable.dev/projects/84ff0ded-7025-42ae-a976-8f4263ce788f

**Supabase Project**: hsesjkiqblfqcehzbnhc

---

## 🎉 Agradecimentos

- [Lovable](https://lovable.dev) - Plataforma incrível
- [Supabase](https://supabase.com) - Backend poderoso
- [shadcn/ui](https://ui.shadcn.com) - Componentes elegantes
- Comunidade open source

---

**Feito com ❤️ para o mundo mágico do circo 🎪**
