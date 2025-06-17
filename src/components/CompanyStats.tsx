
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, UserCheck, TrendingUp, Eye, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CompanyStatsProps {
  companyId: string;
}

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  viewedApplications: number;
  approvedApplications: number;
}

const CompanyStats: React.FC<CompanyStatsProps> = ({ companyId }) => {
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    viewedApplications: 0,
    approvedApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [companyId]);

  const fetchStats = async () => {
    try {
      // Buscar estatísticas de vagas
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, status')
        .eq('company_id', companyId);

      if (jobsError) throw jobsError;

      const totalJobs = jobs?.length || 0;
      const activeJobs = jobs?.filter(job => job.status === 'Ativa').length || 0;

      // Buscar estatísticas de candidaturas
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select('id, status, job_id')
        .in('job_id', jobs?.map(job => job.id) || []);

      if (applicationsError) throw applicationsError;

      const totalApplications = applications?.length || 0;
      const newApplications = applications?.filter(app => app.status === 'Novo').length || 0;
      const viewedApplications = applications?.filter(app => app.status === 'Visualizado').length || 0;
      const approvedApplications = applications?.filter(app => app.status === 'Aprovado').length || 0;

      setStats({
        totalJobs,
        activeJobs,
        totalApplications,
        newApplications,
        viewedApplications,
        approvedApplications,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Vagas',
      value: stats.totalJobs,
      description: 'Vagas criadas',
      icon: Briefcase,
      color: 'bg-blue-500',
    },
    {
      title: 'Vagas Ativas',
      value: stats.activeJobs,
      description: 'Recebendo candidaturas',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Total de Candidaturas',
      value: stats.totalApplications,
      description: 'Em todas as vagas',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Novas Candidaturas',
      value: stats.newApplications,
      description: 'Aguardando revisão',
      icon: MessageSquare,
      color: 'bg-yellow-500',
    },
    {
      title: 'Candidaturas Visualizadas',
      value: stats.viewedApplications,
      description: 'Em análise',
      icon: Eye,
      color: 'bg-orange-500',
    },
    {
      title: 'Candidaturas Aprovadas',
      value: stats.approvedApplications,
      description: 'Candidatos selecionados',
      icon: UserCheck,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CompanyStats;
