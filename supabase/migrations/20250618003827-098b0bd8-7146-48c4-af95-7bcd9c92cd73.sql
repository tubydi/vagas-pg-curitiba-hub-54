
-- Corrigir problema da migração anterior
-- Primeiro remover a coluna problemática e recriar corretamente

-- Remover colunas problemáticas
ALTER TABLE public.jobs DROP COLUMN IF EXISTS payment_status;
ALTER TABLE public.jobs DROP COLUMN IF EXISTS payment_id;

-- Remover tabela payments se existir
DROP TABLE IF EXISTS public.payments CASCADE;

-- Criar enum para status de pagamento
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Recriar tabela payments corretamente
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  job_id UUID REFERENCES public.jobs(id),
  amount DECIMAL(10,2) NOT NULL DEFAULT 11.90,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_id TEXT, -- ID do pagamento do Mercado Pago
  preference_id TEXT, -- ID da preferência do Mercado Pago
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  mercadopago_data JSONB -- Para armazenar dados completos do MP
);

-- Adicionar campos na tabela jobs corretamente
ALTER TABLE public.jobs ADD COLUMN payment_status payment_status DEFAULT 'pending';
ALTER TABLE public.jobs ADD COLUMN payment_id UUID REFERENCES public.payments(id);

-- Habilitar RLS na tabela payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies para payments
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

-- Atualizar vagas existentes para 'approved' se a empresa for vagas@vagas.com
UPDATE public.jobs 
SET payment_status = 'approved' 
WHERE company_id IN (
  SELECT id FROM public.companies WHERE email = 'vagas@vagas.com'
);

-- Função para verificar se empresa é isenta de pagamento
CREATE OR REPLACE FUNCTION public.is_exempt_from_payment(company_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT company_email = 'vagas@vagas.com';
$$;

-- Trigger para definir status de pagamento automaticamente
CREATE OR REPLACE FUNCTION public.set_job_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  company_email TEXT;
BEGIN
  -- Buscar email da empresa
  SELECT email INTO company_email
  FROM public.companies
  WHERE id = NEW.company_id;
  
  -- Se for empresa isenta, aprovar automaticamente
  IF public.is_exempt_from_payment(company_email) THEN
    NEW.payment_status := 'approved';
    NEW.status := 'Ativa';
  ELSE
    NEW.payment_status := 'pending';
    NEW.status := 'Pendente';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remover trigger se existir e recriar
DROP TRIGGER IF EXISTS set_job_payment_status_trigger ON public.jobs;

-- Aplicar trigger nas inserções de jobs
CREATE TRIGGER set_job_payment_status_trigger
  BEFORE INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_job_payment_status();
