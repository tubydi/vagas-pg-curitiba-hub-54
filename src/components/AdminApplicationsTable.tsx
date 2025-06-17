
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Download, Mail, Phone, Eye, Building2, Briefcase } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ApplicationStatus = Database['public']['Enums']['application_status'];

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  current_position: string;
  education: string;
  experience_years: number;
  skills: string[];
  cover_letter: string;
  linkedin: string;
  resume_url: string;
  status: ApplicationStatus;
  created_at: string;
  job_id: string;
  jobs: {
    title: string;
    companies: {
      name: string;
    };
  };
}

const AdminApplicationsTable = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const { toast } = useToast();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      console.log('Buscando TODAS as candidaturas para admin...');
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner (
            title,
            companies!inner (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar candidaturas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar candidaturas.",
          variant: "destructive",
        });
        return;
      }

      console.log('Total de candidaturas encontradas:', data?.length || 0);
      setApplications(data || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      console.log('Atualizando status da candidatura:', applicationId, 'para:', newStatus);
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar status da candidatura.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status atualizado",
        description: `Status da candidatura alterado para ${newStatus}.`,
      });

      fetchApplications();
      setSelectedApplication(null);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo":
        return "bg-blue-100 text-blue-800";
      case "Visualizado":
        return "bg-yellow-100 text-yellow-800";
      case "Contato":
        return "bg-green-100 text-green-800";
      case "Aprovado":
        return "bg-green-100 text-green-800";
      case "Rejeitado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const downloadResume = (resumeUrl: string, candidateName: string) => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    } else {
      toast({
        title: "Currículo não disponível",
        description: `${candidateName} não enviou currículo.`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(application => {
    const matchesSearch = searchTerm === "" || 
      application.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.jobs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.jobs.companies.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando TODAS as candidaturas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold">🔥 ADMIN - TODAS AS CANDIDATURAS</h2>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar candidaturas..."
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
              <SelectItem value="Novo">Novo</SelectItem>
              <SelectItem value="Visualizado">Visualizado</SelectItem>
              <SelectItem value="Contato">Contato</SelectItem>
              <SelectItem value="Aprovado">Aprovado</SelectItem>
              <SelectItem value="Rejeitado">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        📊 {filteredApplications.length} candidatura{filteredApplications.length !== 1 ? 's' : ''} encontrada{filteredApplications.length !== 1 ? 's' : ''} no banco de dados
      </div>

      <Card className="border-0 rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-500" />
            Candidaturas Resumidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Vaga</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold">
                          {getInitials(application.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{application.name}</p>
                        <p className="text-sm text-gray-500">{application.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{application.jobs.title}</TableCell>
                  <TableCell>{application.jobs.companies.name}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(application.status)} rounded-full px-3 py-1 font-semibold`}>
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(application.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Users className="h-6 w-6 text-blue-500" />
                              {application.name} - {application.jobs.title}
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedApplication && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3">Informações do Candidato</h4>
                                  <div className="space-y-3">
                                    <div className="flex items-center">
                                      <Avatar className="h-12 w-12 mr-3">
                                        <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold">
                                          {getInitials(selectedApplication.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium text-lg">{selectedApplication.name}</p>
                                        {selectedApplication.current_position && (
                                          <p className="text-gray-600">{selectedApplication.current_position}</p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <Mail className="w-5 h-5 mr-3 text-green-500" />
                                      <p>{selectedApplication.email}</p>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <Phone className="w-5 h-5 mr-3 text-purple-500" />
                                      <p>{selectedApplication.phone}</p>
                                    </div>
                                    
                                    {selectedApplication.education && (
                                      <div>
                                        <p className="font-medium">Educação:</p>
                                        <p className="text-gray-600">{selectedApplication.education}</p>
                                      </div>
                                    )}
                                    
                                    {selectedApplication.experience_years && (
                                      <div>
                                        <p className="font-medium">Experiência:</p>
                                        <p className="text-gray-600">{selectedApplication.experience_years} anos</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3">Detalhes da Vaga</h4>
                                  <div className="space-y-3">
                                    <div className="flex items-center">
                                      <Briefcase className="w-5 h-5 mr-3 text-blue-500" />
                                      <div>
                                        <p className="font-medium">{selectedApplication.jobs.title}</p>
                                        <p className="text-gray-600">{selectedApplication.jobs.companies.name}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <p className="font-medium">Status:</p>
                                      <Badge className={`${getStatusColor(selectedApplication.status)}`}>
                                        {selectedApplication.status}
                                      </Badge>
                                    </div>
                                    
                                    <div>
                                      <p className="font-medium">Data da Candidatura:</p>
                                      <p className="text-gray-600">{new Date(selectedApplication.created_at).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Habilidades</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedApplication.skills.map((skill, index) => (
                                      <Badge key={index} variant="outline" className="rounded-full">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedApplication.cover_letter && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Carta de Apresentação</h4>
                                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedApplication.cover_letter}</p>
                                </div>
                              )}

                              <div className="flex gap-4 pt-4 border-t">
                                <Select
                                  value={selectedApplication.status}
                                  onValueChange={(value) => updateApplicationStatus(selectedApplication.id, value as ApplicationStatus)}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Novo">Novo</SelectItem>
                                    <SelectItem value="Visualizado">Visualizado</SelectItem>
                                    <SelectItem value="Contato">Contato</SelectItem>
                                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <Button 
                                  variant="outline" 
                                  onClick={() => downloadResume(selectedApplication.resume_url, selectedApplication.name)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Baixar Currículo
                                </Button>
                                
                                {selectedApplication.linkedin && (
                                  <Button 
                                    variant="outline" 
                                    onClick={() => window.open(selectedApplication.linkedin, '_blank')}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver LinkedIn
                                  </Button>
                                )}
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

export default AdminApplicationsTable;
