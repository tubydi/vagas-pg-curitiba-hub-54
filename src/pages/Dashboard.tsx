
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Briefcase, Plus, Eye, Edit, Trash2, LogOut, DollarSign, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import JobForm from "@/components/JobForm";
import CandidatesList from "@/components/CandidatesList";

const Dashboard = () => {
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const { toast } = useToast();
  
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Desenvolvedor Full Stack",
      location: "Ponta Grossa",
      salary: "R$ 8.000 - R$ 12.000",
      type: "CLT",
      workMode: "Híbrido",
      status: "Ativa",
      applicants: 15,
      createdAt: "2024-01-15",
      description: "Desenvolvimento de aplicações web modernas",
      requirements: "React, Node.js, TypeScript",
      benefits: ["Vale refeição", "Plano de saúde", "Home office"]
    },
    {
      id: 2,
      title: "Analista de Marketing",
      location: "Curitiba",
      salary: "R$ 5.000 - R$ 7.000",
      type: "CLT",
      workMode: "Presencial",
      status: "Pausada",
      applicants: 8,
      createdAt: "2024-01-10",
      description: "Gestão de campanhas digitais",
      requirements: "Google Ads, Facebook Ads, Analytics",
      benefits: ["Vale refeição", "Convênio médico"]
    }
  ]);

  const handleJobSubmit = (jobData: any) => {
    if (editingJob) {
      // Editando vaga existente
      setJobs(jobs.map(job => 
        job.id === editingJob.id 
          ? { ...job, ...jobData, id: editingJob.id }
          : job
      ));
      toast({
        title: "Vaga atualizada!",
        description: "A vaga foi atualizada com sucesso.",
      });
      setEditingJob(null);
    } else {
      // Criando nova vaga
      const newJob = {
        id: Date.now(),
        ...jobData,
        status: "Ativa",
        applicants: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setJobs([...jobs, newJob]);
      toast({
        title: "Vaga publicada!",
        description: "Sua vaga foi publicada com sucesso.",
      });
    }
    setShowJobForm(false);
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = (jobId: number) => {
    setJobs(jobs.filter(job => job.id !== jobId));
    toast({
      title: "Vaga removida",
      description: "A vaga foi removida com sucesso.",
    });
  };

  const toggleJobStatus = (jobId: number) => {
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? { ...job, status: job.status === "Ativa" ? "Pausada" : "Ativa" }
        : job
    ));
    toast({
      title: "Status atualizado",
      description: "O status da vaga foi atualizado.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                VAGAS PG
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium bg-white px-4 py-2 rounded-full shadow-sm">Tech Solutions Ltda</span>
              <Link to="/">
                <Button variant="outline" size="sm" className="rounded-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="animate-fade-in bg-gradient-to-br from-white to-green-50 border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Vagas Ativas</CardTitle>
              <div className="bg-green-100 p-2 rounded-xl">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {jobs.filter(job => job.status === "Ativa").length}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in bg-gradient-to-br from-white to-yellow-50 border-0 shadow-lg rounded-2xl" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Candidatos</CardTitle>
              <div className="bg-yellow-100 p-2 rounded-xl">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {jobs.reduce((total, job) => total + job.applicants, 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in bg-gradient-to-br from-white to-green-50 border-0 shadow-lg rounded-2xl" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Taxa de Conversão</CardTitle>
              <div className="bg-green-100 p-2 rounded-xl">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">12.5%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-2xl shadow-sm p-1">
            <TabsTrigger value="jobs" className="rounded-xl font-semibold">Minhas Vagas</TabsTrigger>
            <TabsTrigger value="candidates" className="rounded-xl font-semibold">Candidatos</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Gerenciar Vagas</h2>
              <Button 
                onClick={() => {
                  setEditingJob(null);
                  setShowJobForm(true);
                }}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Vaga
              </Button>
            </div>

            {showJobForm && (
              <Card className="animate-slide-up bg-white rounded-3xl shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-t-3xl">
                  <CardTitle className="text-2xl text-gray-900">
                    {editingJob ? "Editar Vaga" : "Publicar Nova Vaga"}
                  </CardTitle>
                  <CardDescription>
                    {editingJob ? "Atualize os dados da vaga" : "Preencha os dados da vaga para atrair os melhores candidatos"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <JobForm 
                    initialData={editingJob}
                    onSubmit={handleJobSubmit}
                    onCancel={() => {
                      setShowJobForm(false);
                      setEditingJob(null);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Jobs List */}
            <div className="space-y-6">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-xl transition-all duration-300 bg-white rounded-3xl border-0 overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
                          <Badge 
                            variant={job.status === "Ativa" ? "default" : "secondary"}
                            className={`${
                              job.status === "Ativa" 
                                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                : "bg-gray-100 text-gray-600"
                            } rounded-full px-3 py-1`}
                          >
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-5 h-5 mr-2 text-green-500" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                            <span className="font-semibold">{job.salary}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Building2 className="w-5 h-5 mr-2 text-green-500" />
                            <span>{job.type} - {job.workMode}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="w-5 h-5 mr-2 text-green-500" />
                            <span className="font-semibold">{job.applicants} candidatos</span>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          Criada em {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleJobStatus(job.id)}
                          className="rounded-xl"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditJob(job)}
                          className="rounded-xl"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="candidates">
            <CandidatesList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
