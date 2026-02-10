

# Corrigir Login: Tela Presa no Auth Apos Login Bem-Sucedido

## Diagnostico

Foram identificadas **2 causas raiz** para o problema:

### Causa 1: Perfil do usuario nao existe na tabela correta
- A funcao RPC `get_my_profile` consulta a tabela `user_profiles`
- Porem, o usuario admin existe apenas na tabela `profiles` (tabela diferente)
- A tabela `user_profiles` esta **vazia** -- nenhum registro
- Resultado: `get_my_profile` sempre retorna `null`
- Quando o perfil e null, o hook `useSecureAuth` entra em loop: define "authenticated" no `signIn`, mas ao re-montar o componente, `determineAuthStep` recebe profile=null e volta para "login"

### Causa 2: RPC `log_security_event` falha com erro 400
- A tabela `security_events` tem duas colunas: `type` e `event_type`
- A RPC insere dados na coluna `type`, mas a coluna `event_type` e NOT NULL e nao tem valor padrao
- Resultado: toda tentativa de log falha com: `null value in column "event_type" violates not-null constraint`
- Isso nao bloqueia o login diretamente, mas gera erros no console

### Nota: Os erros de CORS
Os erros de CORS com `lovable.dev/auth-bridge` e `manifest.json` sao da infraestrutura de preview do Lovable e **nao afetam** o funcionamento do app. Podem ser ignorados.

---

## Plano de Correcao

### Passo 1: Migrar dados do admin para `user_profiles`
Inserir o usuario admin na tabela `user_profiles` para que o RPC `get_my_profile` funcione:

```sql
INSERT INTO public.user_profiles (id, email, display_name, mfa_enabled)
SELECT id, email, 'Admin KITARA', false
FROM public.profiles
WHERE id = '2cc77288-7313-412a-9947-d6fcd50bc56b'
ON CONFLICT (id) DO NOTHING;
```

### Passo 2: Corrigir a tabela `security_events`
Tornar a coluna `event_type` nullable ou remover (ja que a RPC usa `type`):

```sql
ALTER TABLE public.security_events ALTER COLUMN event_type DROP NOT NULL;
```

### Passo 3: Adicionar resiliencia no frontend
Atualizar `useSecureAuth.ts` para tratar o caso em que o perfil e null apos login bem-sucedido. Se o usuario tem sessao valida mas perfil null, deve ir para "authenticated" em vez de voltar para "login" no `determineAuthStep`:

- No metodo `determineAuthStep`: se session existe mas profile e null, retornar `"mfa_setup"` em vez de `"login"` (ou "authenticated" se for initial load)
- Isso evita que o loop aconteca mesmo quando o perfil ainda nao foi criado

### Passo 4: Garantir trigger de criacao automatica de perfil
Criar um trigger no banco que insere automaticamente um registro em `user_profiles` quando um novo usuario se registra no Supabase Auth, para evitar que esse problema ocorra com novos usuarios.

---

## Detalhes Tecnicos

### Arquivos a modificar:
- `src/hooks/useSecureAuth.ts` -- ajustar `determineAuthStep` para resiliencia com profile null

### Migracoes SQL necessarias:
1. INSERT na `user_profiles` para o admin existente
2. ALTER TABLE `security_events` para corrigir NOT NULL em `event_type`
3. CREATE TRIGGER para auto-criar perfil em `user_profiles` no signup

### Regras mantidas:
- Zero `supabase.from()` -- tudo via RPC
- Seguranca MFA preservada
- Identidade KITARA inalterada

