
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

  const createCompany = async (userEmail: string) => {
    if (!userId) {
      console.error('Sem userId para criar empresa');
      return false;
    }

    console.log('Criando empresa para:', userEmail, 'userId:', userId);
    
    try {
      const isAdmin = userEmail === 'admin@vagaspg.com';
      
      const companyData = {
        user_id: userId,
        name: isAdmin ? 'VAGAS PG - Administração' : 'Nova Empresa',
        cnpj: '00.000.000/0000-00',
        email: userEmail,
        phone: '(42) 0000-0000',
        address: 'Endereço a ser preenchido',
        city: 'Ponta Grossa',
        sector: 'Tecnologia',
        legal_representative: 'Representante Legal',
        description: isAdmin ? 'Empresa administrativa' : 'Complete os dados da empresa',
        status: 'Ativa' as const
      };

      console.log('Dados da empresa:', companyData);

      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar empresa:', createError);
        toast({
          title: "Erro ao criar empresa",
          description: createError.message,
          variant: "destructive",
        });
        return false;
      }

      console.log('Empresa criada:', newCompany);
      setCompany(newCompany);
      
      toast({
        title: "Empresa criada!",
        description: "Complete os dados no perfil.",
      });

      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Falha ao criar empresa",
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchData = async (userEmail?: string) => {
    if (!userId) {
      console.log('Sem userId');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Buscando empresa para userId:', userId);
      
      // Buscar empresa
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (companyError) {
        console.error('Erro ao buscar empresa:', companyError);
        setError('Erro ao buscar empresa');
        return;
      }

      if (!companyData && userEmail) {
        console.log('Empresa não encontrada, criando...');
        await createCompany(userEmail);
        return;
      }

      if (companyData) {
        console.log('Empresa encontrada:', companyData);
        setCompany(companyData);

        // Buscar vagas
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', companyData.id)
          .order('created_at', { ascending: false });

        if (jobsError) {
          console.error('Erro ao buscar vagas:', jobsError);
          setJobs([]);
        } else {
          console.log('Vagas encontradas:', jobsData?.length || 0);
          setJobs(jobsData || []);
        }
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setError('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = (userEmail?: string) => {
    console.log('Atualizando dados para:', userEmail);
    fetchData(userEmail);
  };

  useEffect(() => {
    if (userId) {
      console.log('UserId mudou, buscando dados');
      fetchData();
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
