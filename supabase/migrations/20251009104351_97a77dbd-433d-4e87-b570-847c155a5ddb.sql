-- ============================================
-- CRIAR USUÁRIO ADMIN PADRÃO
-- ============================================

-- Criar usuário admin no auth.users (isso será feito via Supabase Dashboard)
-- Depois da criação manual, atribuir role admin:

-- NOTA: Este script assume que você criou manualmente o usuário com email 'admin@moskino.circo'
-- através do Supabase Dashboard > Authentication > Users > Add User

-- Função para criar admin se não existir
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Verificar se usuário admin já existe
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@moskino.circo';
  
  -- Se não existir, precisamos criar através da interface do Supabase
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'ATENÇÃO: Usuário admin não encontrado. Crie manualmente no Supabase Dashboard:';
    RAISE NOTICE '1. Vá em Authentication > Users';
    RAISE NOTICE '2. Clique em "Add User"';
    RAISE NOTICE '3. Email: admin@moskino.circo';
    RAISE NOTICE '4. Senha: Circense@0101';
    RAISE NOTICE '5. Desmarque "Auto Confirm User" para confirmar automaticamente';
  ELSE
    -- Se existir, garantir que tem role admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Criar perfil se não existir
    INSERT INTO public.profiles (user_id, name, profile, phone_verified, pending_approval)
    VALUES (admin_user_id, 'Administrador', 'admin', true, false)
    ON CONFLICT (user_id) DO UPDATE
    SET profile = 'admin',
        pending_approval = false;
        
    RAISE NOTICE 'Usuário admin configurado com sucesso!';
  END IF;
END $$;