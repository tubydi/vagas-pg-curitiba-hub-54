
-- Verificar e recriar a estrutura completa da tabela jobs se necessário
-- Primeiro, vamos garantir que a tabela jobs existe com todos os campos necessários

-- Criar ou atualizar a tabela jobs com TODOS os campos necessários
CREATE TABLE IF NOT EXISTS public.jobs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    requirements text NOT NULL,
    salary text NOT NULL,
    location text NOT NULL,
    contract_type text NOT NULL,
    work_mode text NOT NULL,
    experience_level text NOT NULL,
    status text NOT NULL DEFAULT 'Ativa',
    company_id uuid NOT NULL,
    benefits text[],
    has_external_application boolean DEFAULT false,
    application_method text,
    contact_info text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Garantir que os campos novos existem (caso a tabela já existia)
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS has_external_application boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS application_method text,
ADD COLUMN IF NOT EXISTS contact_info text;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);

-- Habilitar RLS (Row Level Security) mas permitir leitura pública das vagas ativas
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que QUALQUER PESSOA veja vagas ativas (SEM NECESSIDADE DE LOGIN)
DROP POLICY IF EXISTS "Public can view active jobs" ON public.jobs;
CREATE POLICY "Public can view active jobs" 
ON public.jobs FOR SELECT 
USING (status = 'Ativa');

-- Política para empresas criarem suas próprias vagas (apenas usuários logados)
DROP POLICY IF EXISTS "Companies can insert their own jobs" ON public.jobs;
CREATE POLICY "Companies can insert their own jobs" 
ON public.jobs FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.companies 
        WHERE companies.id = jobs.company_id 
        AND companies.user_id = auth.uid()
    )
);

-- Política para empresas editarem suas próprias vagas
DROP POLICY IF EXISTS "Companies can update their own jobs" ON public.jobs;
CREATE POLICY "Companies can update their own jobs" 
ON public.jobs FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.companies 
        WHERE companies.id = jobs.company_id 
        AND companies.user_id = auth.uid()
    )
);

-- Política para empresas deletarem suas próprias vagas
DROP POLICY IF EXISTS "Companies can delete their own jobs" ON public.jobs;
CREATE POLICY "Companies can delete their own jobs" 
ON public.jobs FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.companies 
        WHERE companies.id = jobs.company_id 
        AND companies.user_id = auth.uid()
    )
);

-- Inserir algumas vagas de exemplo para teste
DO $$
DECLARE
    company_id_var uuid;
BEGIN
    -- Pegar o primeiro ID de empresa disponível
    SELECT id INTO company_id_var FROM public.companies LIMIT 1;
    
    -- Se não existir nenhuma empresa, criar uma de exemplo
    IF company_id_var IS NULL THEN
        INSERT INTO public.companies (
            name, 
            cnpj, 
            email, 
            phone, 
            address, 
            city, 
            sector, 
            legal_representative,
            user_id,
            status
        ) VALUES (
            'Empresa Exemplo LTDA',
            '12.345.678/0001-90',
            'contato@exemplo.com',
            '(42) 3333-4444',
            'Rua Exemplo, 123',
            'Ponta Grossa',
            'Tecnologia',
            'João da Silva',
            gen_random_uuid(),
            'Ativa'
        ) RETURNING id INTO company_id_var;
    END IF;
    
    -- Inserir vaga de exemplo 1 se não existir
    IF NOT EXISTS (SELECT 1 FROM public.jobs WHERE title = 'Desenvolvedor Frontend') THEN
        INSERT INTO public.jobs (
            title, 
            description, 
            requirements, 
            salary, 
            location, 
            contract_type, 
            work_mode, 
            experience_level, 
            status,
            company_id,
            benefits,
            has_external_application,
            application_method,
            contact_info
        ) VALUES (
            'Desenvolvedor Frontend',
            'Desenvolvimento de interfaces modernas com React e TypeScript. Trabalhar em equipe colaborativa criando soluções inovadoras.',
            'Experiência com React, TypeScript, HTML, CSS. Conhecimento em Git e metodologias ágeis.',
            'R$ 4.000 - R$ 7.000',
            'Ponta Grossa',
            'CLT',
            'Híbrido',
            'Pleno',
            'Ativa',
            company_id_var,
            ARRAY['Vale Refeição', 'Plano de Saúde', 'Home Office'],
            true,
            'WhatsApp',
            '(42) 99999-9999'
        );
    END IF;
    
    -- Inserir vaga de exemplo 2 se não existir
    IF NOT EXISTS (SELECT 1 FROM public.jobs WHERE title = 'Analista de Marketing') THEN
        INSERT INTO public.jobs (
            title, 
            description, 
            requirements, 
            salary, 
            location, 
            contract_type, 
            work_mode, 
            experience_level, 
            status,
            company_id,
            benefits,
            has_external_application,
            application_method,
            contact_info
        ) VALUES (
            'Analista de Marketing',
            'Criação e execução de estratégias de marketing digital. Gestão de redes sociais e campanhas online.',
            'Formação em Marketing ou áreas relacionadas. Experiência com redes sociais e Google Ads.',
            'R$ 3.500 - R$ 5.500',
            'Curitiba',
            'CLT',
            'Presencial',
            'Júnior',
            'Ativa',
            company_id_var,
            ARRAY['Vale Transporte', 'Vale Alimentação', 'Convênio Médico'],
            true,
            'Email',
            'rh@empresa.com'
        );
    END IF;
END $$;
