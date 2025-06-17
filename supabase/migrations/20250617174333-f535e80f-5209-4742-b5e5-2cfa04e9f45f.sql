
-- Remover o trigger problemático que está causando erros
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar a função handle_new_user de forma mais simples
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Desabilitar RLS temporariamente nas tabelas para permitir inserções manuais
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;

-- Criar função mais simples para verificar role de usuário
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.profiles WHERE id = auth.uid()),
    'company'
  );
$$;

-- Garantir que o bucket de currículos existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes', 
  true,
  10485760,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Remover policies existentes e recriar
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- Criar policies para o bucket de currículos
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'resumes');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'resumes');
