import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const AdminApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

      <div className="space-y-6">
        {filteredApplications.length === 0 ? (
          <Card className="border-0 rounded-3xl shadow-lg">
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhuma candidatura encontrada</h3>
              <p className="text-gray-500">
                Ajuste os filtros de busca para encontrar candidaturas.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="border-0 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-red-500">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-6 flex-1">
                    <Avatar className="h-16 w-16 ring-4 ring-green-100">
                      <AvatarFallback className="bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold">
                        {getInitials(application.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{application.name}</h3>
                        <Badge className={`${getStatusColor(application.status)} rounded-full px-3 py-1 font-semibold`}>
                          {application.status}
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                          🔥 ADMIN VIEW
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-5 h-5 mr-3 text-green-500" />
                          <span>{application.email}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-5 h-5 mr-3 text-green-500" />
                          <span>{application.phone}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <Briefcase className="w-5 h-5 mr-3 text-blue-500" />
                          <span className="font-semibold">Vaga:</span>
                          <span className="ml-2">{application.jobs.title}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Building2 className="w-5 h-5 mr-3 text-purple-500" />
                          <span className="font-semibold">Empresa:</span>
                          <span className="ml-2">{application.jobs.companies.name}</span>
                        </div>
                        {application.current_position && (
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">Cargo Atual:</span> {application.current_position}
                          </div>
                        )}
                        {application.experience_years && (
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">Experiência:</span> {application.experience_years} anos
                          </div>
                        )}
                        {application.education && (
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">Educação:</span> {application.education}
                          </div>
                        )}
                        {application.skills && application.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {application.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="rounded-full">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-500">
                        Candidatou-se em {new Date(application.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 ml-6">
                    <Select
                      value={application.status}
                      onValueChange={(value) => updateApplicationStatus(application.id, value as ApplicationStatus)}
                    >
                      <SelectTrigger className="w-40">
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
                      size="sm"
                      onClick={() => downloadResume(application.resume_url, application.name)}
                      className="rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Currículo
                    </Button>
                    
                    {application.linkedin && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(application.linkedin, '_blank')}
                        className="rounded-xl"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                    )}
                  </div>
                </div>
                
                {application.cover_letter && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">Carta de Apresentação:</h4>
                    <p className="text-sm text-gray-700">{application.cover_letter}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminApplications;
