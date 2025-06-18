-- Remove the trigger that sets payment status automatically
DROP TRIGGER IF EXISTS set_job_payment_status_trigger ON public.jobs;
DROP FUNCTION IF EXISTS public.set_job_payment_status();

-- Remove payment-related columns from jobs table
ALTER TABLE public.jobs DROP COLUMN IF EXISTS payment_status;
ALTER TABLE public.jobs DROP COLUMN IF EXISTS payment_id;

-- Drop the payments table
DROP TABLE IF EXISTS public.payments CASCADE;

-- Drop the payment_status enum type
DROP TYPE IF EXISTS payment_status;

-- Remove the function to check payment exemption
DROP FUNCTION IF EXISTS public.is_exempt_from_payment(text);

-- Revert job status default to 'Ativa' in case it was 'Pendente' due to payment logic
ALTER TABLE public.jobs ALTER COLUMN status SET DEFAULT 'Ativa';

-- Optionally, update any jobs still marked as 'Pendente' (if payment was the only reason)
-- This assumes all non-paid jobs should now be active. Adjust as needed.
UPDATE public.jobs SET status = 'Ativa' WHERE status = 'Pendente';

-- Re-insert some example jobs if the previous migrations were removed or if they were dependent on payment logic and got stuck.
-- This part ensures there are jobs to display after payment removal.
DO $$
DECLARE
    company_id_var uuid;
BEGIN
    -- Try to get an existing company ID, or create one if none exists.
    SELECT id INTO company_id_var FROM public.companies LIMIT 1;
    
    IF company_id_var IS NULL THEN
        -- Create a sample company if no companies exist
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
            'Empresa Modelo S.A.',
            '98.765.432/0001-21',
            'recrutamento@modelo.com',
            '(42) 11111-2222',
            'Avenida Principal, 456',
            'Ponta Grossa',
            'Manufatura',
            'Maria Oliveira',
            gen_random_uuid(),
            'Ativa'
        ) RETURNING id INTO company_id_var;
    END IF;
    
    -- Insert example job 1 if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM public.jobs WHERE title = 'Engenheiro de Produção') THEN
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
            'Engenheiro de Produção',
            'Profissional para otimização de processos de fabricação e gestão de equipes.',
            'Formação em Engenharia de Produção. Experiência em Lean Manufacturing e Seis Sigma.',
            'R$ 6.000 - R$ 9.000',
            'Ponta Grossa',
            'CLT',
            'Presencial',
            'Sênior',
            'Ativa',
            company_id_var,
            ARRAY['Vale Alimentação', 'Plano de Saúde', 'Participação nos Lucros'],
            false,
            NULL,
            NULL
        );
    END IF;
    
    -- Insert example job 2 if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM public.jobs WHERE title = 'Vendedor Interno') THEN
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
            'Vendedor Interno',
            'Atendimento e prospecção de clientes por telefone e e-mail. Elaboração de propostas comerciais.',
            'Experiência prévia em vendas. Boa comunicação e negociação. Conhecimento em CRM.',
            'R$ 2.000 + Comissão',
            'Curitiba',
            'CLT',
            'Presencial',
            'Júnior',
            'Ativa',
            company_id_var,
            ARRAY['Vale Transporte', 'Comissão sobre Vendas'],
            true,
            'Email',
            'vendas@modelo.com'
        );
    END IF;
END $$;