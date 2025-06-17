
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Search, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import JobApplicationForm from "./JobApplicationForm";

interface Company {
  id: string;
  name: string;
  city: string;
  sector: string;
  address?: string;
  cnpj?: string;
  created_at?: string;
  description?: string;
  email?: string;
  legal_representative?: string;
  phone?: string;
  status?: string;
  updated_at?: string;
  user_id?: string;
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

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedContract, setSelectedContract] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchJobs = async () => {
    try {
      console.log('Executando busca automática de vagas...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies!inner (
            id,
            name,
            city,
            sector,
            email,
            phone
          )
        `)
        .eq('status', 'Ativa')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro na busca principal:', error);
        
        console.log('Executando busca alternativa...');
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'Ativa')
          .order('created_at', { ascending: false });

        if (jobsError) {
          console.error('Erro na busca alternativa:', jobsError);
          toast({
            title: "Erro ao carregar vagas",
            description: "Não foi possível carregar as vagas. Tente novamente.",
            variant: "destructive",
          });
          return;
        }

        if (jobsData && jobsData.length > 0) {
          const companyIds = [...new Set(jobsData.map(job => job.company_id))];
          const { data: companiesData } = await supabase
            .from('companies')
            .select('id, name, city, sector, email, phone')
            .in('id', companyIds);

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

          console.log('Busca alternativa funcionou:', jobsWithCompanies.length, 'vagas');
          setJobs(jobsWithCompanies);
        }
        return;
      }

      console.log('Vagas encontradas:', data?.length || 0, 'vagas');
      console.log('Dados das vagas:', data);
      
      if (data && data.length > 0) {
        const mappedJobs = data.map(job => ({
          ...job,
          has_external_application: job.has_external_application || false,
          application_method: job.application_method || null,
          contact_info: job.contact_info || null
        }));
        
        setJobs(mappedJobs);
        console.log('Total de vagas configuradas:', mappedJobs.length);
      } else {
        console.log('Nenhuma vaga ativa encontrada');
        
        const { count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });
          
        console.log('Total de vagas no banco (todas):', count);
      }
      
    } catch (error) {
      console.error('Erro inesperado ao buscar vagas:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Iniciando busca automática de vagas...');
    fetchJobs();
    
    const interval = setInterval(() => {
      console.log('Executando busca automática periódica');
      fetchJobs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleApplyJob = (job: Job) => {
    setSelectedJob(job);
    setIsApplicationFormOpen(true);
  };

  const handleDirectApplication = (job: Job) => {
    const { application_method, contact_info } = job;
    
    if (application_method === 'WhatsApp' && contact_info) {
      const whatsappNumber = contact_info.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá! Gostaria de me candidatar para a vaga de ${job.title} na empresa ${job.companies.name}.`);
      const whatsappUrl = `https://wa.me/55${whatsappNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    } else if (application_method === 'Email' && contact_info) {
      const subject = encodeURIComponent(`Candidatura para vaga: ${job.title}`);
      const body = encodeURIComponent(`Olá!\n\nGostaria de me candidatar para a vaga de ${job.title} na empresa ${job.companies.name}.\n\nAguardo retorno.\n\nAtenciosamente.`);
      const emailUrl = `mailto:${contact_info}?subject=${subject}&body=${body}`;
      window.open(emailUrl, '_blank');
    } else if (application_method === 'Telefone' && contact_info) {
      const phoneUrl = `tel:${contact_info}`;
      window.open(phoneUrl, '_blank');
    } else {
      toast({
        title: "Informações de Contato",
        description: `${application_method}: ${contact_info}`,
      });
    }
  };

  const closeApplicationForm = () => {
    setIsApplicationFormOpen(false);
    setSelectedJob(null);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companies.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = selectedCity === "all" || 
      (selectedCity === "ponta grossa" && (
        job.location.toLowerCase().includes("ponta grossa") ||
        job.companies.city.toLowerCase().includes("ponta grossa")
      )) ||
      (selectedCity === "curitiba" && (
        job.location.toLowerCase().includes("curitiba") ||
        job.companies.city.toLowerCase().includes("curitiba")
      ));
    
    const matchesContract = selectedContract === "all" || 
      job.contract_type === selectedContract;

    return matchesSearch && matchesCity && matchesContract;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Buscando vagas automaticamente...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-4">
            Todas as Vagas
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Vagas atualizadas automaticamente - {jobs.length} disponíveis
          </p>
        </div>

        <Card className="mb-8 border-0 shadow-lg rounded-3xl">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar vagas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  <SelectItem value="ponta grossa">Ponta Grossa</SelectItem>
                  <SelectItem value="curitiba">Curitiba</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedContract} onValueChange={setSelectedContract}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Tipo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="CLT">CLT</SelectItem>
                  <SelectItem value="PJ">PJ</SelectItem>
                  <SelectItem value="Freelancer">Freelancer</SelectItem>
                  <SelectItem value="Estágio">Estágio</SelectItem>
                  <SelectItem value="Temporário">Temporário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 text-center md:text-left">
          <p className="text-gray-600">
            {filteredJobs.length} vaga{filteredJobs.length !== 1 ? 's' : ''} encontrada{filteredJobs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filteredJobs.length === 0 ? (
          <Card className="border-0 shadow-lg rounded-3xl">
            <CardContent className="p-8 md:p-12 text-center">
              <Building2 className="h-12 md:h-16 w-12 md:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">
                {jobs.length === 0 ? "Sistema buscando vagas..." : "Nenhuma vaga encontrada"}
              </h3>
              <p className="text-gray-500">
                {jobs.length === 0 
                  ? "O sistema está executando busca automática de vagas. Aguarde alguns instantes." 
                  : "Tente ajustar os filtros de busca ou aguarde novas vagas serem adicionadas automaticamente."
                }
              </p>
              {jobs.length === 0 && (
                <Button 
                  onClick={fetchJobs}
                  className="mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Novamente
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-gray-50 to-green-50 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                        {job.title}
                      </CardTitle>
                      <CardDescription className="text-green-600 font-semibold text-base md:text-lg mt-1">
                        {job.companies.name}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-full shrink-0 text-xs">
                      {job.experience_level}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(job.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 md:p-6">
                  <p className="text-gray-600 mb-6 line-clamp-3 text-sm md:text-base">{job.description}</p>
                  
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

                    {job.benefits && job.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.benefits.slice(0, 2).map((benefit, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                        {job.benefits.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.benefits.length - 2} benefícios
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <Button 
                      onClick={() => handleApplyJob(job)}
                      className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-semibold text-base md:text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Candidatar-se pelo Site
                    </Button>

                    {job.has_external_application && job.application_method && job.contact_info && (
                      <Button 
                        onClick={() => handleDirectApplication(job)}
                        variant="outline"
                        className="w-full h-12 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-2xl font-semibold text-base md:text-lg transition-all duration-200"
                      >
                        {job.application_method === 'WhatsApp' && 'WhatsApp: '}
                        {job.application_method === 'Email' && 'Email: '}
                        {job.application_method === 'Telefone' && 'Telefone: '}
                        {job.application_method === 'Presencial' && 'Presencial: '}
                        {job.application_method === 'Site' && 'Site: '}
                        {job.application_method === 'Outro' && 'Outro: '}
                        Candidatar-se via {job.application_method}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
    </div>
  );
};

export default JobList;
