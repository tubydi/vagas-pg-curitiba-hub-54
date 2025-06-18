
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, Trash2, Search, Building2 } from 'lucide-react';
import { formatTimeAgo } from '@/utils/timeUtils';

interface Job {
  id: string;
  title: string;
  company_id: string;
  salary: string;
  location: string;
  contract_type: string;
  work_mode: string;
  status: string;
  created_at: string;
  companies: {
    name: string;
    email: string;
  };
}

const AdminJobsTable = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar vagas:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar vagas",
          variant: "destructive"
        });
        return;
      }

      setJobs(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Status da vaga atualizado!"
      });

      fetchJobs();
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro inesperado",
        description: "Falha ao atualizar status",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Vaga excluída!"
      });

      fetchJobs();
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro inesperado",
        description: "Falha ao excluir vaga",
        variant: "destructive"
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.companies?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p>Carregando vagas...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Gerenciar Vagas</span>
        </CardTitle>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar vagas ou empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Ativa">Ativa</SelectItem>
              <SelectItem value="Pausada">Pausada</SelectItem>
              <SelectItem value="Finalizada">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm text-gray-600 mb-4">
          {filteredJobs.length} vagas encontradas
        </div>
        
        {filteredJobs.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma vaga encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <p className="text-green-600 font-medium">{job.companies?.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                      <span>{job.location}</span>
                      <span>{job.salary}</span>
                      <span>{job.contract_type}</span>
                      <span>{job.work_mode}</span>
                      <span>{formatTimeAgo(job.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge variant={job.status === 'Ativa' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                    
                    <Select 
                      value={job.status} 
                      onValueChange={(value) => handleStatusChange(job.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativa">Ativa</SelectItem>
                        <SelectItem value="Pausada">Pausada</SelectItem>
                        <SelectItem value="Finalizada">Finalizada</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminJobsTable;
