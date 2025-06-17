
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Search, Edit, Trash2, CheckCircle, XCircle, Eye, Pause } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type JobStatus = Database['public']['Enums']['job_status'];

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
  benefits: string[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
  company_id: string;
  companies: {
    name: string;
  };
}

const AdminJobsTable = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('ADMIN: Buscando TODAS as vagas do banco...');
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies!inner (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar vagas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar vagas.",
          variant: "destructive",
        });
        return;
      }

      console.log('Total de vagas no banco:', data?.length || 0);
      setJobs(data || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: JobStatus) => {
    try {
      console.log('ADMIN: Alterando status da vaga:', jobId, 'para:', newStatus);
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar status da vaga.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status atualizado",
        description: `Status da vaga alterado para ${newStatus}.`,
      });

      fetchJobs();
      setSelectedJob(null);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('⚠️ ATENÇÃO: Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita!')) return;

    try {
      console.log('ADMIN: Excluindo vaga:', jobId);
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('Erro ao excluir vaga:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir vaga.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Vaga excluída",
        description: "A vaga foi excluída com sucesso.",
      });

      fetchJobs();
      setSelectedJob(null);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const updateJob = async (jobId: string, updates: Partial<Job>) => {
    try {
      console.log('ADMIN: Atualizando vaga:', jobId);
      const { error } = await supabase
        .from('jobs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) {
        console.error('Erro ao atualizar vaga:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar vaga.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Vaga atualizada",
        description: "A vaga foi atualizada com sucesso.",
      });

      fetchJobs();
      setEditMode(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companies.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativa":
        return "bg-green-100 text-green-800";
      case "Pausada":
        return "bg-yellow-100 text-yellow-800";
      case "Finalizada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando TODAS as vagas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold">🔥 ADMIN - GERENCIAR VAGAS</h2>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar vagas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Ativa">Ativa</SelectItem>
              <SelectItem value="Pausada">Pausada</SelectItem>
              <SelectItem value="Finalizada">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        📊 {filteredJobs.length} vaga{filteredJobs.length !== 1 ? 's' : ''} encontrada{filteredJobs.length !== 1 ? 's' : ''} no banco de dados
      </div>

      <Card className="border-0 rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="h-6 w-6 mr-2 text-blue-500" />
            Vagas Resumidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaga</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.companies.name}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(job.status)} rounded-full px-3 py-1 font-semibold`}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(job.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedJob(job)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Briefcase className="h-6 w-6 text-blue-500" />
                              {job.title} - {job.companies.name}
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedJob && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900">Informações Básicas</h4>
                                  <div className="space-y-2 mt-2">
                                    <p><strong>Cargo:</strong> {selectedJob.title}</p>
                                    <p><strong>Empresa:</strong> {selectedJob.companies.name}</p>
                                    <p><strong>Local:</strong> {selectedJob.location}</p>
                                    <p><strong>Salário:</strong> {selectedJob.salary}</p>
                                    <p><strong>Tipo:</strong> {selectedJob.contract_type}</p>
                                    <p><strong>Modalidade:</strong> {selectedJob.work_mode}</p>
                                    <p><strong>Experiência:</strong> {selectedJob.experience_level}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-gray-900">Status e Datas</h4>
                                  <div className="space-y-2 mt-2">
                                    <p><strong>Status:</strong> 
                                      <Badge className={`ml-2 ${getStatusColor(selectedJob.status)}`}>
                                        {selectedJob.status}
                                      </Badge>
                                    </p>
                                    <p><strong>Criada:</strong> {new Date(selectedJob.created_at).toLocaleDateString('pt-BR')}</p>
                                    <p><strong>Atualizada:</strong> {new Date(selectedJob.updated_at).toLocaleDateString('pt-BR')}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-900">Descrição</h4>
                                <p className="mt-2 text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedJob.description}</p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-900">Requisitos</h4>
                                <p className="mt-2 text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedJob.requirements}</p>
                              </div>

                              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-900">Benefícios</h4>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedJob.benefits.map((benefit, index) => (
                                      <Badge key={index} variant="outline" className="rounded-full">
                                        {benefit}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-4 pt-4 border-t">
                                <Button
                                  onClick={() => setEditMode(true)}
                                  className="bg-blue-500 hover:bg-blue-600"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar Vaga
                                </Button>

                                {selectedJob.status === 'Ativa' && (
                                  <Button
                                    variant="outline"
                                    onClick={() => updateJobStatus(selectedJob.id, 'Pausada')}
                                    className="text-yellow-600 hover:text-yellow-700"
                                  >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pausar
                                  </Button>
                                )}

                                {selectedJob.status === 'Pausada' && (
                                  <Button
                                    onClick={() => updateJobStatus(selectedJob.id, 'Ativa')}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Reativar
                                  </Button>
                                )}

                                <Button
                                  variant="outline"
                                  onClick={() => updateJobStatus(selectedJob.id, 'Finalizada')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Finalizar
                                </Button>

                                <Button
                                  variant="outline"
                                  onClick={() => deleteJob(selectedJob.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminJobsTable;
