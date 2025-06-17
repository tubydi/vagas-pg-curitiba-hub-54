
-- Criar enum types que podem estar faltando
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'company');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE company_status AS ENUM ('Pendente', 'Aprovada', 'Rejeitada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('Novo', 'Visualizado', 'Contato', 'Aprovado', 'Rejeitado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('Ativa', 'Pausada', 'Finalizada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contract_type AS ENUM ('CLT', 'PJ', 'Freelancer', 'Estágio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE work_mode AS ENUM ('Presencial', 'Remoto', 'Híbrido');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE experience_level AS ENUM ('Júnior', 'Pleno', 'Sênior');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Corrigir função handle_new_user
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
  -- Log do erro mas não falha o cadastro
  RAISE WARNING 'Erro ao criar profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Corrigir função get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Criar bucket de resumes se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Policies para storage
DROP POLICY IF EXISTS "Anyone can upload to resumes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view resumes" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects
  FOR ALL USING (bucket_id = 'resumes');

-- Policies para RLS nas tabelas principais
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies básicas para funcionamento
DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;
CREATE POLICY "Public profiles access" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Public companies access" ON public.companies;
CREATE POLICY "Public companies access" ON public.companies FOR ALL USING (true);

DROP POLICY IF EXISTS "Public jobs access" ON public.jobs;
CREATE POLICY "Public jobs access" ON public.jobs FOR ALL USING (true);

DROP POLICY IF EXISTS "Public applications access" ON public.applications;
CREATE POLICY "Public applications access" ON public.applications FOR ALL USING (true);

DROP POLICY IF EXISTS "Public notifications access" ON public.notifications;
CREATE POLICY "Public notifications access" ON public.notifications FOR ALL USING (true);
