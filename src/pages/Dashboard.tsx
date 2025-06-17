import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Briefcase, 
  Users, 
  Plus, 
  Settings, 
  BarChart3,
  Eye,
  Edit,
  Trash2,
  User,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import JobForm from "@/components/JobForm";
import CompanyStats from "@/components/CompanyStats";
import CandidatesList from "@/components/CandidatesList";
import CompanyProfileEdit from "@/components/CompanyProfileEdit";

interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  sector: string;
  legal_representative: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  salary: string;
  location: string;
  contract_type: string;
  work_mode: string;
  experience_level: string;
  status: string;
  created_at: string;
  benefits: string[] | null;
  company_id: string;
}

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      fetchCompanyData();
      fetchJobs();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company:', error);
        return;
      }

      setCompany(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);

      if (!company) {
        // Se ainda não temos os dados da empresa, vamos buscar primeiro
        const { data: companyData } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user?.id)
          .single();

        if (!companyData) return;

        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', companyData.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching jobs:', error);
          return;
        }

        setJobs(data || []);
      } else {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching jobs:', error);
          return;
        }

        setJobs(data || []);
      }
    } catch (error) {
      console.error('Error in fetchJobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSaved = () => {
    setShowJobForm(false);
    setEditingJob(null);
    fetchJobs();
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('Error deleting job:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir vaga.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Vaga excluída",
        description: "A vaga foi excluída com sucesso.",
      });

      fetchJobs();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading && !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  Dashboard - {company?.name || 'Empresa'}
                </h1>
                <p className="text-sm text-gray-600">
                  {isAdmin ? 'Administrador' : 'Painel da Empresa'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={company?.status === 'Ativa' ? 'default' : 'secondary'}>
                {company?.status || 'Pendente'}
              </Badge>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="rounded-full"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-md rounded-2xl p-2 overflow-x-auto">
            <TabsTrigger value="overview" className="rounded-xl text-xs md:text-sm">
              <BarChart3 className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="rounded-xl text-xs md:text-sm">
              <Briefcase className="w-4 h-4 mr-1 md:mr-2" />
              Vagas
            </TabsTrigger>
            <TabsTrigger value="candidates" className="rounded-xl text-xs md:text-sm">
              <Users className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Candidatos</span>
              <span className="sm:hidden">Cand.</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-xl text-xs md:text-sm">
              <User className="w-4 h-4 mr-1 md:mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl text-xs md:text-sm">
              <Settings className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Config.</span>
              <span className="sm:hidden">Conf</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <CompanyStats companyId={company?.id || ''} />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl md:text-3xl font-bold">Minhas Vagas</h2>
              <Button
                onClick={() => setShowJobForm(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Vaga
              </Button>
            </div>

            {showJobForm && (
              <div className="mb-6">
                <JobForm
                  job={editingJob}
                  onSave={handleJobSaved}
                  onCancel={() => {
                    setShowJobForm(false);
                    setEditingJob(null);
                  }}
                  companyId={company?.id || ''}
                />
              </div>
            )}

            <div className="grid gap-6">
              {jobs.length === 0 ? (
                <Card className="border-0 rounded-3xl shadow-lg">
                  <CardContent className="p-8 md:p-12 text-center">
                    <Briefcase className="h-12 md:h-16 w-12 md:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">Nenhuma vaga cadastrada</h3>
                    <p className="text-gray-500 mb-6">
                      Comece criando sua primeira vaga para atrair candidatos.
                    </p>
                    <Button
                      onClick={() => setShowJobForm(true)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Vaga
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id} className="border-0 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 rounded-t-3xl">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="text-green-600 font-medium text-sm md:text-base">
                            {job.location} • {job.contract_type} • {job.work_mode}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant={job.status === 'Ativa' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 md:p-6">
                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm md:text-base">{job.description}</p>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-lg font-bold text-green-600">
                          {job.salary}
                        </div>
                        <div className="flex space-x-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditJob(job)}
                            className="rounded-xl flex-1 sm:flex-none"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteJob(job.id)}
                            className="rounded-xl text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <CandidatesList companyId={company?.id || ''} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <CompanyProfileEdit />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 rounded-3xl shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl">
                <CardTitle className="text-xl md:text-2xl font-bold flex items-center">
                  <Settings className="h-6 md:h-8 w-6 md:w-8 mr-3" />
                  Configurações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informações da Conta</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-xl text-sm md:text-base">
                          {user?.email}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status da Conta</label>
                        <div className="mt-1">
                          <Badge variant={company?.status === 'Ativa' ? 'default' : 'secondary'}>
                            {company?.status || 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Ações da Conta</h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="w-full justify-start rounded-xl"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair da Conta
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
