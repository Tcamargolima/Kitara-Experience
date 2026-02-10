
-- Apenas corrigir event_type caso não tenha sido aplicado
ALTER TABLE public.security_events ALTER COLUMN event_type DROP NOT NULL;
