
-- Inserir admin existente na tabela user_profiles
INSERT INTO public.user_profiles (id, email, display_name, mfa_enabled)
SELECT id, email, 'Admin KITARA', false
FROM public.profiles
WHERE id = '2cc77288-7313-412a-9947-d6fcd50bc56b'
ON CONFLICT (id) DO NOTHING;
