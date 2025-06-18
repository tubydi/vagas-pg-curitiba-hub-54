
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Clock, DollarSign, ChevronRight, Users, Briefcase, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import JobApplicationForm from "@/components/JobApplicationForm";

interface Company {
  id: string;
  name: string;
  city: string;
  sector: string;
}

interface FeaturedJob {
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
  const [featuredJobs, setFeaturedJobs] = useState<FeaturedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<FeaturedJob | null>(null);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);

  const fetchFeaturedJobs = async () => {
    try {
      console.log('Executando busca de vagas...');
      setLoading(true);
      
      // Primeira tentativa: buscar vagas ativas
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'Ativa')
        .order('created_at', { ascending: false })
        .limit(6);

      if (jobsError) {
        console.error('Erro ao buscar vagas:', jobsError);
        return;
      }

      console.log('Vagas encontradas:', jobsData?.length || 0);
      console.log('Dados das vagas:', jobsData);

      if (jobsData && jobsData.length > 0) {
        // Buscar dados das empresas para as vagas encontradas
        const companyIds = [...new Set(jobsData.map(job => job.company_id))];
        console.log('IDs das empresas:', companyIds);
        
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name, city, sector')
          .in('id', companyIds);

        if (companiesError) {
          console.error('Erro ao buscar empresas:', companiesError);
        }

        console.log('Empresas encontradas:', companiesData?.length || 0);

        // Combinar dados das vagas com dados das empresas
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

        console.log('Vagas com empresas configuradas:', jobsWithCompanies.length);
        setFeaturedJobs(jobsWithCompanies);
      } else {
        console.log('Nenhuma vaga ativa encontrada');
        
        // Verificar total de vagas no banco
        const { count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });
          
        console.log('Total de vagas no banco:', count);
      }
      
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Iniciando busca de vagas na página inicial');
    fetchFeaturedJobs();
    
    const interval = setInterval(() => {
      console.log('Atualizando vagas automaticamente');
      fetchFeaturedJobs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleApplyJob = (job: FeaturedJob) => {
    setSelectedJob(job);
    setIsApplicationFormOpen(true);
  };

  const closeApplicationForm = () => {
    setIsApplicationFormOpen(false);
    setSelectedJob(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando vagas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-6">
            Vagas PG
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Portal de empregos profissional de Ponta Grossa. Conectamos talentos locais com as melhores oportunidades.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl h-14 px-8 text-lg font-semibold shadow-xl"
            >
              <Link to="/jobs">
                Ver Todas as Vagas
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline" 
              size="lg"
              className="rounded-2xl h-14 px-8 text-lg font-semibold border-2 border-green-500 text-green-600 hover:bg-green-50"
            >
              <Link to="/auth">
                Para Empresas
                <Building2 className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-xl rounded-3xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Para Candidatos</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Encontre oportunidades em empresas de Ponta Grossa e região. 
                  Candidate-se facilmente e acompanhe suas aplicações.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl rounded-3xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Para Empresas</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Publique vagas gratuitamente e encontre os melhores talentos locais. 
                  Gerencie candidaturas de forma simples e eficiente.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl rounded-3xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Crescimento Local</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Fortalecemos o mercado de trabalho local, conectando empresas 
                  e profissionais da nossa região.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-4">
              Vagas em Destaque
            </h2>
            <p className="text-lg text-gray-600">
              {featuredJobs.length > 0 
                ? `${featuredJobs.length} oportunidades disponíveis agora`
                : 'Carregando oportunidades...'
              }
            </p>
          </div>

          {featuredJobs.length === 0 ? (
            <Card className="border-0 shadow-xl rounded-3xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-700 mb-4">Novas vagas em breve</h3>
                <p className="text-gray-500 mb-6">
                  Estamos trabalhando com empresas locais para trazer as melhores oportunidades para você.
                </p>
                <Button onClick={fetchFeaturedJobs} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl">
                  Atualizar Vagas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredJobs.map((job) => (
                <Card key={job.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-gray-50 to-green-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="text-green-600 font-semibold mt-1">
                          {job.companies.name}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="rounded-full">
                        {job.experience_level}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(job.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-gray-700">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-green-500" />
                          <span className="font-medium">{job.location}</span>
                        </div>
                        <Badge variant="outline" className="rounded-full">
                          {job.work_mode}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-gray-700">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                          <span className="font-bold text-green-600">{job.salary}</span>
                        </div>
                        <Badge variant="outline" className="rounded-full">
                          {job.contract_type}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleApplyJob(job)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Candidatar-se
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              asChild
              size="lg"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl h-14 px-8 text-lg font-semibold shadow-xl"
            >
              <Link to="/jobs">
                Ver Todas as Vagas
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

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
