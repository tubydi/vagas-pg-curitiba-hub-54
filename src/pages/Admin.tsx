
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Users, 
  Briefcase, 
  Shield, 
  Search, 
  Eye, 
  Edit, 
  Ban, 
  CheckCircle, 
  Trash2,
  LogOut,
  MapPin,
  Mail,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Mock data para demonstração
  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: "Tech Solutions",
      email: "contato@techsolutions.com",
      phone: "(42) 3333-4444",
      cnpj: "12.345.678/0001-90",
      city: "Ponta Grossa",
      status: "Ativa",
      jobsCount: 3,
      createdAt: "2024-01-10"
    },
    {
      id: 2,
      name: "Marketing Digital Plus",
      email: "info@marketingplus.com",
      phone: "(41) 9999-8888",
      cnpj: "98.765.432/0001-10",
      city: "Curitiba",
      status: "Pendente",
      jobsCount: 1,
      createdAt: "2024-01-15"
    }
  ]);

  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Desenvolvedor Full Stack",
      company: "Tech Solutions",
      location: "Ponta Grossa",
      salary: "R$ 8.000 - R$ 12.000",
      status: "Ativa",
      applicants: 15,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Analista de Marketing",
      company: "Marketing Digital Plus",
      location: "Curitiba",
      salary: "R$ 5.000 - R$ 7.000",
      status: "Pendente",
      applicants: 8,
      createdAt: "2024-01-16"
    }
  ]);

  const handleCompanyStatusChange = (companyId: number, newStatus: string) => {
    setCompanies(companies.map(company => 
      company.id === companyId 
        ? { ...company, status: newStatus }
        : company
    ));
    toast({
      title: "Status atualizado",
      description: `Status da empresa foi alterado para ${newStatus}`,
    });
  };

  const handleJobStatusChange = (jobId: number, newStatus: string) => {
    setJobs(jobs.map(job => 
      job.id === jobId 
        ? { ...job, status: newStatus }
        : job
    ));
    toast({
      title: "Vaga atualizada",
      description: `Status da vaga foi alterado para ${newStatus}`,
    });
  };

  const handleDeleteJob = (jobId: number) => {
    setJobs(jobs.filter(job => job.id !== jobId));
    toast({
      title: "Vaga removida",
      description: "A vaga foi removida permanentemente",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativa":
        return "bg-green-100 text-green-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      case "Bloqueada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ADMIN VAGAS PG
                </h1>
                <p className="text-sm text-gray-600">Painel Administrativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
                Administrador
              </span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Empresas</CardTitle>
              <div className="bg-blue-100 p-2 rounded-xl">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{companies.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50 border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Vagas</CardTitle>
              <div className="bg-green-100 p-2 rounded-xl">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{jobs.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50 border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Empresas Ativas</CardTitle>
              <div className="bg-purple-100 p-2 rounded-xl">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {companies.filter(c => c.status === "Ativa").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-yellow-50 border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Vagas Ativas</CardTitle>
              <div className="bg-yellow-100 p-2 rounded-xl">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {jobs.filter(j => j.status === "Ativa").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-2xl shadow-sm p-1">
            <TabsTrigger value="companies" className="rounded-xl font-semibold">Empresas</TabsTrigger>
            <TabsTrigger value="jobs" className="rounded-xl font-semibold">Vagas</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Gerenciar Empresas</h2>
              <div className="relative w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-6">
              {companies.map((company) => (
                <Card key={company.id} className="hover:shadow-xl transition-all duration-300 bg-white rounded-3xl border-0">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-2xl font-bold text-gray-900">{company.name}</h3>
                          <Badge className={`${getStatusColor(company.status)} rounded-full px-3 py-1 font-semibold`}>
                            {company.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-5 h-5 mr-3 text-blue-500" />
                            <span>{company.email}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-5 h-5 mr-3 text-blue-500" />
                            <span>{company.phone}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Building2 className="w-5 h-5 mr-3 text-blue-500" />
                            <span>{company.cnpj}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                            <span>{company.city}</span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-500">
                          <span className="font-semibold">{company.jobsCount} vagas publicadas</span> • 
                          Cadastrada em {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {company.status === "Ativa" ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCompanyStatusChange(company.id, "Bloqueada")}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCompanyStatusChange(company.id, "Ativa")}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Gerenciar Vagas</h2>
              <div className="relative w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar vagas..."
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-6">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-xl transition-all duration-300 bg-white rounded-3xl border-0">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
                          <Badge className={`${getStatusColor(job.status)} rounded-full px-3 py-1 font-semibold`}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                          <div className="text-gray-600">
                            <span className="font-semibold text-gray-900">Empresa:</span> {job.company}
                          </div>
                          <div className="text-gray-600">
                            <span className="font-semibold text-gray-900">Local:</span> {job.location}
                          </div>
                          <div className="text-gray-600">
                            <span className="font-semibold text-gray-900">Salário:</span> {job.salary}
                          </div>
                          <div className="text-gray-600">
                            <span className="font-semibold text-gray-900">Candidatos:</span> {job.applicants}
                          </div>
                        </div>

                        <div className="text-sm text-gray-500">
                          Criada em {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {job.status === "Ativa" ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleJobStatusChange(job.id, "Pausada")}
                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-xl"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleJobStatusChange(job.id, "Ativa")}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
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
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
