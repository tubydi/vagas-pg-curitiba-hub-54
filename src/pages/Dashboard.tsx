
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Briefcase, Plus, Eye, Edit, Trash2, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import JobForm from "@/components/JobForm";
import CandidatesList from "@/components/CandidatesList";

const Dashboard = () => {
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Desenvolvedor Full Stack",
      location: "Ponta Grossa",
      salary: "R$ 8.000 - R$ 12.000",
      type: "CLT",
      status: "Ativa",
      applicants: 15,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Analista de Marketing",
      location: "Curitiba",
      salary: "R$ 5.000 - R$ 7.000",
      type: "CLT",
      status: "Pausada",
      applicants: 8,
      createdAt: "2024-01-10"
    }
  ]);

  const handleJobSubmit = (newJob: any) => {
    const job = {
      id: jobs.length + 1,
      ...newJob,
      status: "Ativa",
      applicants: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setJobs([...jobs, job]);
    setShowJobForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold company-gradient bg-clip-text text-transparent">
                Vagas PG
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Tech Solutions Ltda</span>
              <Link to="/">
                <Button variant="outline" size="sm">
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
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Vagas Ativas</CardTitle>
              <Briefcase className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {jobs.filter(job => job.status === "Ativa").length}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Candidatos</CardTitle>
              <Users className="h-4 w-4 text-accent-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {jobs.reduce((total, job) => total + job.applicants, 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Taxa de Conversão</CardTitle>
              <Building2 className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">12.5%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs">Minhas Vagas</TabsTrigger>
            <TabsTrigger value="candidates">Candidatos</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciar Vagas</h2>
              <Button 
                onClick={() => setShowJobForm(true)}
                className="company-gradient text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Vaga
              </Button>
            </div>

            {showJobForm && (
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle>Publicar Nova Vaga</CardTitle>
                  <CardDescription>
                    Preencha os dados da vaga para atrair os melhores candidatos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JobForm 
                    onSubmit={handleJobSubmit}
                    onCancel={() => setShowJobForm(false)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Jobs List */}
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                          <Badge 
                            variant={job.status === "Ativa" ? "default" : "secondary"}
                            className={job.status === "Ativa" ? "bg-green-100 text-green-800" : ""}
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Local:</span> {job.location}
                          </div>
                          <div>
                            <span className="font-medium">Salário:</span> {job.salary}
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span> {job.type}
                          </div>
                          <div>
                            <span className="font-medium">Candidatos:</span> {job.applicants}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
