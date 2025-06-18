
-- Limpar tudo e reconstruir o banco corretamente
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE; 
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Limpar tipos antigos
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS contract_type CASCADE;
DROP TYPE IF EXISTS work_mode CASCADE;
DROP TYPE IF EXISTS experience_level CASCADE;
DROP TYPE IF EXISTS company_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Limpar funções
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.create_application_notification() CASCADE;
DROP FUNCTION IF EXISTS public.is_exempt_from_payment() CASCADE;
DROP FUNCTION IF EXISTS public.set_job_payment_status() CASCADE;

-- Recriar tipos essenciais
CREATE TYPE user_role AS ENUM ('admin', 'company');
CREATE TYPE company_status AS ENUM ('Ativa', 'Pendente', 'Bloqueada');
CREATE TYPE job_status AS ENUM ('Ativa', 'Pausada', 'Finalizada');
CREATE TYPE contract_type AS ENUM ('CLT', 'PJ', 'Freelancer', 'Estágio');
CREATE TYPE work_mode AS ENUM ('Presencial', 'Remoto', 'Híbrido');
CREATE TYPE experience_level AS ENUM ('Estagiário', 'Júnior', 'Pleno', 'Sênior', 'Especialista');
CREATE TYPE application_status AS ENUM ('Novo', 'Visualizado', 'Contato', 'Aprovado', 'Rejeitado');

-- Tabela de perfis (simples e funcional)
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'company',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabela de empresas (sem complicação)
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  cnpj text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  sector text NOT NULL,
  legal_representative text NOT NULL,
  description text,
  status company_status NOT NULL DEFAULT 'Ativa',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(cnpj),
  UNIQUE(user_id)
);

-- Tabela de vagas (sem pagamento)
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  requirements text NOT NULL,
  salary text NOT NULL,
  location text NOT NULL,
  contract_type contract_type NOT NULL,
  work_mode work_mode NOT NULL,
  experience_level experience_level NOT NULL,
  benefits text[],
  status job_status NOT NULL DEFAULT 'Ativa',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabela de candidaturas
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  linkedin text,
  experience_years integer,
  current_position text,
  education text,
  skills text[],
  cover_letter text,
  resume_url text,
  status application_status NOT NULL DEFAULT 'Novo',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabela de notificações
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Função para criar perfil automaticamente
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
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Erro ao criar profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para verificar role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(role::text, 'company') FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies liberais para funcionar
CREATE POLICY "Acesso completo profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Acesso completo companies" ON public.companies FOR ALL USING (true);
CREATE POLICY "Acesso completo jobs" ON public.jobs FOR ALL USING (true);
CREATE POLICY "Acesso completo applications" ON public.applications FOR ALL USING (true);
CREATE POLICY "Acesso completo notifications" ON public.notifications FOR ALL USING (true);
