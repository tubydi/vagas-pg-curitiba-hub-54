
-- Habilitar RLS para todas as tabelas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Limpar todas as políticas existentes
DROP POLICY IF EXISTS "Companies can view their own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can create their own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can update their own data" ON public.companies;
DROP POLICY IF EXISTS "Jobs public read access" ON public.jobs;
DROP POLICY IF EXISTS "Companies can manage their jobs" ON public.jobs;
DROP POLICY IF EXISTS "Applications public read access" ON public.applications;
DROP POLICY IF EXISTS "Applications create access" ON public.applications;
DROP POLICY IF EXISTS "Companies can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Companies can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Companies can view notifications" ON public.notifications;

-- Políticas para companies
CREATE POLICY "Companies can view their own data" 
  ON public.companies 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Companies can create their own data" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Companies can update their own data" 
  ON public.companies 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Políticas para jobs (acesso público para leitura, empresas podem gerenciar)
CREATE POLICY "Jobs public read access" 
  ON public.jobs 
  FOR SELECT 
  USING (true);

CREATE POLICY "Companies can manage their jobs" 
  ON public.jobs 
  FOR ALL 
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- Políticas para applications
CREATE POLICY "Applications public read access" 
  ON public.applications 
  FOR SELECT 
  USING (true);

CREATE POLICY "Applications create access" 
  ON public.applications 
  FOR INSERT 
  WITH CHECK (true);

-- Políticas para notifications
CREATE POLICY "Companies can view notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- Recriar políticas para payments
CREATE POLICY "Companies can view their own payments" 
  ON public.payments 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can create their own payments" 
  ON public.payments 
  FOR INSERT 
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- Criar empresa para o usuário de teste se não existir
INSERT INTO public.companies (
  user_id,
  name,
  cnpj,
  email,
  phone,
  address,
  city,
  sector,
  legal_representative,
  description,
  status
) 
SELECT 
  'eeaae0c0-1f5f-4131-9c27-8b15bd610311'::uuid,
  'Empresa Teste',
  '00.000.000/0001-00',
  'davidregis.liberato@icloud.com',
  '(42) 99999-9999',
  'Rua Teste, 123',
  'Ponta Grossa',
  'Tecnologia',
  'David Regis',
  'Empresa de teste para desenvolvimento',
  'Ativa'
WHERE NOT EXISTS (
  SELECT 1 FROM public.companies 
  WHERE user_id = 'eeaae0c0-1f5f-4131-9c27-8b15bd610311'::uuid
);
