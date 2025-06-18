
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Company = Database['public']['Tables']['companies']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];

export const useCompanyData = (userId: string | undefined) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const createMissingCompany = async (userEmail: string) => {
    if (!userId) {
      console.error('No userId provided for company creation');
      return false;
    }

    console.log('Creating company for user:', userEmail, 'with userId:', userId);
    
    try {
      const isAdminUser = userEmail === 'admin@vagaspg.com' || userEmail === 'vagas@vagas.com';
      
      const companyData = {
        user_id: userId,
        name: isAdminUser ? 'VAGAS PG - Administração' : 'Empresa Criada Automaticamente',
        cnpj: isAdminUser ? '00.000.000/0000-00' : `99.${Math.floor(Math.random() * 1000)}.${Math.floor(Math.random() * 1000)}/0001-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
        email: userEmail,
        phone: '(42) 0000-0000',
        address: 'Endereço a ser preenchido',
        city: 'Ponta Grossa',
        sector: 'Administração',
        legal_representative: 'Representante Legal',
        description: isAdminUser ? 'Empresa administrativa do sistema' : 'Empresa criada automaticamente',
        status: 'Ativa' as const
      };

      console.log('Inserting company data:', companyData);

      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (createError) {
        console.error('Error creating company:', createError);
        toast({
          title: "Erro ao criar empresa",
          description: `Falha na criação: ${createError.message}`,
          variant: "destructive",
        });
        return false;
      }

      if (!newCompany) {
        console.error('Company created but no data returned');
        toast({
          title: "Erro ao criar empresa",
          description: "Dados da empresa não foram retornados",
          variant: "destructive",
        });
        return false;
      }

      console.log('Company created successfully:', newCompany);
      setCompany(newCompany);
      
      toast({
        title: "✅ Empresa criada com sucesso!",
        description: "Sua empresa está pronta para publicar vagas!",
      });

      return true;
    } catch (error) {
      console.error('Unexpected error creating company:', error);
      toast({
        title: "Erro inesperado",
        description: "Falha ao criar empresa. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchCompanyAndJobs = async (userEmail?: string) => {
    if (!userId) {
      console.log('No userId provided, skipping fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching company for user_id:', userId);
      
      // Fetch company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (companyError) {
        console.error('Error fetching company:', companyError);
        setError('Erro ao buscar empresa');
        toast({
          title: "Erro",
          description: `Erro ao buscar empresa: ${companyError.message}`,
          variant: "destructive",
        });
        return;
      }

      if (!companyData && userEmail) {
        console.log('Company not found, creating automatically...');
        const created = await createMissingCompany(userEmail);
        if (!created) {
          setError('Não foi possível criar sua empresa');
        }
        return;
      }

      if (companyData) {
        console.log('Company found:', companyData);
        setCompany(companyData);

        // Fetch jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', companyData.id)
          .order('created_at', { ascending: false });

        if (jobsError) {
          console.error('Error fetching jobs:', jobsError);
          toast({
            title: "Aviso",
            description: "Erro ao carregar vagas, mas empresa carregada com sucesso",
            variant: "destructive",
          });
          setJobs([]);
        } else {
          console.log('Jobs found:', jobsData?.length || 0);
          setJobs(jobsData || []);
        }
      } else {
        console.log('No company data and no email provided');
        setError('Empresa não encontrada');
      }
    } catch (error) {
      console.error('Unexpected error fetching data:', error);
      setError('Erro inesperado ao carregar dados');
      toast({
        title: "Erro inesperado",
        description: "Falha ao carregar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = (userEmail?: string) => {
    console.log('Refreshing data for user:', userEmail);
    fetchCompanyAndJobs(userEmail);
  };

  // Auto-fetch on userId change
  useEffect(() => {
    if (userId) {
      console.log('UserId changed, auto-fetching company data');
      fetchCompanyAndJobs();
    }
  }, [userId]);

  return {
    company,
    jobs,
    loading,
    error,
    refreshData,
    setCompany,
    setJobs
  };
};
