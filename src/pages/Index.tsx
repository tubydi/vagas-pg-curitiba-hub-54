
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Search, Users, TrendingUp, Star, Clock, DollarSign, Brain, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const { toast } = useToast();

  // Mock data para demonstração
  const featuredJobs = [
    {
      id: 1,
      title: "Desenvolvedor Full Stack",
      company: "Tech PG",
      location: "Ponta Grossa",
      salary: "R$ 8.000 - R$ 12.000",
      type: "CLT",
      workMode: "Híbrido",
      featured: true,
      description: "Desenvolvimento de aplicações web modernas com React e Node.js",
      postedAt: "2 dias atrás"
    },
    {
      id: 2,
      title: "Analista de Marketing Digital",
      company: "Marketing Solutions",
      location: "Curitiba",
      salary: "R$ 5.000 - R$ 7.000",
      type: "CLT",
      workMode: "Presencial",
      featured: true,
      description: "Gestão de campanhas digitais e análise de métricas",
      postedAt: "1 dia atrás"
    },
    {
      id: 3,
      title: "Designer UX/UI",
      company: "Creative Agency",
      location: "Ponta Grossa",
      salary: "R$ 6.000 - R$ 9.000",
      type: "PJ",
      workMode: "Remoto",
      featured: false,
      description: "Criação de interfaces intuitivas e experiências digitais",
      postedAt: "3 dias atrás"
    },
    {
      id: 4,
      title: "Analista de Vendas",
      company: "Vendas Plus",
      location: "Curitiba",
      salary: "R$ 4.000 - R$ 6.000",
      type: "CLT",
      workMode: "Presencial",
      featured: false,
      description: "Prospecção de clientes e gestão de pipeline de vendas",
      postedAt: "1 semana atrás"
    }
  ];

  const handleApplyJob = (jobId: number, jobTitle: string) => {
    toast({
      title: "Candidatura enviada!",
      description: `Sua candidatura para "${jobTitle}" foi enviada com sucesso.`,
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
            <div className="flex items-center space-x-3">
              <Link to="/vpg-ia">
                <Button variant="outline" className="rounded-full border-green-200 hover:bg-green-50 hidden md:flex">
                  <Brain className="w-4 h-4 mr-2" />
                  VPG IA
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="rounded-full border-green-200 hover:bg-green-50">
                  Entrar
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg">
                  Cadastrar Empresa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search - Moved up and made more prominent */}
      <section className="bg-gradient-to-br from-green-500 via-green-600 to-yellow-500 text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in mb-8">
            <h2 className="text-3xl md:text-6xl font-bold mb-4 leading-tight">
              Encontre sua vaga ideal
              <span className="block text-yellow-300 text-2xl md:text-5xl">
                em Ponta Grossa & Curitiba
              </span>
            </h2>
            <p className="text-lg md:text-xl text-green-100 mb-6 max-w-2xl mx-auto">
              As melhores oportunidades de emprego da região estão aqui
            </p>
          </div>

          {/* Search Section - More prominent */}
          <div className="max-w-5xl mx-auto animate-slide-up mb-8">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md rounded-3xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Buscar por cargo, empresa ou palavra-chave..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-14 rounded-2xl border-gray-200 text-lg"
                    />
                  </div>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="md:w-56 h-14 rounded-2xl border-gray-200 text-lg">
                      <SelectValue placeholder="Cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as cidades</SelectItem>
                      <SelectItem value="ponta-grossa">Ponta Grossa</SelectItem>
                      <SelectItem value="curitiba">Curitiba</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="h-14 px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl text-lg font-semibold shadow-lg">
                    Buscar Vagas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick stats - smaller and less prominent */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <div className="text-2xl font-bold">150+</div>
              <div className="text-sm text-green-100">Empresas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <div className="text-2xl font-bold">2.5k+</div>
              <div className="text-sm text-green-100">Candidatos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-green-100">Vagas</div>
            </div>
          </div>
        </div>
      </section>

      {/* VPG IA Banner - New section */}
      <section className="py-8 bg-gradient-to-r from-gray-900 via-green-900 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 rounded-2xl">
                <Brain className="h-8 w-8 text-gray-900" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-yellow-300">VPG IA</h3>
                <p className="text-gray-300">Inteligência Artificial para seu sucesso profissional</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/vpg-ia">
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-6 py-3 text-lg font-bold rounded-2xl shadow-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Experimentar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs - Now the main focus */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-white to-green-50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-4">
              Vagas em Destaque
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Oportunidades imperdíveis que chegaram recentemente
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {featuredJobs.map((job, index) => (
              <Card key={job.id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="bg-gradient-to-br from-gray-50 to-green-50 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                        {job.title}
                      </CardTitle>
                      <CardDescription className="text-green-600 font-semibold text-lg mt-1">
                        {job.company}
                      </CardDescription>
                    </div>
                    {job.featured && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-0 rounded-full px-3 py-1 shrink-0">
                        <Star className="w-3 h-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Clock className="w-4 h-4 mr-1" />
                    {job.postedAt}
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6 line-clamp-2">{job.description}</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-gray-700">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-green-500" />
                        <span className="font-medium">{job.location}</span>
                      </div>
                      <Badge variant="outline" className="rounded-full">
                        {job.workMode}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-gray-700">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                        <span className="font-bold text-lg text-green-600">{job.salary}</span>
                      </div>
                      <Badge variant="outline" className="rounded-full">
                        {job.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleApplyJob(job.id, job.title)}
                    className="w-full mt-6 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Candidatar-se Agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-full px-8 py-3 text-lg font-semibold border-green-200 hover:bg-green-50 hover:border-green-300"
            >
              Ver Todas as Vagas
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section for Companies */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-yellow-600/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Sua empresa precisa de talentos?
          </h3>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Publique suas vagas e encontre os melhores profissionais de Ponta Grossa e Curitiba.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-8 py-4 text-xl font-bold rounded-full shadow-2xl">
                Cadastrar Empresa Gratuitamente
              </Button>
            </Link>
            <Link to="/vpg-ia">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900 px-8 py-4 text-xl font-bold rounded-full">
                <Brain className="w-5 h-5 mr-2" />
                Usar VPG IA
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
              VAGAS PG
            </h4>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 VAGAS PG. Conectando talentos em Ponta Grossa e Curitiba.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
