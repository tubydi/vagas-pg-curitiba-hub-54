
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
    if (!userId) return false;

    console.log('Creating company for user:', userEmail);
    
    try {
      const isAdminUser = userEmail === 'admin@vagaspg.com' || userEmail === 'vagas@vagas.com';
      
      const companyData = {
        user_id: userId,
        name: isAdminUser ? 'VAGAS PG - Administração' : 'Empresa Criada Automaticamente',
        cnpj: isAdminUser ? '00.000.000/0000-00' : '99.999.999/9999-99',
        email: userEmail,
        phone: '(42) 0000-0000',
        address: 'Endereço a ser preenchido',
        city: 'Ponta Grossa',
        sector: 'Administração',
        legal_representative: 'Representante Legal',
        description: isAdminUser ? 'Empresa administrativa do sistema' : 'Empresa criada automaticamente',
        status: 'Ativa' as const
      };

      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (createError) {
        console.error('Error creating company:', createError);
        return false;
      }

      console.log('Company created successfully:', newCompany);
      setCompany(newCompany);
      
      toast({
        title: "Empresa criada com sucesso!",
        description: "Sua empresa está pronta para publicar vagas!",
      });

      return true;
    } catch (error) {
      console.error('Error creating company:', error);
      return false;
    }
  };

  const fetchCompanyAndJobs = async (userEmail?: string) => {
    if (!userId) return;
    
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
          setJobs([]);
        } else {
          console.log('Jobs found:', jobsData?.length || 0);
          setJobs(jobsData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = (userEmail?: string) => {
    fetchCompanyAndJobs(userEmail);
  };

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
