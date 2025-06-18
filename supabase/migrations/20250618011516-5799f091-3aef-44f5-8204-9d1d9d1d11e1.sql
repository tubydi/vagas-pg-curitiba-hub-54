
-- Corrigir funções com search_path para evitar warnings de segurança

-- Atualizar função is_exempt_from_payment
CREATE OR REPLACE FUNCTION public.is_exempt_from_payment(company_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT company_email = 'vagas@vagas.com';
$$;

-- Atualizar função set_job_payment_status
CREATE OR REPLACE FUNCTION public.set_job_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Atualizar função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'company');
  RETURN NEW;
END;
$$;
