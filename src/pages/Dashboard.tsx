import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Briefcase, Plus, Eye, Edit, Trash2, LogOut, DollarSign, MapPin, Clock, Brain } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import JobForm from "@/components/JobForm";
import CandidatesList from "@/components/CandidatesList";

const Dashboard = () => {
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      fetchCompanyAndJobs();
    }
  }, [user]);

  const fetchCompanyAndJobs = async () => {
    try {
      setLoading(true);
      
      // Buscar empresa do usuário logado
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyError) {
        console.error('Erro ao buscar empresa:', companyError);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados da empresa.",
          variant: "destructive"
        });
        return;
      }

      if (!companyData) {
        console.log('Empresa não encontrada para o usuário:', user.email);
        setJobs([]);
        setCompany(null);
        setLoading(false);
        return;
      }

      setCompany(companyData);

      // Buscar vagas da empresa apenas se a empresa existe
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Erro ao buscar vagas:', jobsError);
        toast({
          title: "Erro",
          description: "Erro ao carregar vagas.",
          variant: "destructive"
        });
        return;
      }

      setJobs(jobsData || []);
      
    } catch (error) {
      console.error('Erro geral:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJobSubmit = async (jobData) => {
    try {
      if (!company) {
        toast({
          title: "Erro",
          description: "Empresa não encontrada.",
          variant: "destructive"
        });
        return;
      }

      if (editingJob) {
        // Atualizar vaga existente
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', editingJob.id)
          .eq('company_id', company.id);

        if (error) {
          console.error('Erro ao atualizar vaga:', error);
          toast({
            title: "Erro",
            description: "Erro ao atualizar vaga.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Vaga atualizada!",
          description: "A vaga foi atualizada com sucesso.",
        });
        setEditingJob(null);
      } else {
        // Criar nova vaga
        const { error } = await supabase
          .from('jobs')
          .insert({
            ...jobData,
            company_id: company.id,
            status: 'Ativa'
          });

        if (error) {
          console.error('Erro ao criar vaga:', error);
          toast({
            title: "Erro",
            description: "Erro ao criar vaga.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Vaga criada!",
          description: "Sua vaga foi criada com sucesso.",
        });
      }

      setShowJobForm(false);
      fetchCompanyAndJobs(); // Recarregar dados
      
    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar vaga.",
        variant: "destructive"
      });
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('company_id', company.id);

      if (error) {
        console.error('Erro ao deletar vaga:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar vaga.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Vaga removida",
        description: "A vaga foi removida com sucesso.",
      });
      
      fetchCompanyAndJobs(); // Recarregar dados
      
    } catch (error) {
      console.error('Erro ao deletar vaga:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao deletar vaga.",
        variant: "destructive"
      });
    }
  };

  const toggleJobStatus = async (jobId) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      const newStatus = job.status === "Ativa" ? "Pausada" : "Ativa";

      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId)
        .eq('company_id', company.id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar status da vaga.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Status atualizado",
        description: "O status da vaga foi atualizado.",
      });
      
      fetchCompanyAndJobs(); // Recarregar dados
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status.",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    // Forçar redirecionamento após logout
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Verificar se não há empresa cadastrada
  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                  <Building2 className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  VAGAS PG
                </h1>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="rounded-full">
                <LogOut className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="max-w-md w-full bg-white rounded-3xl shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <Building2 className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Empresa não encontrada</h3>
              <p className="text-gray-600 mb-6">Complete seu cadastro de empresa primeiro para acessar o painel.</p>
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl w-full"
              >
                Completar Cadastro
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50">
      {/* Header - Mobile optimized */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                <Building2 className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                VAGAS PG
              </h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to="/vpg-ia" className="hidden md:block">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Brain className="w-4 h-4 mr-2" />
                  VPG IA
                </Button>
              </Link>
              <span className="hidden md:block text-gray-700 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
                {company?.name || "Carregando..."}
              </span>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="rounded-full">
                <LogOut className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Stats Cards - Mobile optimized */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="animate-fade-in bg-gradient-to-br from-white to-green-50 border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Vagas Ativas</CardTitle>
              <div className="bg-green-100 p-1 md:p-2 rounded-xl">
                <Briefcase className="h-3 w-3 md:h-5 md:w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-xl md:text-3xl font-bold text-green-600">
                {jobs.filter(job => job.status === "Ativa").length}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in bg-gradient-to-br from-white to-yellow-50 border-0 shadow-lg rounded-2xl" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Total Vagas</CardTitle>
              <div className="bg-yellow-100 p-1 md:p-2 rounded-xl">
                <Users className="h-3 w-3 md:h-5 md:w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-xl md:text-3xl font-bold text-yellow-600">
                {jobs.length}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in bg-gradient-to-br from-white to-green-50 border-0 shadow-lg rounded-2xl" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Pausadas</CardTitle>
              <div className="bg-green-100 p-1 md:p-2 rounded-xl">
                <Building2 className="h-3 w-3 md:h-5 md:w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-xl md:text-3xl font-bold text-green-600">
                {jobs.filter(job => job.status === "Pausada").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-2xl shadow-sm p-1">
            <TabsTrigger value="jobs" className="rounded-xl font-semibold text-sm md:text-base">Minhas Vagas</TabsTrigger>
            <TabsTrigger value="candidates" className="rounded-xl font-semibold text-sm md:text-base">Candidatos</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Gerenciar Vagas</h2>
              <Button 
                onClick={() => {
                  setEditingJob(null);
                  setShowJobForm(true);
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl shadow-lg w-full md:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Vaga
              </Button>
            </div>

            {showJobForm && (
              <Card className="animate-slide-up bg-white rounded-3xl shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-t-3xl">
                  <CardTitle className="text-xl md:text-2xl text-gray-900">
                    {editingJob ? "Editar Vaga" : "Publicar Nova Vaga"}
                  </CardTitle>
                  <CardDescription>
                    {editingJob ? "Atualize os dados da vaga" : "Preencha os dados da vaga para atrair os melhores candidatos"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-8">
                  <JobForm 
                    initialData={editingJob}
                    onSubmit={handleJobSubmit}
                    onCancel={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Jobs List - Mobile optimized */}
            <div className="space-y-4 md:space-y-6">
              {jobs.length === 0 ? (
                <Card className="bg-white rounded-3xl border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma vaga cadastrada</h3>
                    <p className="text-gray-600 mb-4">Crie sua primeira vaga para começar a receber candidatos!</p>
                    <Button 
                      onClick={() => setShowJobForm(true)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Vaga
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-xl transition-all duration-300 bg-white rounded-3xl border-0 overflow-hidden">
                    <CardContent className="p-4 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
                            <h3 className="text-lg md:text-2xl font-bold text-gray-900">{job.title}</h3>
                            <Badge 
                              variant={job.status === "Ativa" ? "default" : "secondary"}
                              className={`${
                                job.status === "Ativa" 
                                  ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                  : "bg-gray-100 text-gray-600"
                              } rounded-full px-3 py-1 w-fit`}
                            >
                              {job.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-6 mb-4">
                            <div className="flex items-center text-gray-600 text-sm md:text-base">
                              <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-500" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm md:text-base">
                              <DollarSign className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-500" />
                              <span className="font-semibold">{job.salary}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm md:text-base">
                              <Building2 className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-500" />
                              <span>{job.contract_type} - {job.work_mode}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm md:text-base">
                              <Users className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-500" />
                              <span className="font-semibold">0 candidatos</span>
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Criada em {new Date(job.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        
                        <div className="flex flex-row md:flex-col items-center space-x-2 md:space-x-0 md:space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleJobStatus(job.id)}
                            className="rounded-xl flex-1 md:flex-none"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditJob(job)}
                            className="rounded-xl flex-1 md:flex-none"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl flex-1 md:flex-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="candidates">
            <CandidatesList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
