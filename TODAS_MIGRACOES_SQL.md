# 🔒 TODAS AS MIGRAÇÕES SQL - EXECUTAR NO SUPABASE

## ⚠️ INSTRUÇÕES IMPORTANTES

1. **Acesse o Supabase Dashboard** do seu projeto
2. **Vá em SQL Editor**
3. **Execute CADA migração abaixo NA ORDEM** (copie e cole uma por vez)
4. **Após executar TODAS**, rode no terminal: `npx supabase db pull`

---

## 📋 MIGRAÇÃO 1: Sistema de Roles Seguro

```sql
-- ============================================
-- MIGRAÇÃO 1: SISTEMA DE ROLES SEGURO
-- ============================================

-- 1. Criar enum para roles
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'cliente', 'pendente');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Criar tabela user_roles com RLS
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'pendente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Criar função has_role com SECURITY DEFINER (previne recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Criar função get_user_role (helper)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 5. Políticas RLS para user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Trigger para atribuir role 'pendente' a novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'pendente')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- 7. Migrar dados existentes de profiles.profile para user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  CASE 
    WHEN profile = 'admin' THEN 'admin'::app_role
    WHEN profile = 'cliente' THEN 'cliente'::app_role
    ELSE 'pendente'::app_role
  END
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. Atualizar políticas RLS da tabela profiles para usar has_role()
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 9. Criar admin padrão (se não existir)
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Criar usuário admin via auth (você precisará fazer signup manual com este email primeiro)
  -- Email: admin@moskino.circo
  -- Senha: Circense@0101
  
  -- Buscar o ID do usuário admin
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@moskino.circo'
  LIMIT 1;
  
  -- Se encontrou, garantir que tem role de admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- ✅ MIGRAÇÃO 1 COMPLETA
```

---

## 📋 MIGRAÇÃO 2: Sistema de Aprovação de Usuários

```sql
-- ============================================
-- MIGRAÇÃO 2: SISTEMA DE APROVAÇÃO DE USUÁRIOS
-- ============================================

-- 1. Criar tabela de histórico de aprovações
CREATE TABLE IF NOT EXISTS public.user_approval_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('approved', 'rejected', 'blocked')),
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_approval_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Admins can view all approval history" ON public.user_approval_history;
CREATE POLICY "Admins can view all approval history"
  ON public.user_approval_history
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert approval history" ON public.user_approval_history;
CREATE POLICY "Admins can insert approval history"
  ON public.user_approval_history
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Função para aprovar usuário
CREATE OR REPLACE FUNCTION public.approve_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se quem está executando é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve users';
  END IF;

  -- Remover role pendente
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role = 'pendente';

  -- Adicionar role cliente
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'cliente')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Registrar no histórico
  INSERT INTO public.user_approval_history (user_id, admin_id, action)
  VALUES (target_user_id, auth.uid(), 'approved');
END;
$$;

-- 3. Função para rejeitar usuário
CREATE OR REPLACE FUNCTION public.reject_user(target_user_id uuid, rejection_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se quem está executando é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can reject users';
  END IF;

  -- Remover todas as roles
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id;

  -- Registrar no histórico
  INSERT INTO public.user_approval_history (user_id, admin_id, action, reason)
  VALUES (target_user_id, auth.uid(), 'rejected', rejection_reason);

  -- Deletar usuário do auth (opcional, comentado por segurança)
  -- DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- 4. Função para bloquear usuário
CREATE OR REPLACE FUNCTION public.block_user(target_user_id uuid, block_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se quem está executando é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can block users';
  END IF;

  -- Não pode bloquear outro admin
  IF public.has_role(target_user_id, 'admin') THEN
    RAISE EXCEPTION 'Cannot block admin users';
  END IF;

  -- Remover role de cliente (se tiver)
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role = 'cliente';

  -- Adicionar role pendente (efetivamente bloqueia)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'pendente')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Registrar no histórico
  INSERT INTO public.user_approval_history (user_id, admin_id, action, reason)
  VALUES (target_user_id, auth.uid(), 'blocked', block_reason);
END;
$$;

-- 5. Trigger para notificar admin sobre novo cadastro (chama edge function)
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Buscar dados do profile
  SELECT name, phone INTO profile_record
  FROM public.profiles
  WHERE id = NEW.id;

  -- Chamar edge function para enviar email
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notification-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'new_signup',
      'user_email', NEW.email,
      'user_name', COALESCE(profile_record.name, 'Novo usuário')
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Não bloquear signup se email falhar
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_user_notify_admin ON auth.users;
CREATE TRIGGER on_new_user_notify_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_user();

-- 6. Trigger para notificar usuário sobre aprovação/rejeição
CREATE OR REPLACE FUNCTION public.notify_user_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  user_name text;
  notification_type text;
BEGIN
  -- Buscar email e nome do usuário
  SELECT u.email, p.name INTO user_email, user_name
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = NEW.user_id;

  -- Determinar tipo de notificação
  notification_type := CASE NEW.action
    WHEN 'approved' THEN 'approval'
    WHEN 'rejected' THEN 'rejection'
    ELSE NULL
  END;

  IF notification_type IS NOT NULL THEN
    -- Chamar edge function
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notification-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'type', notification_type,
        'user_email', user_email,
        'user_name', COALESCE(user_name, 'Usuário')
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_approval_notify_user ON public.user_approval_history;
CREATE TRIGGER on_approval_notify_user
  AFTER INSERT ON public.user_approval_history
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_on_approval();

-- ✅ MIGRAÇÃO 2 COMPLETA
```

---

## 📋 MIGRAÇÃO 3: Realtime para user_roles

```sql
-- ============================================
-- MIGRAÇÃO 3: HABILITAR REALTIME
-- ============================================

-- Habilitar replica identity para capturar dados completos em updates
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER TABLE public.user_approval_history REPLICA IDENTITY FULL;

-- Adicionar tabelas ao publication do Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_approval_history;

-- ✅ MIGRAÇÃO 3 COMPLETA
```

---

## ✅ CHECKLIST PÓS-MIGRAÇÃO

Após executar TODAS as migrações:

1. ✅ Execute no terminal: `npx supabase db pull`
2. ✅ Crie o primeiro admin manualmente:
   - Faça signup no app com: `admin@moskino.circo` / `Circense@0101`
   - Ou execute no SQL Editor:
   ```sql
   -- Depois de criar o usuário via signup, rode:
   INSERT INTO public.user_roles (user_id, role)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@moskino.circo'),
     'admin'
   )
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

3. ✅ Configure os secrets no Supabase:
   - `RESEND_API_KEY`: Sua chave da Resend (https://resend.com/api-keys)
   - `ADMIN_EMAIL`: Email do admin para receber notificações
   - `APP_URL`: URL do seu app (ex: https://moskino.lovable.app)

4. ✅ Teste o fluxo:
   - Cadastre um novo usuário
   - Verifique se admin recebe notificação
   - Aprove o usuário no dashboard
   - Verifique se usuário recebe email de aprovação

---

## 🔒 SEGURANÇA IMPLEMENTADA

✅ **Roles em tabela separada** (previne escalação de privilégios)  
✅ **Função `has_role()` com SECURITY DEFINER** (previne recursão RLS)  
✅ **RLS habilitado em todas as tabelas**  
✅ **Políticas seguras** (apenas admins podem modificar roles)  
✅ **Triggers automáticos** (novos usuários = pendente)  
✅ **Histórico de auditoria** (todas as ações de aprovação registradas)  
✅ **Notificações por email** (admin e usuários)  

---

## 📧 PRÓXIMO PASSO: CONFIGURAR RESEND

1. Crie conta em https://resend.com
2. Valide seu domínio em https://resend.com/domains
3. Crie API key em https://resend.com/api-keys
4. Adicione os secrets no Supabase Dashboard > Project Settings > Edge Functions
