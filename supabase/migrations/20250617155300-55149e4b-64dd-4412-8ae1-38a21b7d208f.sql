
-- Criar enum para tipos de contrato
CREATE TYPE contract_type AS ENUM ('CLT', 'PJ', 'Freelancer', 'Estágio');

-- Criar enum para modalidade de trabalho
CREATE TYPE work_mode AS ENUM ('Presencial', 'Remoto', 'Híbrido');

-- Criar enum para nível de experiência
CREATE TYPE experience_level AS ENUM ('Estagiário', 'Júnior', 'Pleno', 'Sênior', 'Especialista');

-- Criar enum para status de vaga
CREATE TYPE job_status AS ENUM ('Ativa', 'Pausada', 'Fechada');

-- Criar enum para status de empresa
CREATE TYPE company_status AS ENUM ('Ativa', 'Pendente', 'Bloqueada');

-- Criar enum para status de candidatura
CREATE TYPE application_status AS ENUM ('Novo', 'Visualizado', 'Contato', 'Rejeitado', 'Aprovado');

-- Criar enum para roles de usuário
CREATE TYPE user_role AS ENUM ('admin', 'company');

-- Tabela de perfis de usuário (para empresas e admin)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'company',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de empresas
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL CHECK (city IN ('Ponta Grossa', 'Curitiba')),
  sector TEXT NOT NULL,
  legal_representative TEXT NOT NULL,
  description TEXT,
  status company_status NOT NULL DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de vagas
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  salary TEXT NOT NULL,
  location TEXT NOT NULL,
  contract_type contract_type NOT NULL,
  work_mode work_mode NOT NULL,
  experience_level experience_level NOT NULL,
  benefits TEXT[], -- Array de benefícios
  status job_status NOT NULL DEFAULT 'Ativa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de candidaturas
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  linkedin TEXT,
  experience_years INTEGER,
  current_position TEXT,
  education TEXT,
  skills TEXT[],
  cover_letter TEXT,
  resume_url TEXT, -- URL do currículo no Supabase Storage
  status application_status NOT NULL DEFAULT 'Novo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para companies
CREATE POLICY "Companies can view their own data" ON public.companies
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Companies can update their own data" ON public.companies
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Companies can insert their own data" ON public.companies
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all companies" ON public.companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para jobs
CREATE POLICY "Anyone can view active jobs" ON public.jobs
  FOR SELECT USING (status = 'Ativa');

CREATE POLICY "Companies can manage their own jobs" ON public.jobs
  FOR ALL USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all jobs" ON public.jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para applications
CREATE POLICY "Companies can view applications for their jobs" ON public.applications
  FOR SELECT USING (
    job_id IN (
      SELECT j.id FROM public.jobs j
      JOIN public.companies c ON c.id = j.company_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update applications for their jobs" ON public.applications
  FOR UPDATE USING (
    job_id IN (
      SELECT j.id FROM public.jobs j
      JOIN public.companies c ON c.id = j.company_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create applications" ON public.applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all applications" ON public.applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para notifications
CREATE POLICY "Companies can view their own notifications" ON public.notifications
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update their own notifications" ON public.notifications
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para criar notificação quando há nova candidatura
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar notificação em nova candidatura
CREATE TRIGGER on_new_application
  AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.create_application_notification();

-- Criar bucket para currículos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false);

-- Política para upload de currículos
CREATE POLICY "Anyone can upload resume" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Companies can view resumes for their job applications" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND
    name IN (
      SELECT SUBSTRING(a.resume_url FROM '[^/]+$')
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      JOIN public.companies c ON c.id = j.company_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all resumes" ON storage.objects
  FOR ALL USING (
    bucket_id = 'resumes' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
