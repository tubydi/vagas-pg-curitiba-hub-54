import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  FileText, 
  Users, 
  Plus, 
  Edit, 
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  LogOut,
  RefreshCw
} from "lucide-react";
import EnhancedJobForm from "@/components/EnhancedJobForm";
import CandidatesList from "@/components/CandidatesList";
import type { Database } from "@/integrations/supabase/types";

type Job = Database['public']['Tables']['jobs']['Row'];
type Company = Database['public']['Tables']['companies']['Row'];

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [retryingCompany, setRetryingCompany] = useState(false);
  const { toast } = useToast();

  console.log('Dashboard - user:', user?.email, 'isAdmin:', false);
  console.log('VERIFICAÇÃO FINAL - isAdmin:', false, 'user email:', user?.email);
  console.log('RENDERIZANDO PAINEL DE EMPRESA - USUÁRIO NÃO É ADMIN');
  console.log('Renderizando painel de EMPRESA');

  useEffect(() => {
    if (user) {
      console.log('Usuário no dashboard:', user.email, 'É ADMIN?', false);
      console.log('Usuário é empresa - buscando dados...');
      fetchCompanyAndJobs();
    }
  }, [user]);

  const fetchCompanyAndJobs = async () => {
    if (!user) return;
    
    try {
      setCompanyError(null);
      console.log('Buscando empresa para user_id:', user.id);
      
      // Buscar empresa do usuário
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (companyError) {
        console.error('Error fetching company:', companyError);
        
        // Se não encontrar empresa, NÃO criar automaticamente
        if (companyError.code === 'PGRST116') {
          console.log('Empresa não encontrada para este usuário');
          setCompanyError('Nenhuma empresa encontrada para este usuário. Você precisa completar o cadastro da empresa.');
        } else {
          setCompanyError(`Erro ao buscar empresa: ${companyError.message}`);
        }
        setLoadingJobs(false);
        return;
      }

      console.log('Empresa encontrada:', companyData);
      setCompany(companyData);

      // Buscar vagas da empresa
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
      } else {
        setJobs(jobsData || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setCompanyError('Erro inesperado ao buscar dados da empresa.');
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleCreateCompany = async () => {
    if (!user) return;
    
    setRetryingCompany(true);
    try {
      console.log('Tentando criar empresa para user_id:', user.id);
      
      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert([{
          user_id: user.id,
          name: 'Minha Empresa',
          cnpj: '00.000.000/0001-00',
          email: user.email || '',
          phone: '(42) 99999-9999',
          address: 'Endereço da empresa',
          city: 'Ponta Grossa',
          sector: 'Tecnologia',
          legal_representative: 'Representante Legal',
          description: 'Descrição da empresa',
          status: 'Ativa' as const
        }])
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating company:', createError);
        setCompanyError(`Erro ao criar empresa: ${createError.message}`);
        toast({
          title: "Erro",
          description: "Não foi possível criar a empresa. Tente fazer um novo cadastro.",
          variant: "destructive",
        });
      } else {
        console.log('Empresa criada:', newCompany);
        setCompany(newCompany);
        setCompanyError(null);
        toast({
          title: "Sucesso",
          description: "Empresa criada com sucesso!",
        });
      }
    } catch (error) {
      console.error('Error creating company:', error);
      setCompanyError('Erro inesperado ao criar empresa.');
    } finally {
      setRetryingCompany(false);
    }
  };

  const handleGoToAuth = () => {
    navigate('/auth');
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleJobSaved = () => {
    fetchCompanyAndJobs();
    setActiveTab("jobs");
    setSelectedJob(null);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setActiveTab("new-job");
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta vaga?")) return;

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir vaga.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Vaga excluída com sucesso!",
      });
      fetchCompanyAndJobs();
    }
  };

  const getJobStatusInfo = (job: Job) => {
    const paymentStatus = job.payment_status;
    const jobStatus = job.status;

    // Para empresa isenta (vagas@vagas.com)
    if (company?.email === 'vagas@vagas.com') {
      if (jobStatus === 'Ativa') {
        return {
          label: 'Ativa',
          variant: 'default' as const,
          icon: CheckCircle,
          color: 'text-green-600'
        };
      }
      return {
        label: jobStatus || 'Inativa',
        variant: 'secondary' as const,
        icon: AlertCircle,
        color: 'text-gray-600'
      };
    }

    // Para empresas que precisam pagar
    if (paymentStatus === 'pending') {
      return {
        label: 'Pagamento Pendente',
        variant: 'destructive' as const,
        icon: CreditCard,
        color: 'text-red-600',
        message: 'Realize o pagamento para ativar esta vaga'
      };
    }

    if (paymentStatus === 'approved') {
      if (jobStatus === 'Ativa') {
        return {
          label: 'Ativa',
          variant: 'default' as const,
          icon: CheckCircle,
          color: 'text-green-600'
        };
      } else {
        return {
          label: 'Aguardando Aprovação',
          variant: 'secondary' as const,
          icon: Clock,
          color: 'text-orange-600',
          message: 'Vaga paga, aguardando aprovação do administrador. Contato: pontagrossavagas@gmail.com'
        };
      }
    }

    return {
      label: 'Inativa',
      variant: 'secondary' as const,
      icon: AlertCircle,
      color: 'text-gray-600'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Se há erro na empresa ou empresa não existe, mostrar opções
  if (companyError || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Problema com a Conta</h2>
            <p className="text-gray-600 mb-6">
              {companyError || "Empresa não encontrada para este usuário."}
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleCreateCompany}
                disabled={retryingCompany}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {retryingCompany ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Criando empresa...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Criar empresa padrão
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleGoToAuth}
                variant="outline"
                className="w-full"
              >
                Refazer cadastro
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-gray-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair da conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Dashboard - Empresa</h1>
                <p className="text-green-100">Painel da Empresa: {company.name}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex flex-wrap border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "overview"
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Visão Geral</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "jobs"
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Minhas Vagas ({jobs.length})</span>
              </div>
            </button>
            <button
              onClick={() => {
                setSelectedJob(null);
                setActiveTab("new-job");
              }}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "new-job"
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Nova Vaga</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("candidates")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "candidates"
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Candidatos</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Company Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobs.length}</div>
                  <p className="text-xs text-muted-foreground">
                    vagas publicadas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vagas Ativas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {jobs.filter(job => job.status === 'Ativa').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    recebendo candidaturas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status da Empresa</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge variant={company.status === 'Ativa' ? 'default' : 'secondary'}>
                      {company.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    conta empresarial
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-6 h-6 text-green-600" />
                  <span>Informações da Empresa</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Nome</h4>
                    <p className="text-gray-600">{company.name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                    <p className="text-gray-600">{company.email}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">CNPJ</h4>
                    <p className="text-gray-600">{company.cnpj}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                    <Badge variant={company.status === 'Ativa' ? 'default' : 'secondary'}>
                      {company.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "jobs" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Minhas Vagas</h2>
              <Button
                onClick={() => {
                  setSelectedJob(null);
                  setActiveTab("new-job");
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Vaga
              </Button>
            </div>

            {loadingJobs ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Carregando vagas...</p>
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhuma vaga cadastrada
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Comece criando sua primeira vaga para atrair candidatos qualificados.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedJob(null);
                      setActiveTab("new-job");
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeira vaga
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {jobs.map((job) => {
                  const statusInfo = getJobStatusInfo(job);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <Card key={job.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {job.title}
                              </h3>
                              <Badge variant={statusInfo.variant}>
                                <StatusIcon className={`w-3 h-3 mr-1 ${statusInfo.color}`} />
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{job.salary} • {job.location}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{job.contract_type}</span>
                              <span>{job.work_mode}</span>
                              <span>{job.experience_level}</span>
                            </div>
                            {statusInfo.message && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                  <AlertCircle className="w-4 h-4 inline mr-1" />
                                  {statusInfo.message}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditJob(job)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab("candidates")}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-700 line-clamp-2">{job.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "new-job" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedJob ? "Editar Vaga" : "Nova Vaga"}
            </h2>
            <EnhancedJobForm
              job={selectedJob}
              onSave={handleJobSaved}
              onCancel={() => setActiveTab("jobs")}
              companyId={company.id}
            />
          </div>
        )}

        {activeTab === "candidates" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Candidatos</h2>
            <CandidatesList />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
