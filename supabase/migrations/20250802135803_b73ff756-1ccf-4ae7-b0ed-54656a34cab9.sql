-- Create enum for ticket status
CREATE TYPE ticket_status AS ENUM ('pago', 'pendente');

-- Create enum for payment methods
CREATE TYPE payment_method AS ENUM ('pix', 'cartao_credito');

-- Create enum for subscription durations
CREATE TYPE subscription_duration AS ENUM ('3', '6', '12');

-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM ('ativo', 'cancelado', 'pendente');

-- Create enum for pendencies types
CREATE TYPE pendency_type AS ENUM ('compra', 'assinatura');

-- Create enum for pendencies status
CREATE TYPE pendency_status AS ENUM ('aberto', 'quitado');

-- Usuarios table
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  celular TEXT NOT NULL UNIQUE,
  aprovado BOOLEAN DEFAULT FALSE,
  cartao_credito_tokenizado TEXT,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT now(),
  device_data JSONB,
  blockchain_registro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  qtd_ingressos INTEGER NOT NULL CHECK (qtd_ingressos >= 1 AND qtd_ingressos <= 100),
  valor_total DECIMAL(10,2) NOT NULL,
  forma_pagamento payment_method NOT NULL,
  status ticket_status DEFAULT 'pendente',
  parcelas INTEGER DEFAULT 1,
  possui_codigo_adm BOOLEAN DEFAULT FALSE,
  codigo_usado TEXT,
  data_compra TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blockchain_registro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Assinaturas table
CREATE TABLE public.assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  quantidade_tickets INTEGER NOT NULL CHECK (quantidade_tickets IN (10, 20, 30, 40, 50)),
  duracao_meses subscription_duration NOT NULL,
  renovacao_automatica BOOLEAN DEFAULT TRUE,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_renovacao TIMESTAMP WITH TIME ZONE,
  status subscription_status DEFAULT 'ativo',
  valor_total DECIMAL(10,2),
  blockchain_registro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Acessos table
CREATE TABLE public.acessos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  data_hora_login TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  gps_coordinates TEXT,
  modelo_aparelho TEXT,
  marca_aparelho TEXT,
  blockchain_registro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Pendencias table (visível apenas para admin)
CREATE TABLE public.pendencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo pendency_type NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_geracao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  vencimento TIMESTAMP WITH TIME ZONE,
  status pendency_status DEFAULT 'aberto',
  visivel_somente_adm BOOLEAN DEFAULT TRUE,
  blockchain_registro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Codigos administrativos table
CREATE TABLE public.codigos_administrativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pendencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigos_administrativos ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = COALESCE(user_email, (SELECT email FROM auth.users WHERE id = auth.uid()))
  );
$$;

-- RLS Policies for usuarios
CREATE POLICY "Usuarios can view own profile" ON public.usuarios
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Usuarios can update own profile" ON public.usuarios
  FOR UPDATE USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admin can view all usuarios" ON public.usuarios
  FOR ALL USING (public.is_admin());

-- RLS Policies for tickets
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (
    usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create own tickets" ON public.tickets
  FOR INSERT WITH CHECK (
    usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admin can view all tickets" ON public.tickets
  FOR ALL USING (public.is_admin());

-- RLS Policies for assinaturas
CREATE POLICY "Users can view own subscriptions" ON public.assinaturas
  FOR SELECT USING (
    usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create own subscriptions" ON public.assinaturas
  FOR INSERT WITH CHECK (
    usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admin can view all subscriptions" ON public.assinaturas
  FOR ALL USING (public.is_admin());

-- RLS Policies for acessos (only admin can see)
CREATE POLICY "Admin can view all access logs" ON public.acessos
  FOR ALL USING (public.is_admin());

-- RLS Policies for pendencias (only admin can see)
CREATE POLICY "Admin can view all pendencies" ON public.pendencias
  FOR ALL USING (public.is_admin());

-- RLS Policies for codigos_administrativos (only admin can see)
CREATE POLICY "Admin can manage admin codes" ON public.codigos_administrativos
  FOR ALL USING (public.is_admin());

-- Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assinaturas_updated_at
    BEFORE UPDATE ON public.assinaturas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial admin codes
INSERT INTO public.codigos_administrativos (codigo, descricao) VALUES 
  ('ADMIN2024', 'Código administrativo padrão'),
  ('ESPECIAL001', 'Condições especiais de pagamento');

-- Create indexes for better performance
CREATE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_usuarios_celular ON public.usuarios(celular);
CREATE INDEX idx_tickets_usuario_id ON public.tickets(usuario_id);
CREATE INDEX idx_assinaturas_usuario_id ON public.assinaturas(usuario_id);
CREATE INDEX idx_acessos_usuario_id ON public.acessos(usuario_id);
CREATE INDEX idx_pendencias_usuario_id ON public.pendencias(usuario_id);