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
  LogOut
} from "lucide-react";
import EnhancedJobForm from "@/components/EnhancedJobForm";
import CandidatesList from "@/components/CandidatesList";
import PaymentWarning from "@/components/PaymentWarning";
import PixPaymentModal from "@/components/PixPaymentModal";
import type { Database } from "@/integrations/supabase/types";

type Job = Database['public']['Tables']['jobs']['Row'];
type Company = Database['public']['Tables']['companies']['Row'];

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Só inicializa quando tem usuário e auth não está loading
  useEffect(() => {
    if (!authLoading && user && !isInitialized) {
      console.log('Dashboard: Inicializando para usuário:', user.email);
      setIsInitialized(true);
      fetchCompanyAndJobs();
    } else if (!authLoading && !user) {
      console.log('Dashboard: Sem usuário, redirecionando...');
    }
  }, [user, authLoading, isInitialized]);

  const createMissingCompany = async () => {
    if (!user) return false;

    console.log('Dashboard: Criando empresa para usuário:', user.email);
    
    try {
      const isAdminUser = user.email === 'admin@vagaspg.com' || user.email === 'vagas@vagas.com';
      
      const companyData = {
        user_id: user.id,
        name: isAdminUser ? 'VAGAS PG - Administração' : 'Empresa Criada Automaticamente',
        cnpj: isAdminUser ? '00.000.000/0000-00' : '99.999.999/9999-99',
        email: user.email,
        phone: '(42) 0000-0000',
        address: 'Endereço a ser preenchido',
        city: 'Ponta Grossa',
        sector: 'Administração',
        legal_representative: 'Representante Legal',
        description: isAdminUser ? 'Empresa administrativa do sistema' : 'Empresa criada automaticamente - favor atualizar dados no perfil',
        status: 'Ativa' as const
      };

      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar empresa:', createError);
        return false;
      }

      console.log('Dashboard: Empresa criada com sucesso:', newCompany);
      setCompany(newCompany);
      
      toast({
        title: "Empresa criada com sucesso!",
        description: isAdminUser ? "Empresa administrativa ativada." : "Sua empresa está pronta! Você já pode publicar vagas.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      return false;
    }
  };

  const fetchCompanyAndJobs = async () => {
    if (!user) {
      console.log('Dashboard: Sem usuário logado');
      return;
    }
    
    console.log('Dashboard: Buscando empresa para user_id:', user.id);
    
    try {
      setLoadingCompany(true);
      
      // Buscar empresa do usuário
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyError) {
        console.error('Erro ao buscar empresa:', companyError);
        setLoadingCompany(false);
        return;
      }

      if (!companyData) {
        console.log('Dashboard: Empresa não encontrada, criando automaticamente...');
        
        const companyCreated = await createMissingCompany();
        
        if (!companyCreated) {
          toast({
            title: "Erro",
            description: "Não foi possível criar sua empresa automaticamente.",
            variant: "destructive",
          });
          setLoadingCompany(false);
          return;
        }
        
        setJobs([]);
        setLoadingCompany(false);
        return;
      }

      console.log('Dashboard: Empresa encontrada:', companyData);
      setCompany(companyData);

      // Buscar vagas da empresa
      setLoadingJobs(true);
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        toast({
          title: "Erro ao carregar vagas",
          description: "Erro ao buscar suas vagas. Tente novamente.",
          variant: "destructive",
        });
        setJobs([]);
      } else {
        console.log('Dashboard: Vagas encontradas:', jobsData?.length || 0);
        setJobs(jobsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Erro inesperado. Tente fazer login novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingCompany(false);
      setLoadingJobs(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const handleJobSaved = () => {
    console.log('Dashboard: Vaga salva, atualizando lista...');
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

  const createPaymentJob = async () => {
    return { success: true, jobId: 'temp-id' };
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    toast({
      title: "✅ Pagamento Confirmado!",
      description: "Obrigado! Todas as suas vagas estão agora em dia.",
    });
    fetchCompanyAndJobs();
  };

  // Mostrar loading apenas se auth estiver loading ou se está inicializando
  if (authLoading || (user && !isInitialized)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirecionamento se não autenticado
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Mostrar loading se estiver carregando empresa
  if (loadingCompany && !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando sua empresa...</p>
        </div>
      </div>
    );
  }

  // Se não tem empresa e não está carregando, mostrar erro
  if (!company && !loadingCompany) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Problema com a empresa</h2>
            <p className="text-gray-600 mb-6">
              Sua empresa não foi encontrada no sistema.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={fetchCompanyAndJobs}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Tentar Novamente
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Fazer Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Contar vagas que precisam de pagamento (simulação)
  const pendingPaymentJobs = jobs.filter(job => 
    job.status === 'Ativa' && 
    company?.email !== 'vagas@vagas.com' &&
    company?.email !== 'admin@vagaspg.com'
  ).length;

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
        {/* Aviso de Pagamento Pendente */}
        <PaymentWarning 
          jobsCount={pendingPaymentJobs}
          onOpenPayment={() => setShowPaymentModal(true)}
        />

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobs.length}</div>
                  <p className="text-xs text-muted-foreground">vagas publicadas</p>
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
                  <p className="text-xs text-muted-foreground">recebendo candidaturas</p>
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
                  <p className="text-xs text-muted-foreground">conta empresarial</p>
                </CardContent>
              </Card>
            </div>
            
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
                {jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {job.title}
                            </h3>
                            <Badge variant={job.status === 'Ativa' ? 'default' : 'secondary'}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {job.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{job.salary} • {job.location}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{job.contract_type}</span>
                            <span>{job.work_mode}</span>
                            <span>{job.experience_level}</span>
                          </div>
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
                ))}
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

      {/* Modal de Pagamento PIX Global */}
      {showPaymentModal && (
        <PixPaymentModal
          jobTitle="Pagamento de Vagas Pendentes"
          companyEmail={company.email}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
          createJobFn={createPaymentJob}
        />
      )}
    </div>
  );
};

export default Dashboard;
