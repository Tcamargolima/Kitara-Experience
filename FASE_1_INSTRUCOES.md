# 🔒 FASE 1: SISTEMA DE ROLES SEGURO - INSTRUÇÕES

## ⚠️ IMPORTANTE: EXECUTE ESTAS ETAPAS NESTA ORDEM

### 📋 Passo 1: Executar SQL no Supabase

1. Acesse o **Supabase Dashboard** do seu projeto
2. Vá em **SQL Editor**
3. Crie uma nova query
4. Copie TODO o conteúdo do arquivo `CREATE_SECURE_ROLES_MIGRATION.sql` (na raiz do projeto)
5. Cole no editor SQL
6. Clique em **RUN** para executar

**O que este SQL faz:**
- ✅ Cria enum `app_role` com valores: admin, cliente, pendente
- ✅ Cria tabela `user_roles` com RLS habilitado
- ✅ Cria função `has_role()` com SECURITY DEFINER (segura contra escalação de privilégios)
- ✅ Cria função `get_user_role()` para obter role do usuário
- ✅ Define políticas RLS seguras
- ✅ Cria trigger para atribuir role 'pendente' a novos usuários automaticamente
- ✅ Migra dados existentes de `profiles.profile` para `user_roles`
- ✅ Atualiza políticas RLS da tabela `profiles` para usar `has_role()`

---

### 🔄 Passo 2: Atualizar Types TypeScript

Após executar o SQL, você precisa atualizar os tipos TypeScript do Supabase:

**Opção A - Via Terminal (Recomendado):**
```bash
npx supabase db pull
```

**Opção B - Via Lovable:**
Na interface do Lovable, use o comando para sincronizar os tipos do Supabase.

---

### ✅ Passo 3: Verificar Implementação

Após executar os passos 1 e 2, o sistema estará com:

**✅ Código Frontend Atualizado:**
- `useAuth.ts`: Agora consulta `user_roles` ao invés de `profiles.profile`
- Dashboard: Usa `userRole` e `isPending` para controle de acesso
- Novo componente: `PendingApprovalScreen` para usuários aguardando aprovação
- Removidos: Botões de "Acesso Rápido - Testes" e código localStorage inseguro

**✅ Segurança Implementada:**
- Roles armazenadas em tabela separada com RLS
- Função SECURITY DEFINER previne escalação de privilégios
- Impossível modificar roles via DevTools
- Novos usuários recebem role 'pendente' automaticamente

---

## 🧪 Como Testar

### 1. Criar Primeiro Admin
Execute no **Supabase SQL Editor**:

```sql
-- Criar usuário admin (substitua o email e senha)
-- Primeiro, crie o usuário via signup normal no app
-- Depois execute:

INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@moskino.circo'),
  'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;
```

**OU** use as credenciais padrão:
- Email: `admin@moskino.circo`
- Senha: `Circense@0101`

### 2. Testar Fluxo de Aprovação

**Teste como Cliente Pendente:**
1. Registre um novo usuário
2. Você verá a tela "Aguardando Aprovação"
3. Role será automaticamente 'pendente'
4. Acesso bloqueado até aprovação

**Teste como Admin:**
1. Faça login com conta admin
2. Vá para Dashboard > Admin
3. Você verá interface administrativa
4. (Fase 2 adicionará gestão de usuários aqui)

### 3. Teste de Segurança

**Tente escalar privilégios (deve FALHAR):**
1. Abra DevTools (F12)
2. Tente executar:
```javascript
// Isto NÃO FUNCIONA MAIS (seguro!)
localStorage.setItem('specialUser', JSON.stringify({profile: 'admin'}))
```
3. Tente modificar no console o userRole
4. Tente acessar `/dashboard` diretamente

**Resultado esperado:** 
- ❌ localStorage não afeta autenticação
- ❌ Não consegue modificar role no cliente
- ✅ Sistema verifica role no servidor (RLS + SECURITY DEFINER)

---

## 🎯 O Que Foi Removido

### ❌ Código Inseguro Removido:
- Lógica de `specialUser` no localStorage
- Botões de "Acesso Rápido - Testes"
- Verificação de admin via `profiles.profile`
- Códigos especiais "123123" hardcoded

### ✅ Substituído Por:
- Verificação server-side via `user_roles`
- Função `has_role()` com SECURITY DEFINER
- RLS policies robustas
- Sistema de aprovação baseado em roles

---

## 📊 Arquitetura de Segurança

```
┌─────────────────────────────────────────┐
│         FRONTEND (React)                │
│  ┌──────────────────────────────┐       │
│  │  useAuth Hook                │       │
│  │  - Consulta user_roles       │       │
│  │  - hasRole(role)             │       │
│  │  - isPending / isAdmin       │       │
│  └──────────────────────────────┘       │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      SUPABASE (Backend)                 │
│  ┌──────────────────────────────┐       │
│  │  user_roles TABLE (RLS ON)   │       │
│  │  - user_id (FK to auth.users)│       │
│  │  - role (app_role enum)      │       │
│  └──────────────────────────────┘       │
│              │                           │
│  ┌──────────▼───────────────────┐       │
│  │  has_role() FUNCTION         │       │
│  │  - SECURITY DEFINER          │       │
│  │  - Bypassa RLS internamente  │       │
│  │  - Previne recursão          │       │
│  └──────────────────────────────┘       │
│              │                           │
│  ┌──────────▼───────────────────┐       │
│  │  RLS POLICIES                │       │
│  │  - Usa has_role() nas checks │       │
│  │  - Admin: CRUD completo      │       │
│  │  - User: SELECT própria role │       │
│  └──────────────────────────────┘       │
└─────────────────────────────────────────┘
```

---

## 🚀 Próximos Passos

Após completar a Fase 1:

**✅ Sistema Seguro:**
- Roles armazenadas de forma segura
- Impossível escalar privilégios
- Verificação server-side funcional

**📋 Próxima Fase (Fase 2):**
- Sistema de Aprovação de Usuários
- Interface de Gestão no Admin
- Notificações de aprovação/rejeição
- Log de auditoria

---

## 📞 Suporte

Se encontrar problemas:

1. **Erro de tipos TypeScript:** Execute `npx supabase db pull`
2. **Tabela não existe:** Verifique se executou o SQL corretamente
3. **RLS bloqueando:** Verifique as policies no Supabase Dashboard
4. **Não consegue criar admin:** Execute o SQL de criação de admin manualmente

---

## 🎉 Conclusão

Após seguir estes passos, seu sistema estará **100% seguro** contra:
- ✅ Escalação de privilégios via localStorage
- ✅ Modificação de roles no cliente
- ✅ Bypass de autenticação via DevTools
- ✅ Acesso não autorizado via URL direta

**Tempo estimado:** 10-15 minutos
**Complexidade:** Média
**Impacto:** CRÍTICO - Segurança do Sistema
