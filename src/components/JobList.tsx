
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Search,
  Filter,
  Building2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatTimeAgo } from '@/utils/timeUtils';
import JobApplicationForm from '@/components/JobApplicationForm';

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
  companies?: Company;
}

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('Buscando todas as vagas...');

      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'Ativa')
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Erro ao buscar vagas:', jobsError);
        return;
      }

      if (jobsData && jobsData.length > 0) {
        const companyIds = [...new Set(jobsData.map(job => job.company_id))];
        const { data: companiesData } = await supabase
          .from('companies')
          .select('id, name, city, sector')
          .in('id', companyIds);

        const jobsWithCompanies = jobsData.map(job => ({
          ...job,
          companies: companiesData?.find(c => c.id === job.company_id) || {
            id: job.company_id,
            name: 'Empresa não encontrada',
            city: 'N/A',
            sector: 'N/A'
          }
        }));

        setJobs(jobsWithCompanies);
      } else {
        setJobs([]);
      }

    } catch (error) {
      console.error('Erro inesperado ao buscar vagas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.companies?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'all' || job.location === selectedCity;
    const matchesType = selectedType === 'all' || job.contract_type === selectedType;
    const matchesMode = selectedMode === 'all' || job.work_mode === selectedMode;
    
    return matchesSearch && matchesCity && matchesType && matchesMode;
  });

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handleApplyJob = (job: Job) => {
    setSelectedJob(job);
    setIsApplicationFormOpen(true);
  };

  const closeApplicationForm = () => {
    setIsApplicationFormOpen(false);
    setSelectedJob(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar vagas ou empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                <SelectItem value="Ponta Grossa">Ponta Grossa</SelectItem>
                <SelectItem value="Curitiba">Curitiba</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="CLT">CLT</SelectItem>
                <SelectItem value="PJ">PJ</SelectItem>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
                <SelectItem value="Estágio">Estágio</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger>
                <SelectValue placeholder="Modalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as modalidades</SelectItem>
                <SelectItem value="Presencial">Presencial</SelectItem>
                <SelectItem value="Remoto">Remoto</SelectItem>
                <SelectItem value="Híbrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {filteredJobs.length} vagas encontradas
        </h2>
        <p className="text-gray-600">
          Página {currentPage} de {totalPages}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando vagas...</p>
        </div>
      ) : currentJobs.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhuma vaga encontrada</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou busque por outros termos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {job.title}
                    </CardTitle>
                    <p className="text-green-600 font-semibold text-lg">
                      {job.companies?.name}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {job.work_mode}
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTimeAgo(job.created_at)}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-green-500" />
                    <span>{job.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                    <span className="font-semibold text-green-600">{job.salary}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">{job.contract_type}</Badge>
                  <Badge variant="outline">{job.experience_level}</Badge>
                </div>
                
                <Button 
                  onClick={() => handleApplyJob(job)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Candidatar-se
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          
          {[...Array(totalPages)].map((_, index) => (
            <Button
              key={index + 1}
              variant={currentPage === index + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(index + 1)}
              className={currentPage === index + 1 ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {index + 1}
            </Button>
          ))}
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

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

export default JobList;
