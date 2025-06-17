
-- Primeiro, vamos remover as políticas problemáticas que causam recursão
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can view all resumes" ON storage.objects;

-- Criar função de segurança para verificar role do usuário (evita recursão)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Recriar as políticas usando a função de segurança
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all companies" ON public.companies
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all jobs" ON public.jobs
  FOR ALL USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all applications" ON public.applications
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Corrigir política de storage para admins
CREATE POLICY "Admins can view all resumes" ON storage.objects
  FOR ALL USING (
    bucket_id = 'resumes' AND
    public.get_current_user_role() = 'admin'
  );

-- Corrigir as funções para usar search_path correto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@vagaspg.com' THEN 'admin'::user_role
      ELSE 'company'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.create_application_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (company_id, application_id, message)
  SELECT 
    c.id,
    NEW.id,
    'Nova candidatura para a vaga "' || j.title || '" de ' || NEW.name
  FROM public.jobs j
  JOIN public.companies c ON c.id = j.company_id
  WHERE j.id = NEW.job_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
