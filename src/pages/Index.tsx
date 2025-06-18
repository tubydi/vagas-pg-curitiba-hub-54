
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Search, Star, Clock, DollarSign, Brain, Sparkles, Users, Briefcase, TrendingUp, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import JobApplicationForm from "@/components/JobApplicationForm";

interface Company {
  id: string;
  name: string;
  city: string;
  sector: string;
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
  companies: Company;
  has_external_application?: boolean;
  application_method?: string;
  contact_info?: string;
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [totalCompanies] = useState(47);
  const [totalApplications] = useState(186);
  const { user } = useAuth();

  useEffect(() => {
    console.log('Iniciando busca automática de vagas...');
    fetchFeaturedJobs();
    
    // Buscar vagas a cada 30 segundos automaticamente
    const interval = setInterval(() => {
      console.log('Busca automática de vagas executada');
      fetchFeaturedJobs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      console.log('Executando busca de vagas... (ACESSO PÚBLICO)');
      setLoading(true);
      
      // Busca direta das vagas
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'Ativa')
        .order('created_at', { ascending: false })
        .limit(6);

      if (jobsError) {
        console.error('Erro ao buscar vagas em destaque:', jobsError);
        return;
      }

      console.log('Vagas em destaque encontradas:', jobsData?.length || 0);
      console.log('Dados completos das vagas:', jobsData);

      if (jobsData && jobsData.length > 0) {
        // Buscar dados das empresas separadamente
        const companyIds = [...new Set(jobsData.map(job => job.company_id))];
        const { data: companiesData } = await supabase
          .from('companies')
          .select('id, name, city, sector')
          .in('id', companyIds);
          
        // Mapear vagas com dados das empresas
        const jobsWithCompanies = jobsData.map(job => ({
          ...job,
          has_external_application: job.has_external_application || false,
          application_method: job.application_method || null,
          contact_info: job.contact_info || null,
          companies: companiesData?.find(c => c.id === job.company_id) || {
            id: job.company_id,
            name: 'Empresa não encontrada',
            city: 'N/A',
            sector: 'N/A'
          }
        }));
        
        console.log('Vagas configuradas no estado:', jobsWithCompanies.length);
        setFeaturedJobs(jobsWithCompanies);
      } else {
        console.log('Nenhuma vaga encontrada no banco');
        
        // VERIFICAÇÃO ADICIONAL - contar total de vagas no banco
        const { count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });
          
        console.log('Total de vagas no banco:', count);
      }
      
    } catch (error) {
      console.error('Erro inesperado ao buscar vagas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyJob = (job: Job) => {
    setSelectedJob(job);
    setIsApplicationFormOpen(true);
  };

  const closeApplicationForm = () => {
    setIsApplicationFormOpen(false);
    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                <Building2 className="h-6 md:h-8 w-6 md:w-8 text-white" />
              </div>
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                VAGAS PG
              </h1>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/vpg-ia">
                <Button variant="outline" className="rounded-full border-green-200 hover:bg-green-50">
                  <Brain className="w-4 h-4 mr-2" />
                  VPG IA
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="outline" className="rounded-full border-green-200 hover:bg-green-50">
                  Ver Todas as Vagas
                </Button>
              </Link>
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" className="rounded-full border-green-200 hover:bg-green-50">
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg">
                      Cadastrar
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-green-100 pt-4">
              <div className="flex flex-col space-y-3">
                <Link to="/vpg-ia" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full border-green-200 hover:bg-green-50">
                    <Brain className="w-4 h-4 mr-2" />
                    VPG IA
                  </Button>
                </Link>
                <Link to="/jobs" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full border-green-200 hover:bg-green-50">
                    Ver Todas as Vagas
                  </Button>
                </Link>
                {user ? (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full border-green-200 hover:bg-green-50">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg">
                        Cadastrar Empresa
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-500 via-green-600 to-yellow-500 text-white py-8 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in mb-6 md:mb-8">
            <h2 className="text-2xl md:text-6xl font-bold mb-4 leading-tight">
              Encontre sua vaga ideal
              <span className="block text-yellow-300 text-xl md:text-5xl">
                em Ponta Grossa & região
              </span>
            </h2>
            <p className="text-base md:text-xl text-green-100 mb-6 max-w-2xl mx-auto">
              As melhores oportunidades de emprego da região estão aqui
            </p>
          </div>

          <div className="max-w-5xl mx-auto animate-slide-up mb-6 md:mb-8">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md rounded-3xl">
              <CardContent className="p-4 md:p-8">
                <div className="flex flex-col gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Buscar por cargo, empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 md:h-14 rounded-2xl border-gray-200 text-base md:text-lg"
                    />
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger className="h-12 md:h-14 rounded-2xl border-gray-200 text-base md:text-lg">
                        <SelectValue placeholder="Cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as cidades</SelectItem>
                        <SelectItem value="ponta-grossa">Ponta Grossa</SelectItem>
                        <SelectItem value="curitiba">Curitiba</SelectItem>
                        <SelectItem value="castro">Castro</SelectItem>
                      </SelectContent>
                    </Select>
                    <Link to="/jobs" className="w-full md:w-auto">
                      <Button className="w-full h-12 md:h-14 px-6 md:px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl text-base md:text-lg font-semibold shadow-lg">
                        Buscar Vagas
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-2xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4">
              <div className="text-lg md:text-2xl font-bold">{totalCompanies}+</div>
              <div className="text-xs md:text-sm text-green-100">Empresas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4">
              <div className="text-lg md:text-2xl font-bold">{totalApplications}+</div>
              <div className="text-xs md:text-sm text-green-100">Candidatos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4">
              <div className="text-lg md:text-2xl font-bold">{featuredJobs.length + 23}+</div>
              <div className="text-xs md:text-sm text-green-100">Vagas</div>
            </div>
          </div>
        </div>
      </section>

      {/* VPG IA Banner */}
      <section className="py-6 md:py-8 bg-gradient-to-r from-gray-900 via-green-900 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-2xl">
                <Brain className="h-6 md:h-8 w-6 md:w-8 text-gray-900" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-yellow-300">VPG IA</h3>
                <p className="text-sm md:text-base text-gray-300">Inteligência Artificial para seu sucesso</p>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <Link to="/vpg-ia">
                <Button size="lg" className="w-full md:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-6 py-3 text-base md:text-lg font-bold rounded-2xl shadow-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Experimentar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vagas em Destaque */}
      <section className="py-8 md:py-20 bg-gradient-to-br from-white to-green-50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-4">
              Vagas em Destaque
            </h3>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
              Oportunidades atualizadas automaticamente
            </p>
            {loading && (
              <p className="text-sm text-green-600 mt-2">Buscando vagas mais recentes...</p>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando vagas em destaque...</p>
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 md:h-16 w-12 md:w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-700 mb-2">Buscando vagas...</h4>
              <p className="text-gray-600">Sistema executando busca automática de vagas</p>
              <div className="mt-4 flex justify-center">
                <Button 
                  onClick={fetchFeaturedJobs}
                  variant="outline"
                  className="border-green-200 hover:bg-green-50"
                >
                  Tentar buscar novamente
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
              {featuredJobs.map((job, index) => (
                <Card key={job.id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-gray-50 to-green-50 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="text-green-600 font-semibold text-base md:text-lg mt-1">
                          {job.companies.name}
                        </CardDescription>
                      </div>
                      {index < 2 && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-0 rounded-full px-2 md:px-3 py-1 shrink-0 ml-2 text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Destaque</span>
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(job.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 md:p-6">
                    <p className="text-gray-600 mb-6 line-clamp-2 text-sm md:text-base">{job.description}</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-gray-700">
                        <div className="flex items-center min-w-0 flex-1">
                          <MapPin className="w-5 h-5 mr-2 text-green-500 shrink-0" />
                          <span className="font-medium text-sm md:text-base truncate">{job.location}</span>
                        </div>
                        <Badge variant="outline" className="rounded-full ml-2 text-xs">
                          {job.work_mode}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-gray-700">
                        <div className="flex items-center min-w-0 flex-1">
                          <DollarSign className="w-5 h-5 mr-2 text-green-500 shrink-0" />
                          <span className="font-bold text-base md:text-lg text-green-600 truncate">{job.salary}</span>
                        </div>
                        <Badge variant="outline" className="rounded-full ml-2 text-xs">
                          {job.contract_type}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleApplyJob(job)}
                      className="w-full mt-6 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-semibold text-base md:text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Candidatar-se Agora
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:mt-12">
            <Link to="/jobs">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full md:w-auto rounded-full px-6 md:px-8 py-3 text-base md:text-lg font-semibold border-green-200 hover:bg-green-50 hover:border-green-300"
              >
                Ver Todas as Vagas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Empresas */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-yellow-600/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h3 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
            Sua empresa precisa de talentos?
          </h3>
          <p className="text-base md:text-xl text-gray-300 mb-8 md:mb-10 max-w-3xl mx-auto">
            Publique suas vagas e encontre os melhores profissionais de Ponta Grossa e região.
          </p>
          <div className="flex flex-col gap-4 justify-center items-center">
            <Link to="/auth" className="w-full md:w-auto">
              <Button size="lg" className="w-full md:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-6 md:px-8 py-4 text-lg md:text-xl font-bold rounded-full shadow-2xl">
                Cadastrar Empresa Gratuitamente
              </Button>
            </Link>
            <Link to="/vpg-ia" className="w-full md:w-auto">
              <Button size="lg" variant="outline" className="w-full md:w-auto text-white border-white hover:bg-white hover:text-gray-900 px-6 md:px-8 py-4 text-lg md:text-xl font-bold rounded-full">
                <Brain className="w-5 h-5 mr-2" />
                Usar VPG IA
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 py-8 md:py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-3 mb-6 md:mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
              <Building2 className="h-6 md:h-8 w-6 md:w-8 text-white" />
            </div>
            <h4 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
              VAGAS PG
            </h4>
          </div>
          <div className="text-center text-gray-400 text-sm md:text-base">
            <p>&copy; 2024 VAGAS PG. Conectando talentos em Ponta Grossa e região.</p>
          </div>
        </div>
      </footer>

      {/* Modal de Candidatura */}
      {selectedJob && isApplicationFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <JobApplicationForm
              job={selectedJob}
              onClose={closeApplicationForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
