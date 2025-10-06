# 🎪 MOSKINO - Guia de Deploy para Produção

## ✅ Checklist Pré-Deploy

### 1. Configuração do Banco de Dados (OBRIGATÓRIO)
- [ ] Executar migração SQL no Supabase (arquivo: `CREATE_SECURE_ROLES_MIGRATION.sql`)
- [ ] Criar primeiro usuário admin no banco de dados
- [ ] Verificar RLS (Row Level Security) ativo em todas as tabelas
- [ ] Testar sistema de roles (admin, cliente, pendente)

**Instruções detalhadas:** Ver arquivo `LEIA_PRIMEIRO.md`

### 2. Segurança
- [x] RLS configurado em todas as tabelas
- [x] Autenticação implementada (Email + SMS)
- [x] 2FA (Autenticação de dois fatores) disponível
- [x] Sistema de bloqueio de conta após tentativas falhas
- [x] Logs de acesso e auditoria
- [ ] Configurar domínio no Supabase Auth (URL Configuration)
- [ ] Atualizar URLs em `index.html` para domínio de produção

### 3. Performance
- [x] Fonts otimizadas com `display=swap`
- [x] Preconnect para recursos externos
- [x] PWA configurado (Service Worker)
- [x] Lazy loading implementado
- [x] Design system otimizado (HSL colors)

### 4. SEO
- [x] Meta tags completas (title, description, keywords)
- [x] Open Graph tags (Facebook, LinkedIn)
- [x] Twitter Cards
- [x] Structured Data (Schema.org)
- [x] Canonical URL
- [x] Favicon configurado
- [ ] Sitemap.xml (opcional)
- [x] robots.txt configurado

### 5. PWA (Progressive Web App)
- [x] Manifest.json configurado
- [x] Service Worker registrado
- [x] Ícones 192x192 e 512x512
- [x] Suporte iOS (Apple Touch Icons)
- [x] Instruções de instalação para iOS
- [x] Prompt de instalação automático

---

## 🚀 Passos para Deploy

### Passo 1: Configurar Banco de Dados

1. Acesse o Supabase Dashboard → SQL Editor
2. Cole o conteúdo de `CREATE_SECURE_ROLES_MIGRATION.sql`
3. Execute o SQL
4. Crie o primeiro admin:

```sql
-- Substitua pelo seu email
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'seu@email.com'),
  'admin'
);
```

### Passo 2: Configurar Autenticação

1. Supabase Dashboard → Authentication → Providers
2. Habilitar Email Provider
3. Ir em Authentication → URL Configuration
4. Configurar:
   - **Site URL**: `https://seu-dominio.com`
   - **Redirect URLs**: 
     - `https://seu-dominio.com/**`
     - `https://3f1b9b8d-6be0-48cf-ac26-62667b3ab7a3.lovableproject.com/**`

### Passo 3: Configurar Edge Functions (Opcional)

Se usar notificações por email/SMS:

1. Supabase Dashboard → Edge Functions → Secrets
2. Adicionar secrets necessários (RESEND_API_KEY, etc)

### Passo 4: Deploy no Lovable

1. Clique em **Publish** no canto superior direito
2. O Lovable fará o deploy automático
3. Sua URL de produção será: `https://3f1b9b8d-6be0-48cf-ac26-62667b3ab7a3.lovableproject.com`

### Passo 5: Configurar Domínio Customizado (Opcional)

1. Project → Settings → Domains no Lovable
2. Adicionar seu domínio customizado
3. Configurar DNS conforme instruções
4. Atualizar URLs no Supabase Authentication

---

## 🔒 Segurança em Produção

### Configurações Críticas

1. **Desabilitar "Confirm Email"** (opcional para testes):
   - Supabase Dashboard → Authentication → Settings
   - Desmarcar "Enable email confirmations"

2. **Configurar Email Templates**:
   - Authentication → Email Templates
   - Customizar mensagens de boas-vindas

3. **Rate Limiting**:
   - Verificar limites de API no Supabase
   - Configurar rate limits adequados

### Verificação de Segurança

```bash
# Testar autenticação
1. Criar nova conta
2. Verificar que novo usuário tem role 'pendente'
3. Admin aprova usuário
4. Verificar mudança de role para 'cliente'

# Testar RLS
1. Tentar acessar dados de outro usuário (deve falhar)
2. Verificar logs de acesso
3. Testar 2FA
```

---

## 📊 Monitoramento

### Logs Importantes

1. **Authentication Logs**:
   - Supabase Dashboard → Authentication → Users
   - Verificar tentativas de login

2. **Database Logs**:
   - Supabase Dashboard → Database → Logs
   - Monitorar queries e erros

3. **Edge Function Logs**:
   - Supabase Dashboard → Edge Functions → Logs

---

## 🎨 Customização Pós-Deploy

### Atualizar URLs em Produção

Após deploy, atualizar:

1. **index.html**:
   ```html
   <link rel="canonical" href="https://SEU-DOMINIO.com" />
   <meta property="og:url" content="https://SEU-DOMINIO.com" />
   ```

2. **Supabase Auth**:
   - Site URL
   - Redirect URLs

### Configurar Analytics (Opcional)

Adicionar Google Analytics ou similar:

```html
<!-- No index.html, antes de </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🆘 Troubleshooting

### Erro: "requested path is invalid"
- Verificar Site URL e Redirect URLs no Supabase Auth

### Usuários não conseguem fazer login
- Verificar se a migração SQL foi executada
- Verificar se o usuário tem role atribuída

### PWA não instala
- Verificar HTTPS habilitado
- Verificar manifest.json válido
- Testar em diferentes navegadores

### Erro 403 ao acessar dados
- Verificar RLS policies
- Verificar se usuário está autenticado
- Verificar role do usuário

---

## 📱 Recursos PWA

### Instalação iOS
1. Safari → Compartilhar
2. "Adicionar à Tela de Início"

### Instalação Android
1. Chrome → Menu (⋮)
2. "Instalar app" ou "Adicionar à tela inicial"

### Instalação Desktop
1. Chrome/Edge → Ícone de instalação na barra de endereço
2. Ou: Menu → "Instalar MOSKINO..."

---

## 🎯 Performance Checklist

- [x] Imagens otimizadas
- [x] Fonts com preload e display=swap
- [x] Service Worker ativo
- [x] Cache configurado
- [x] Minificação automática (Vite)
- [x] Tree-shaking habilitado
- [x] Code splitting automático

---

## 📞 Suporte

Para problemas técnicos:
1. Verificar console do navegador (F12)
2. Verificar Supabase Logs
3. Verificar documentação do Lovable: https://docs.lovable.dev

---

## 🎉 Conclusão

Após seguir todos os passos:
- ✅ App seguro e otimizado
- ✅ PWA funcional
- ✅ SEO otimizado
- ✅ Sistema de roles implementado
- ✅ Autenticação robusta
- ✅ Pronto para produção!

**Próximos passos sugeridos:**
1. Configurar domínio customizado
2. Adicionar analytics
3. Configurar backup automático do banco
4. Implementar monitoramento de erros (Sentry, etc)
5. Criar documentação de uso para administradores

---

**Versão do App:** 1.0.0  
**Última atualização:** 2025-10-06
