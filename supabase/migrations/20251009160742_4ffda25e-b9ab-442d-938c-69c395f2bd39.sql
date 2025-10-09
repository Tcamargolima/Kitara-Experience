-- ============================================
-- CRIAR USUÁRIO ADMIN PADRÃO NO SISTEMA
-- ============================================

-- Inserir admin diretamente na tabela auth.users
-- NOTA: Supabase não permite inserir diretamente em auth.users via SQL
-- Este script configura as tabelas públicas para quando o admin for criado

-- Verificar se já existe role admin
DO $$
DECLARE
  admin_exists boolean;
BEGIN
  -- Criar role admin para qualquer usuário com email admin@moskino.circo que já exista
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@moskino.circo'
  ) INTO admin_exists;
  
  IF admin_exists THEN
    -- Garantir que o admin tenha role correta
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'admin'::public.app_role
    FROM auth.users 
    WHERE email = 'admin@moskino.circo'
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Garantir perfil correto
    INSERT INTO public.profiles (user_id, name, profile, phone_verified, pending_approval)
    SELECT id, 'Administrador', 'admin', true, false
    FROM auth.users 
    WHERE email = 'admin@moskino.circo'
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      profile = 'admin',
      pending_approval = false,
      phone_verified = true;
      
    RAISE NOTICE 'Admin configurado com sucesso!';
  ELSE
    RAISE NOTICE 'ATENÇÃO: Crie o usuário admin manualmente:';
    RAISE NOTICE '1. Vá para: https://supabase.com/dashboard/project/hsesjkiqblfqcehzbnhc/auth/users';
    RAISE NOTICE '2. Clique "Add User" > "Create new user"';
    RAISE NOTICE '3. Email: admin@moskino.circo';
    RAISE NOTICE '4. Password: Circense@0101';
    RAISE NOTICE '5. MARQUE "Auto Confirm User" (importante!)';
    RAISE NOTICE '6. Clique "Create user"';
    RAISE NOTICE '7. Execute esta migração novamente após criar o usuário';
  END IF;
END $$;