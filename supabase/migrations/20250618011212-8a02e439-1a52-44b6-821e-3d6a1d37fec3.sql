
-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'company',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Limpar políticas existentes para profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read for admin check" ON public.profiles;

-- Permitir leitura pública para verificação de admin (necessário para o AuthContext)
CREATE POLICY "Allow public read for admin check" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Permitir que usuários vejam e atualizem seu próprio perfil
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR ALL 
  USING (auth.uid() = id);

-- Atualizar função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'company');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Inserir perfil para usuário de teste se não existir
INSERT INTO public.profiles (id, email, role)
SELECT 
  'eeaae0c0-1f5f-4131-9c27-8b15bd610311'::uuid,
  'davidregis.liberato@icloud.com',
  'company'::user_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = 'eeaae0c0-1f5f-4131-9c27-8b15bd610311'::uuid
);

-- Corrigir políticas de companies
DROP POLICY IF EXISTS "Companies can view their own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can create their own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can update their own data" ON public.companies;

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

-- Atualizar status da empresa de teste para Ativa
UPDATE public.companies 
SET status = 'Ativa'::company_status 
WHERE user_id = 'eeaae0c0-1f5f-4131-9c27-8b15bd610311'::uuid;
