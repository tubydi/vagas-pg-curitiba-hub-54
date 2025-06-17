
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, Users, Briefcase, Eye, Edit, Trash2, LogOut, CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import JobForm from "@/components/JobForm";
import { Link, useNavigate } from "react-router-dom";
import ApplicationDetails from "@/components/ApplicationDetails";

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0
  });

  useEffect(() => {
    if (user) {
      fetchCompanyData();
      fetchJobs();
      fetchApplications();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      console.log('Fetching company data for user:', user?.id);
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company:', error);
        return;
      }

      console.log('Company data:', data);
      setCompany(data);
      
      if (!data) {
        toast({
          title: "Cadastro incompleto",
          description: "Complete sua confirmação de email primeiro para acessar o painel",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in fetchCompanyData:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      if (!user) return;
      
      console.log('Fetching jobs for user:', user.id);
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', company?.id || 'none')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }

      console.log('Jobs fetched:', data);
      setJobs(data || []);
      
      // Update stats
      const activeJobs = data?.filter(job => job.status === 'Ativa').length || 0;
      setStats(prev => ({
        ...prev,
        totalJobs: data?.length || 0,
        activeJobs
      }));
    } catch (error) {
      console.error('Error in fetchJobs:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      if (!company?.id) return;
      
      console.log('Fetching applications for company:', company.id);
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner (
            title,
            company_id
          )
        `)
        .eq('jobs.company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      console.log('Applications fetched:', data);
      setApplications(data || []);
      
      // Update stats
      const newApplications = data?.filter(app => app.status === 'Novo').length || 0;
      setStats(prev => ({
        ...prev,
        totalApplications: data?.length || 0,
        newApplications
      }));
    } catch (error) {
      console.error('Error in fetchApplications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch applications when company changes
  useEffect(() => {
    if (company?.id) {
      fetchApplications();
    }
  }, [company]);

  const handleCreateJob = () => {
    if (!company) {
      toast({
        title: "Cadastro incompleto",
        description: "Complete sua confirmação de email primeiro para criar vagas",
        variant: "destructive",
      });
      return;
    }
    
    setEditingJob(null);
    setShowJobForm(true);
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('Error deleting job:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir vaga",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Vaga excluída",
        description: "A vaga foi excluída com sucesso",
      });

      fetchJobs();
    } catch (error) {
      console.error('Error in handleDeleteJob:', error);
    }
  };

  const handleJobSaved = () => {
    setShowJobForm(false);
    setEditingJob(null);
    fetchJobs();
  };

  const handleLogout = async () => {
    try {
      console.log('Iniciando logout...');
      await signOut();
      
      // Limpar dados locais
      setCompany(null);
      setJobs([]);
      setApplications([]);
      
      // Redirecionar para home
      navigate('/', { replace: true });
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao sair",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Novo':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Em análise':
        return <Eye className="w-4 h-4 text-yellow-500" />;
      case 'Aprovado':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Rejeitado':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Novo':
        return 'bg-blue-100 text-blue-800';
      case 'Em análise':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Rejeitado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl">
          <CardHeader className="text-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-3xl">
            <Building2 className="w-12 h-12 mx-auto mb-4" />
            <CardTitle className="text-2xl">Cadastro Pendente</CardTitle>
            <CardDescription className="text-green-100">
              Complete sua confirmação de email primeiro para acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Mail className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Verifique sua caixa de entrada e clique no link de confirmação que enviamos para ativar sua conta.
              </p>
              <p className="text-sm text-gray-500">
                Após confirmar seu email, você poderá acessar o painel completo da empresa.
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="w-full rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
              <Link to="/">
                <Button variant="outline" className="w-full rounded-xl">
                  Voltar ao Site
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-green-600 font-medium">{company.city} • {company.sector}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="outline" className="rounded-full">
                  Ver Site
                </Button>
              </Link>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total de Vagas</p>
                  <p className="text-3xl font-bold">{stats.totalJobs}</p>
                </div>
                <Briefcase className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Vagas Ativas</p>
                  <p className="text-3xl font-bold">{stats.activeJobs}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Candidaturas</p>
                  <p className="text-3xl font-bold">{stats.totalApplications}</p>
                </div>
                <Users className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Novas</p>
                  <p className="text-3xl font-bold">{stats.newApplications}</p>
                </div>
                <Clock className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-2xl shadow-sm p-1">
            <TabsTrigger value="jobs" className="rounded-xl font-semibold">
              Minhas Vagas
            </TabsTrigger>
            <TabsTrigger value="applications" className="rounded-xl font-semibold">
              Candidaturas
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciar Vagas</h2>
              <Button 
                onClick={handleCreateJob}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Vaga
              </Button>
            </div>

            {jobs.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-3xl">
                <CardContent className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">Nenhuma vaga cadastrada</h3>
                  <p className="text-gray-500 mb-6">
                    Comece criando sua primeira vaga para atrair os melhores talentos.
                  </p>
                  <Button 
                    onClick={handleCreateJob}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Vaga
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <Card key={job.id} className="border-0 shadow-lg rounded-3xl hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-br from-gray-50 to-green-50 rounded-t-3xl">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            {job.location} • {job.contract_type} • {job.work_mode}
                          </CardDescription>
                        </div>
                        <Badge 
                          className={`${
                            job.status === 'Ativa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          } rounded-full`}
                        >
                          {job.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>Salário: {job.salary}</span>
                        <span>Criada em {new Date(job.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditJob(job)}
                          className="flex-1 rounded-xl"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Candidaturas Recebidas</h2>

            {applications.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-3xl">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">Nenhuma candidatura</h3>
                  <p className="text-gray-500">
                    Quando alguém se candidatar às suas vagas, aparecerá aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id} className="border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{application.name}</h3>
                            <Badge className={`${getStatusColor(application.status)} rounded-full flex items-center gap-1`}>
                              {getStatusIcon(application.status)}
                              {application.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-1">
                            <strong>Vaga:</strong> {application.jobs?.title}
                          </p>
                          <p className="text-gray-600 mb-1">
                            <strong>Email:</strong> {application.email}
                          </p>
                          <p className="text-gray-600 mb-1">
                            <strong>Telefone:</strong> {application.phone}
                          </p>
                          {application.experience_years && (
                            <p className="text-gray-600 mb-1">
                              <strong>Experiência:</strong> {application.experience_years} anos
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Candidatura enviada em {new Date(application.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Button
                          onClick={() => setSelectedApplication(application)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <JobForm
              job={editingJob}
              onSave={handleJobSaved}
              onCancel={() => setShowJobForm(false)}
              companyId={company.id}
            />
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ApplicationDetails
              application={selectedApplication}
              onClose={() => setSelectedApplication(null)}
              onStatusUpdate={fetchApplications}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
