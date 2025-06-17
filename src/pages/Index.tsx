
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Search, Users, TrendingUp, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  // Mock data para demonstração
  const featuredJobs = [
    {
      id: 1,
      title: "Desenvolvedor Full Stack",
      company: "Tech PG",
      location: "Ponta Grossa",
      salary: "R$ 8.000 - R$ 12.000",
      type: "CLT",
      featured: true
    },
    {
      id: 2,
      title: "Analista de Marketing Digital",
      company: "Marketing Solutions",
      location: "Curitiba",
      salary: "R$ 5.000 - R$ 7.000",
      type: "CLT",
      featured: true
    },
    {
      id: 3,
      title: "Designer UX/UI",
      company: "Creative Agency",
      location: "Ponta Grossa",
      salary: "R$ 6.000 - R$ 9.000",
      type: "PJ",
      featured: false
    }
  ];

  return (
    <div className="min-h-screen">
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
              <Link to="/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button className="company-gradient text-white">
                  Cadastrar Empresa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Conectamos talentos em
              <span className="block company-gradient bg-clip-text text-transparent">
                Ponta Grossa & Curitiba
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              O portal de empregos que une as melhores oportunidades da região com os profissionais mais qualificados.
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto animate-slide-up">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por cargo, empresa ou palavra-chave..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="md:w-48 h-12">
                      <SelectValue placeholder="Cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as cidades</SelectItem>
                      <SelectItem value="ponta-grossa">Ponta Grossa</SelectItem>
                      <SelectItem value="curitiba">Curitiba</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="h-12 px-8 company-gradient text-white">
                    Buscar Vagas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">150+</h3>
              <p className="text-gray-600">Empresas Cadastradas</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="bg-accent-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-accent-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">2.500+</h3>
              <p className="text-gray-600">Candidatos Ativos</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600">Vagas Publicadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 gradient-bg">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Vagas em Destaque
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-all duration-300 animate-slide-up">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-gray-900">{job.title}</CardTitle>
                      <CardDescription className="text-primary-600 font-medium">
                        {job.company}
                      </CardDescription>
                    </div>
                    {job.featured && (
                      <Badge className="bg-accent-100 text-accent-600 border-accent-200">
                        <Star className="w-3 h-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">{job.salary}</span>
                      <Badge variant="outline">{job.type}</Badge>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section for Companies */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Sua empresa precisa de talentos?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Publique suas vagas e encontre os melhores profissionais de Ponta Grossa e Curitiba.
          </p>
          <Link to="/register">
            <Button size="lg" className="company-gradient text-white px-8 py-3">
              Cadastrar Empresa Gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Building2 className="h-8 w-8 text-primary-600" />
            <h4 className="text-2xl font-bold company-gradient bg-clip-text text-transparent">
              Vagas PG
            </h4>
          </div>
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Vagas PG. Conectando talentos em Ponta Grossa e Curitiba.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
