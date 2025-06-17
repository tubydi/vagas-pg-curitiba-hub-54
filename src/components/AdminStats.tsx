
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Briefcase, Users, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";

interface AdminStatsProps {
  onViewApplications: () => void;
  onViewCompanies: () => void;
}

const AdminStats = ({ onViewApplications, onViewCompanies }: AdminStatsProps) => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    pendingCompanies: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0
  });

  const fetchAdminStats = async () => {
    try {
      // Buscar estatísticas de empresas
      const { data: companies } = await supabase
        .from('companies')
        .select('status');
      
      const totalCompanies = companies?.length || 0;
      const activeCompanies = companies?.filter(c => c.status === 'Ativa').length || 0;
      const pendingCompanies = companies?.filter(c => c.status === 'Pendente').length || 0;

      // Buscar estatísticas de vagas
      const { data: jobs } = await supabase
        .from('jobs')
        .select('status');
      
      const totalJobs = jobs?.length || 0;
      const activeJobs = jobs?.filter(j => j.status === 'Ativa').length || 0;

      // Buscar estatísticas de candidaturas
      const { data: applications } = await supabase
        .from('applications')
        .select('status, created_at');
      
      const totalApplications = applications?.length || 0;
      const newApplications = applications?.filter(a => a.status === 'Novo').length || 0;

      setStats({
        totalCompanies,
        activeCompanies,
        pendingCompanies,
        totalJobs,
        activeJobs,
        totalApplications,
        newApplications
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas admin:', error);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 rounded-3xl shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-3xl">
            <CardTitle className="text-lg font-bold flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Empresas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">{stats.totalCompanies}</div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Ativas: {stats.activeCompanies}</span>
                <span className="text-yellow-600">Pendentes: {stats.pendingCompanies}</span>
              </div>
              <Button 
                onClick={onViewCompanies}
                className="w-full mt-4 bg-blue-500 hover:bg-blue-600"
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Gerenciar Empresas
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-3xl shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl">
            <CardTitle className="text-lg font-bold flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Vagas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">{stats.totalJobs}</div>
              <div className="text-sm text-gray-600">Ativas: {stats.activeJobs}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-3xl shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-3xl">
            <CardTitle className="text-lg font-bold flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Candidaturas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">{stats.totalApplications}</div>
              <div className="text-sm text-red-600">Novas: {stats.newApplications}</div>
              <Button 
                onClick={onViewApplications}
                className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Candidaturas
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-3xl shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-3xl">
            <CardTitle className="text-lg font-bold">
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm">Sistema Online</span>
              </div>
              <div className="text-lg font-bold text-orange-600">ADMIN</div>
              <div className="text-xs text-gray-500">Controle Total</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
