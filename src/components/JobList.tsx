
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, DollarSign, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Job = Database['public']['Tables']['jobs']['Row'] & {
  companies: Database['public']['Tables']['companies']['Row'];
};

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedContractType, setSelectedContractType] = useState('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedCity, selectedContractType, selectedWorkMode]);

  const fetchJobs = async () => {
    try {
      console.log('Buscando vagas públicas...');
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            city,
            sector
          )
        `)
        .eq('status', 'Ativa')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar vagas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar vagas. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      console.log('Vagas encontradas:', data?.length || 0);
      setJobs(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar vagas:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar vagas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.companies?.name && job.companies.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    if (selectedContractType !== 'all') {
      filtered = filtered.filter(job => job.contract_type === selectedContractType);
    }

    if (selectedWorkMode !== 'all') {
      filtered = filtered.filter(job => job.work_mode === selectedWorkMode);
    }

    setFilteredJobs(filtered);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filtros */}
      <Card className="mb-8 shadow-lg rounded-2xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold">
            <Filter className="w-5 h-5 mr-2 text-green-600" />
            Filtrar Vagas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                <SelectItem value="londrina">Londrina</SelectItem>
                <SelectItem value="maringá">Maringá</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedContractType} onValueChange={setSelectedContractType}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="CLT">CLT</SelectItem>
                <SelectItem value="PJ">PJ</SelectItem>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
                <SelectItem value="Estágio">Estágio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedWorkMode} onValueChange={setSelectedWorkMode}>
              <SelectTrigger className="rounded-xl">
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

      {/* Lista de vagas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-xl transition-all duration-300 rounded-2xl border-0 overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50">
              <CardTitle className="text-lg font-bold text-gray-900">{job.title}</CardTitle>
              <CardDescription className="text-green-600 font-semibold">
                {job.companies?.name || 'Empresa não informada'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    <span>{job.location}</span>
                  </div>
                  <Badge variant="outline" className="rounded-full">{job.work_mode}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="font-semibold text-green-600">{job.salary}</span>
                  </div>
                  <Badge variant="outline" className="rounded-full">{job.contract_type}</Badge>
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>Publicada em {new Date(job.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                
                <Button 
                  onClick={() => window.open(`mailto:${job.companies?.name ? 'contato@' + job.companies.name.toLowerCase().replace(/\s+/g, '') + '.com' : 'contato@empresa.com'}?subject=Candidatura para ${job.title}`)}
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
                >
                  Candidatar-se
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-r from-green-100 to-yellow-100 rounded-2xl p-8">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-gray-600">Tente ajustar os filtros ou buscar por outros termos.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
